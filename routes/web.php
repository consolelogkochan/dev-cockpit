<?php

use Illuminate\Support\Facades\Route;

// Reactのエントリーポイントを返す（これだけでOK）
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');