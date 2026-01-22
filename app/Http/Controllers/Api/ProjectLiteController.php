<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Support\Facades\Http;

class ProjectLiteController extends Controller
{
    /**
     * Project-Liteからボード情報を取得するプロキシAPI
     */
    public function getBoardInfo(Project $project)
    {
        // 1. ボードIDが設定されていない場合
        if (empty($project->pl_board_id)) {
            return response()->json(['message' => 'Project-Lite Board ID not set'], 404);
        }

        // 2. Project-LiteのAPI URL (本番環境のURL)
        // ※将来的に .env で切り替えられるようにしても良いですが、一旦直書きで進めます
        $baseUrl = 'https://project-lite.ikshowcase.site';
        $apiUrl = "{$baseUrl}/api/external/boards/{$project->pl_board_id}/summary";

        try {
            // 3. APIリクエスト実行
            $response = Http::timeout(5)->get($apiUrl);

            if ($response->failed()) {
                return response()->json([
                    'message' => 'Failed to fetch data from Project-Lite',
                    'status' => $response->status()
                ], $response->status());
            }

            // 4. 取得したデータをそのままフロントエンドに返す
            return response()->json($response->json());

        } catch (\Exception $e) {
            return response()->json(['message' => 'Connection error: ' . $e->getMessage()], 500);
        }
    }
}