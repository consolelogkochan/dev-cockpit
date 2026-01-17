<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProjectController;

// ログインしている人だけがアクセスできるエリア
Route::middleware(['auth:sanctum'])->group(function () {
    
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
});