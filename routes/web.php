<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

Route::get('/', function () {
    return view('welcome');
});

// SPA認証用のルート (セッションが必要なため web.php に記述)
Route::post('/auth/login', [AuthController::class, 'login']); 
Route::post('/auth/logout', [AuthController::class, 'logout']);

Route::post('/auth/register', [AuthController::class, 'register']);

// 3. 【重要】キャッチオールルート
// 上記のAPI以外のあらゆるURL ('/{any}') が来たら、Reactの土台(welcome)を返す
// これを一番最後に書くのが鉄則です！
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');