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

// 1. ★追加: ログインページの場所を明確にする
// これで route('login') が呼ばれたら、迷わず '/login' に行けるようになります
Route::get('/login', function () {
    return view('welcome');
})->name('login');

// 2. キャッチオールルート (名前は付けない、または login 以外にする)
// 一番最後に書く
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');