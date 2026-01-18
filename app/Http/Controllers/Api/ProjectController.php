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
        $projects = $query->paginate(9);

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

        // https://www.figma.com/file/abc12345/Title... から "abc12345" を抜く
        preg_match('/figma\.com\/file\/([0-9a-zA-Z]+)/', $url, $matches);

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
            'figma_url'   => 'nullable|string',
            // notion_pages は配列であり、各要素は id キーを持つ必要がある
            'notion_pages' => 'nullable|array',
            'notion_pages.*.id' => 'nullable|string',
        ]);

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

                'pl_board_id' => $validated['pl_board_id'],
                
                // さっき作ったメソッドでIDだけ抽出して保存
                'github_repo' => $this->extractGitHubRepo($validated['github_repo']),
                'figma_file_key' => $this->extractFigmaKey($validated['figma_url']),
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
            'figma_url'   => 'nullable|string',
            'notion_pages' => 'nullable|array',
            'notion_pages.*.id' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $project) {
            // 2. 基本情報の更新
            $project->update([
                'title' => $validated['title'],
                'description' => $validated['description'],
                'thumbnail_url' => $validated['thumbnail_url'],
                'pl_board_id' => $validated['pl_board_id'],
                'github_repo' => $this->extractGitHubRepo($validated['github_repo']),
                'figma_file_key' => $this->extractFigmaKey($validated['figma_url']),
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
}