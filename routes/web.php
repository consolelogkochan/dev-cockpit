<?php

use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;

// ▼▼▼ 1. 先に特定のルート（セットアップ用）を書く ▼▼▼
Route::get('/setup-production-999', function () {
    $output = '<h1>Setup Start</h1>';

    // 1. キャッシュクリア
    Artisan::call('config:clear');
    Artisan::call('route:clear');
    $output .= 'Config/Route Cleared.<br>';

    // 2. ストレージリンク作成
    try {
        Artisan::call('storage:link');
        $output .= 'Storage Link Created: '.Artisan::output().'<br>';
    } catch (\Exception $e) {
        $output .= 'Storage Link Error: '.$e->getMessage().'<br>';
    }

    // 3. マイグレーション実行
    try {
        Artisan::call('migrate', ['--force' => true]);
        $output .= 'Migration: <br><pre>'.Artisan::output().'</pre><br>';
    } catch (\Exception $e) {
        return 'Migration Error: '.$e->getMessage();
    }

    // 4. 管理者アカウントの作成
    $adminEmail = 'ik.tenzan.096@gmail.com';
    $adminPass = 'Iktoloveru096';

    if (! User::where('email', $adminEmail)->exists()) {
        User::create([
            'name' => 'Admin User',
            'email' => $adminEmail,
            'password' => Hash::make($adminPass),
            'email_verified_at' => now(),
        ]);
        $output .= "Admin User Created ($adminEmail).<br>";
    } else {
        $output .= 'Admin User already exists.<br>';
    }

    return $output.'<br>Done!';
});

// ▼▼▼ 2. 最後に「それ以外全部」を受け取るルートを書く ▼▼▼
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
