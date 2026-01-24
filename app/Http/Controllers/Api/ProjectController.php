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

class ProjectController extends Controller
{
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
        // ▲▲▲ 追加ここまで ▲▲▲

        // 2. トランザクション開始 (失敗したら全部なかったことにする)
        return DB::transaction(function () use ($validated, $request) {
            
            // プロジェクト作成
            $project = Project::create([
                // ログイン中のユーザーIDを入れる (auth()->id())
                'owner_id' => $request->user()->id, // ※注意: 後で解説
                'title' => $validated['title'],
                'description' => $validated['description'],
                // ★追加: そのまま保存
                'thumbnail_url' => $validated['thumbnail_url'],

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
        // ▲▲▲ 追加ここまで ▲▲▲

        return DB::transaction(function () use ($validated, $project, $request) {
            // 2. 基本情報の更新
            $project->update([
                'title' => $validated['title'],
                'description' => $validated['description'],
                'thumbnail_url' => $validated['thumbnail_url'],
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

        // 2. 環境変数からトークンを取得
        $token = env('GITHUB_TOKEN');

        // 3. GitHub APIを叩く (リポジトリ情報の取得)
        // URL例: https://api.github.com/repos/laravel/laravel
        $repoResponse = Http::withToken($token)->get("https://api.github.com/repos/{$project->github_repo}");

        // 4. GitHub APIを叩く (コミット履歴の取得 - 最新5件)
        // URL例: https://api.github.com/repos/laravel/laravel/commits
        $commitsResponse = Http::withToken($token)->get("https://api.github.com/repos/{$project->github_repo}/commits", [
            'per_page' => 5, // 最新5件だけ取得
        ]);

        // 5. エラーハンドリング (リポジトリが見つからない場合など)
        if ($repoResponse->failed()) {
            return response()->json(['message' => 'GitHub repository not found'], 404);
        }

        // 6. 必要なデータだけを整形して返す
        return response()->json([
            'repo' => $repoResponse->json(),       // リポジトリの基本情報 (Star数など)
            'commits' => $commitsResponse->json() // コミット履歴
        ]);
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
        $rssUrl = 'https://zenn.dev/feed';

        try {
            // 1. RSSデータを取得 (XML形式の文字列)
            $response = Http::get($rssUrl);
            
            if ($response->failed()) {
                return response()->json(['error' => 'Failed to fetch RSS'], 500);
            }

            // 2. XML文字列をPHPのオブジェクトに変換
            $xml = simplexml_load_string($response->body());
            
            // 3. JSONに変換して返すためにデータを整形
            $articles = [];
            
            // 記事は <item> タグの中にある (上位5件だけ取得)
            $count = 0;
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
                    'pubDate' => date('Y-m-d', strtotime((string)$item->pubDate)),
                    'creator' => $dc ? (string)$dc->creator : '',
                    'thumbnail' => $imageUrl,
                ];
                $count++;
            }

            return response()->json(['articles' => $articles]);

        } catch (\Exception $e) {
            // パースエラーなど
            return response()->json(['error' => $e->getMessage()], 500);
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
}