<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Http\Resources\ProjectResource;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use App\Models\NotionPage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use App\Traits\UploadsImages;

class ProjectController extends Controller
{
    use UploadsImages; // ★追加: Traitを使用

    // プロジェクト一覧を取得する
    public function index(Request $request)
    {
        $query = Project::latest();

        // 検索キーワードがあれば絞り込む
        if ($request->has('search')) {
            $value = $request->get('search');
            $query->where(function (Builder $q) use ($value) {
                $q->where('title', 'like', "%{$value}%")
                  ->orWhere('description', 'like', "%{$value}%");
            });
        }

        // 1ページあたり9件取得 (3列×3行で表示がいいため)
        // paginate() を使うと、自動的に meta (ページ数情報) が付与されます
        $projects = Project::with('notionPages')
            ->orderBy('created_at', 'desc')
            ->paginate(9);

        return ProjectResource::collection($projects);
    }

    /**
     * GitHubのURLから "user/repo" を抽出する
     */
    private function extractGitHubRepo(?string $url): ?string
    {
        if (empty($url)) return null;

        // すでに "user/repo" の形式ならそのまま返す
        if (!str_contains($url, 'github.com')) {
            return $url; 
        }

        // 正規表現で抽出
        // 意味: github.com/ の後ろにある「スラッシュを含まない文字列 / スラッシュを含まない文字列」を探す
        preg_match('/github\.com\/([^\/]+\/[^\/]+)/', $url, $matches);

        return $matches[1] ?? null;
    }

    /**
     * FigmaのURLから "File Key" を抽出する
     */
    private function extractFigmaKey(?string $url): ?string
    {
        if (empty($url)) return null;

        // 修正前: '/figma\.com\/file\/([0-9a-zA-Z]+)/'
        // ▼▼▼ 修正後: 'file' または 'design' に対応させる ▼▼▼
        preg_match('/figma\.com\/(?:file|design)\/([0-9a-zA-Z]+)/', $url, $matches);

        return $matches[1] ?? null;
    }

    public function store(Request $request)
    {
        // 1. バリデーション (入力チェック)
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            // ★追加: URL形式であることをチェック (空でもOK)
            'thumbnail_url' => 'nullable|url|max:2048',
            'thumbnail_file' => 'nullable|image|max:2048', // ★追加: ファイルアップロード用 (2MBまで)

            'github_repo' => 'nullable|string',
            'pl_board_id' => 'nullable|string',
            'figma_file_key' => 'nullable|string',
            // notion_pages は配列であり、各要素は id キーを持つ必要がある
            'notion_pages' => 'nullable|array',
            'notion_pages.*.id' => 'nullable|string',
        ]);

        // ▼▼▼ 追加: IDの抽出処理 ▼▼▼
        if ($request->has('pl_board_id')) {
            $request->merge([
                'pl_board_id' => $this->extractBoardId($request->pl_board_id)
            ]);
        }

        // ★追加: 画像アップロード処理
        // ファイルがあればアップロードし、そのパスを thumbnail_url として使う
        if ($request->hasFile('thumbnail_file')) {
            $path = $this->uploadImage($request, 'thumbnail_file', 'projects');
            if ($path) {
                $validated['thumbnail_url'] = $path;
            }
        }

        // 2. トランザクション開始 (失敗したら全部なかったことにする)
        return DB::transaction(function () use ($validated, $request) {
            
            // プロジェクト作成
            $project = Project::create([
                // ログイン中のユーザーIDを入れる (auth()->id())
                'owner_id' => $request->user()->id, // ※注意: 後で解説
                'title' => $validated['title'],
                'description' => $validated['description'],
                // ★追加: そのまま保存
                'thumbnail_url' => $validated['thumbnail_url'] ?? null,

                // ★修正: $validated ではなく、$request から取得する
                'pl_board_id' => $request->pl_board_id,
                
                // さっき作ったメソッドでIDだけ抽出して保存
                'github_repo' => $this->extractGitHubRepo($validated['github_repo']),
                'figma_file_key' => $this->extractFigmaKey($validated['figma_file_key']),
            ]);

            // Notionページの保存 (配列をループして保存)
            if (!empty($validated['notion_pages'])) {
                foreach ($validated['notion_pages'] as $page) {
                    if (!empty($page['id'])) {
                        NotionPage::create([
                            'project_id' => $project->id,
                            'page_id' => $page['id'],
                        ]);
                    }
                }
            }

            // 作成したデータをリソース形式で返す
            return new ProjectResource($project);
        });
    }

    /**
     * プロジェクトを削除する
     */
    public function destroy(Project $project)
    {
        // ★必要であれば画像削除処理を追加
        if ($project->thumbnail_url && str_starts_with($project->thumbnail_url, '/storage/')) {
            $this->deleteImage($project->thumbnail_url);
        }

        // プロジェクトを削除
        // (NotionPageはマイグレーションで onDelete('cascade') を設定したので自動で消えます)
        $project->delete();

        return response()->noContent(); // 204 No Content (成功したけど返すデータはないよ)
    }

    /**
     * プロジェクトを更新する
     */
    public function update(Request $request, Project $project)
    {
        // 1. バリデーション (storeと同じルール)
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'thumbnail_url' => 'nullable|url|max:2048',
            'thumbnail_file' => 'nullable|image|max:2048', // ★追加
            'github_repo' => 'nullable|string',
            'pl_board_id' => 'nullable|string',
            'figma_file_key' => 'nullable|string',
            'notion_pages' => 'nullable|array',
            'notion_pages.*.id' => 'nullable|string',
        ]);

        // ▼▼▼ 追加: IDの抽出処理 ▼▼▼
        if ($request->has('pl_board_id')) {
            $request->merge([
                'pl_board_id' => $this->extractBoardId($request->pl_board_id)
            ]);
        }
        
        // ★追加: 画像アップロード処理
        if ($request->hasFile('thumbnail_file')) {
            // 古い画像がローカルファイルなら削除する (任意)
            // if (str_starts_with($project->thumbnail_url, '/storage/')) {
            //     $this->deleteImage($project->thumbnail_url);
            // }

            $path = $this->uploadImage($request, 'thumbnail_file', 'projects');
            if ($path) {
                $validated['thumbnail_url'] = $path;
            }
        }

        return DB::transaction(function () use ($validated, $project, $request) {
            // 2. 基本情報の更新
            $project->update([
                'title' => $validated['title'],
                'description' => $validated['description'],
                'thumbnail_url' => $validated['thumbnail_url'] ?? $project->thumbnail_url,
                // ★修正: ここも $request を使う
                'pl_board_id' => $request->pl_board_id,
                'github_repo' => $this->extractGitHubRepo($validated['github_repo']),
                'figma_file_key' => $this->extractFigmaKey($validated['figma_file_key']),
            ]);

            // 3. Notionページの同期 (洗い替え戦略)
            if (isset($validated['notion_pages'])) {
                // 一旦、このプロジェクトのNotionページを全削除
                $project->notionPages()->delete();

                // 新しいリストを作成
                foreach ($validated['notion_pages'] as $page) {
                    if (!empty($page['id'])) {
                        $project->notionPages()->create([
                            'page_id' => $page['id'],
                        ]);
                    }
                }
                // ★追加: Notionページ構成が変わったので、キャッシュを削除して次回再取得させる
                Cache::forget("project_{$project->id}_notion_info");
            }

            // 更新されたデータを返す
            return new ProjectResource($project);
        });
    }

    /**
     * プロジェクト詳細を取得
     */
    public function show(Project $project)
    {
        // 紐付いているNotionページ情報も一緒に取得 (Eager Loading)
        $project->load('notionPages');

        // JSONとして返す
        return new ProjectResource($project);
    }

    /**
     * GitHubからリポジトリ情報を取得する
     */
    public function getGithubInfo(Project $project)
    {
        // 1. GitHubリポジトリが登録されていない場合はエラー
        if (empty($project->github_repo)) {
            return response()->json(['message' => 'GitHub repository not linked'], 404);
        }

        // 2. Configからトークン取得
        $token = config('services.github.token');

        // トークン設定漏れチェック (ログレベル: Critical)
        if (empty($token)) {
            Log::critical('GitHub Token is not configured.');
            return response()->json(['message' => 'Server Configuration Error'], 500);
        }

        try {
            // 3. APIリクエスト設定 (共通化)
            // GitHub APIはたまに遅いので、タイムアウトは少し長めの10秒に設定
            $http = Http::withToken($token)
                ->timeout(10)
                ->withHeaders(['Accept' => 'application/vnd.github.v3+json']);

            // 4. 並列リクエスト (本来は Http::pool が推奨ですが、今回は順次実行で堅実にいきます)
            
            // A. リポジトリ情報の取得
            $repoResponse = $http->get("https://api.github.com/repos/{$project->github_repo}");

            if ($repoResponse->failed()) {
                Log::warning('GitHub Repo Fetch Failed', [
                    'repo' => $project->github_repo,
                    'status' => $repoResponse->status()
                ]);
                return response()->json(['message' => 'Repository not found or access denied'], $repoResponse->status());
            }

            // B. コミット履歴の取得 (最新5件)
            $commitsResponse = $http->get("https://api.github.com/repos/{$project->github_repo}/commits", [
                'per_page' => 5,
            ]);

            // コミット取得失敗は、リポジトリが生きていれば空配列として返す(画面を落とさない)運用もアリですが、
            // 今回はエラーとして扱います
            if ($commitsResponse->failed()) {
                Log::warning('GitHub Commits Fetch Failed', ['repo' => $project->github_repo]);
                // コミットだけ取れない場合は空で返すフォールバック戦略
                $commitsData = []; 
            } else {
                $commitsData = $commitsResponse->json();
            }

            // 5. データ返却
            return response()->json([
                'repo' => $repoResponse->json(),
                'commits' => $commitsData
            ]);

        } catch (\Exception $e) {
            Log::error('GitHub API Exception: ' . $e->getMessage());
            return response()->json(['message' => 'Service Unavailable'], 503);
        }
    }

    /**
     * NotionAPIからページ情報を取得する
     */
    public function getNotionInfo(Project $project)
    {
        // 1. 紐付いているNotionページIDを取得
        $project->load('notionPages');
        
        if ($project->notionPages->isEmpty()) {
            return response()->json(['pages' => []]);
        }

        // ★キャッシュキーの生成 (プロジェクトごとにユニーク)
        $cacheKey = "project_{$project->id}_notion_info";

        // ★ Cache::remember でラップする
        // 第2引数は保存期間(秒)。ここでは 3600秒 = 1時間 とします。
        // キャッシュがあればそれを返し、なければ中の処理を実行して保存します。
        $results = Cache::remember($cacheKey, 3600, function () use ($project) {
            
            $token = env('NOTION_API_TOKEN');
            $version = env('NOTION_VERSION', '2022-06-28');
            $data = [];

            foreach ($project->notionPages as $page) {
                // APIリクエスト
                $response = Http::withToken($token)
                    ->withHeaders(['Notion-Version' => $version])
                    ->get("https://api.notion.com/v1/pages/{$page->page_id}");

                if ($response->successful()) {
                    $json = $response->json();
                    $data[] = [
                        'id' => $json['id'],
                        'url' => $json['url'],
                        'icon' => $json['icon'] ?? null,
                        'cover' => $json['cover'] ?? null,
                        'last_edited_time' => $json['last_edited_time'],
                        'properties' => $json['properties'] ?? [],
                    ];
                } else {
                    $data[] = [
                        'id' => $page->page_id,
                        'error' => 'Access denied or Not found',
                        'status' => $response->status(),
                    ];
                }
            }
            return $data;
        });

        return response()->json(['pages' => $results]);
    }

    /**
     * ZennのRSSフィードを取得してパースする
     */
    public function getNews()
    {
        // ZennのテックトレンドのRSS
        // ★修正: Configから取得 (第2引数はデフォルト値)
        $rssUrl = config('services.zenn.rss_url', 'https://zenn.dev/feed');

        try {
            // 1. RSSデータを取得 (XML形式の文字列)
            // HTTPリクエスト (タイムアウト5秒)
            $response = Http::timeout(5)->get($rssUrl);
            
            if ($response->failed()) {
                // ★追加: ログ記録
                Log::warning('Zenn RSS Fetch Failed', ['status' => $response->status()]);
                return response()->json(['error' => 'Failed to fetch RSS'], 502); // 502 Bad Gateway
            }

            // 2. XML文字列をPHPのオブジェクトに変換
            // simplexml_load_string は失敗時に false を返すのでチェック
            $xml = @simplexml_load_string($response->body()); // @でWarning抑制

            if ($xml === false) {
                 Log::error('Zenn RSS Parse Error: Invalid XML');
                 return response()->json(['error' => 'Invalid RSS format'], 500);
            }
            
            // 3. JSONに変換して返すためにデータを整形
            $articles = [];
            $count = 0;

            // channel->item が存在しない場合のガード
            if (!isset($xml->channel->item)) {
                return response()->json(['articles' => []]);
            }
            
            // 記事は <item> タグの中にある (上位5件だけ取得)
            foreach ($xml->channel->item as $item) {
                if ($count >= 5) break;

                // 名前空間 (dc:creator や media:content など) を扱うための準備
                $namespaces = $item->getNameSpaces(true);
                $dc = $item->children($namespaces['dc'] ?? null);
                
                // 画像URLの取得トライ (RSSの構造によるので簡易的に)
                $imageUrl = (string)$item->enclosure['url'] ?? null;

                $articles[] = [
                    'title' => (string)$item->title,
                    'link' => (string)$item->link,
                    // 日付変換エラー対策
                    'pubDate' => (string)$item->pubDate ? date('Y-m-d', strtotime((string)$item->pubDate)) : '',
                    'creator' => $dc ? (string)$dc->creator : '',
                    'thumbnail' => $imageUrl,
                ];
                $count++;
            }

            return response()->json(['articles' => $articles]);

        } catch (\Exception $e) {
            // ★追加: 例外ログ
            Log::error('News Fetch Exception: ' . $e->getMessage());
            return response()->json(['error' => 'Service Unavailable'], 503);
        }
    }

    /**
     * URLからProject-LiteのボードID(数字)を抽出する
     */
    private function extractBoardId($value)
    {
        // 空ならnull
        if (empty($value)) return null;

        // URL形式 (.../boards/123...) から数字を抽出
        if (preg_match('/\/boards\/(\d+)/', $value, $matches)) {
            return (int) $matches[1];
        }

        // 既に数字ならそのまま返す
        return (int) $value;
    }

    /**
     * サイドバー用：全プロジェクトの軽量リストを取得
     */
    public function list()
    {
        // ID, タイトル, アイコン(サムネイル) だけを取得
        // 更新順（新しいものが上）
        $projects = Project::select('id', 'title', 'thumbnail_url')
            ->orderBy('updated_at', 'desc')
            ->limit(10) // ★追加: 10件に制限
            ->get();

        return response()->json($projects);
    }
}