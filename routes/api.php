<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// ログインしている人だけがアクセスできるエリア
Route::middleware(['auth:sanctum'])->group(function () {
    // 自分の情報を取得
    Route::get('/user', [AuthController::class, 'me']);
});