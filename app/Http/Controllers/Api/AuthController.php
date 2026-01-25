<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use App\Models\Invitation; // ★追加
use Illuminate\Auth\Events\Registered; // ★追加
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password; // ★追加
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * ログイン処理
     */
    public function login(Request $request)
    {
        // 1. バリデーション
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        // 2. 認証試行 (★修正: is_active が true (1) であることも条件に追加)
        // Laravelのattemptは、パスワード以外の項目を自動的にWHERE句として扱います
        $credentials = [
            'email' => $request->email,
            'password' => $request->password,
            'is_active' => true, // ★ここ重要！
        ];

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
            'email' => ['ログインに失敗しました。メールアドレス、パスワード、またはアカウントの有効化状態を確認してください。'],
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

    /**
     * 新規ユーザー登録
     */
    public function register(Request $request)
    {
        // 1. バリデーション
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            
            // ★追加: 招待コードの検証ロジック
            'invitation_code' => [
                'required', 
                'string', 
                'exists:invitations,code', // invitationsテーブルに存在するか
                function ($attribute, $value, $fail) {
                    $invitation = Invitation::where('code', $value)->first();
                    
                    if (!$invitation) return;

                    // 使用済みチェック
                    if ($invitation->is_used) {
                        $fail('この招待コードは既に使用されています。');
                    }
                    
                    // 有効期限チェック
                    if ($invitation->expires_at && $invitation->expires_at->isPast()) {
                        $fail('この招待コードは有効期限切れです。');
                    }
                },
            ],
        ]);

        // ★追加: 招待コードモデルを取得
        $invitation = Invitation::where('code', $request->invitation_code)->first();

        // 2. ユーザー作成
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // ★追加: 招待コードを使用済みに更新
        $invitation->update(['is_used' => true]);

        // 4. ★追加: 認証メール送信イベント発火
        // これだけで Laravel が自動的に Resend 経由でメールを送ります
        event(new Registered($user));

        return response()->json([
            'message' => 'Registered successfully',
            'user' => $user,
        ], 201);
    }

    /**
     * メール認証処理 (メール内のリンクから叩かれるAPI)
     */
    public function verifyEmail(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // URLの署名(改ざん防止)チェック
        if (!$request->hasValidSignature()) {
            return response()->json(['message' => 'Invalid or expired URL.'], 401);
        }

        // 既に認証済みの場合
        if ($user->hasVerifiedEmail()) {
            // フロントエンドのログイン画面へリダイレクト (メッセージ付き)
            return redirect(env('FRONTEND_URL') . '/login?verified=already');
        }

        // 認証完了処理
        if ($user->markEmailAsVerified()) {
            // ★ここで is_active も true にする
            $user->forceFill(['is_active' => true])->save();
            
            // 認証完了イベント発火
            event(new \Illuminate\Auth\Events\Verified($user));
        }

        // フロントエンドのログイン画面へリダイレクト
        return redirect(env('FRONTEND_URL') . '/login?verified=success');
    }

    /**
     * パスワードリセットリンクの送信 (Forgot Password)
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        // リンクを送信
        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => __($status)]);
        }

        // 送信失敗 (バリデーションエラーとして返す)
        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }

    /**
     * パスワードのリセット実行 (Reset Password)
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        // パスワード更新処理
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new \Illuminate\Auth\Events\PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => __($status)]);
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }
}