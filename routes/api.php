<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ProjectLiteController;

// 認証不要なルートに追加
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// ★追加: メール認証用ルート (名前付きルート 'verification.verify' が必須)
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->name('verification.verify');

// ★追加: パスワードリセット関連
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// ログインしている人だけがアクセスできるエリア
Route::middleware(['auth:sanctum'])->group(function () {

    // ★ログアウトはここ！ (ログイン中の人しかログアウトできないため)
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    
    // 自分の情報を取得 (Controllerを使わず、ここで直接返すのが一番シンプルです)
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // 今後、他の認証が必要なAPIはここに追加していきます
    // 例: Route::get('/todos', ...);
    Route::get('/projects', [ProjectController::class, 'index']);

    // ▼ ★追加: 新規保存 (POST)
    // フロントエンドからの post('/api/projects') はここに着地します
    Route::post('/projects', [ProjectController::class, 'store']);

    // ▼ ★追加: 詳細取得 (GET)
    Route::get('/projects/{project}', [ProjectController::class, 'show']);

    // ▼ ★追加: GitHub情報取得用
    Route::get('/projects/{project}/github', [ProjectController::class, 'getGithubInfo']);

    // ▼ ★追加: Notion情報取得用
    Route::get('/projects/{project}/notion', [ProjectController::class, 'getNotionInfo']);

    // ▼ ★追加: ニュース取得用 (プロジェクトIDは不要)
    Route::get('/news', [ProjectController::class, 'getNews']);

    // ▼ ★追加: Project-Lite連携用
    Route::get('/projects/{project}/project-lite', [ProjectLiteController::class, 'getBoardInfo']);

    // ▼ ★追加: 削除 (DELETE)
    // /projects/{project} の {project} 部分にIDが入ります
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);

    // ▼ ★追加: 更新 (PUT)
    Route::put('/projects/{project}', [ProjectController::class, 'update']);

});