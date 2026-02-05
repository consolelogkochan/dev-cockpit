<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log; // ログ用

class ProjectLiteController extends Controller
{
    /**
     * Project-Liteからボード情報を取得するプロキシAPI
     */
    public function getBoardInfo(Request $request, Project $project)
    {
        // 1. 認可チェック (Authorization)
        // ログインユーザーがこのプロジェクトの所有者でなければ 403 Forbidden
        // if ($request->user()->id !== $project->user_id) {
        //     return response()->json(['message' => 'Unauthorized action.'], 403);
        // }

        // 1. ボードIDが設定されていない場合
        if (empty($project->pl_board_id)) {
            return response()->json(['message' => 'Project-Lite Board ID not set'], 404);
        }

        // 3. 環境設定からURLを取得
        $baseUrl = config('services.project_lite.url');

        // config設定漏れ対策
        if (!$baseUrl) {
             Log::critical('Project-Lite API URL is not configured in services.php');
             return response()->json(['message' => 'Server Configuration Error'], 500);
        }

        $apiUrl = "{$baseUrl}/api/external/boards/{$project->pl_board_id}/summary";

        try {
            // 4. APIリクエスト (タイムアウト設定付き)
            $response = Http::timeout(5)->get($apiUrl);

            if ($response->failed()) {
                // エラー内容をログに残す（デバッグ用）
                Log::warning('Project-Lite API Error', [
                    'project_id' => $project->id,
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

                return response()->json(
                    $response->json(), 
                    $response->status()
                );
            }

            // 5. 取得したデータをそのままフロントエンドに返す
            return response()->json($response->json());

        } catch (\Exception $e) {
            // 例外発生時もログに残す
            Log::error('Project-Lite Connection Exception', [
                'project_id' => $project->id,
                'error' => $e->getMessage()
            ]);

            return response()->json(['message' => 'Connection error occurred'], 500);
        }
    }
}