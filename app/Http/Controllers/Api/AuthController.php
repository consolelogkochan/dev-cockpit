<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * ログイン処理
     */
    public function login(Request $request)
    {
        // 1. バリデーション (入力チェック)
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        // 2. 認証試行
        if (Auth::attempt($credentials)) {
            // セッションIDを再生成 (セキュリティ対策)
            $request->session()->regenerate();

            // 成功したらユーザー情報を返す
            return response()->json([
                'message' => 'Login successful',
                'user' => Auth::user(),
            ]);
        }

        // 3. 失敗時のエラー
        throw ValidationException::withMessages([
            'email' => ['メールアドレスまたはパスワードが間違っています。'],
        ]);
    }

    /**
     * ログアウト処理
     */
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out']);
    }

    /**
     * ログイン中のユーザー情報を取得
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // 登録後、そのままログインさせる
        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'message' => 'Registered successfully',
            'user' => $user,
        ], 201);
    }
}