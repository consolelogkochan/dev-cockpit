<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\UploadsImages; // ★前回のTraitを使用
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Notification; // ★追加
use App\Notifications\EmailChangeNotification; // ★追加
use App\Models\User; // ★Verify用に追加

class ProfileController extends Controller
{
    use UploadsImages; // ★Trait読み込み

    /**
     * プロフィール更新
     */
    public function update(Request $request)
    {
        $user = $request->user();

        // バリデーション
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            // 自分自身のEmailは重複チェックから除外する (ignore)
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            // パスワードは入力された場合のみ検証 (confirmed = password_confirmation と一致するか)
            'password' => 'nullable|string|min:8|confirmed',
            // アバター画像 (nullable)
            'avatar' => 'nullable|image|max:10240', // 最大10MB
        ]);

        // 1. 名前の更新
        $user->name = $validated['name'];

        // 2. パスワードの更新 (入力がある場合のみ)
        if ($request->filled('password')) {
            $user->password = Hash::make($validated['password']);
        }

        // 3. アバター画像の処理 (Trait利用)
        // 新しい画像がアップロードされた場合
        if ($request->hasFile('avatar')) {
            // 古い画像があれば削除 (Traitの機能)
            if ($user->avatar_url) {
                $this->deleteImage($user->avatar_url);
            }
            // 新しい画像を保存してパスを取得 (Traitの機能)
            // 'avatars' フォルダに保存します
            $path = $this->uploadImage($request, 'avatar', 'avatars');
            $user->avatar_url = $path;
        }

        // ★★★ 4. メールアドレス変更ロジック ★★★
        $emailChanged = false;
        
        // 入力されたメアドが現在のメアドと異なる場合
        if ($validated['email'] !== $user->email) {
            
            // トークン生成
            $token = Str::random(60);
            
            // 一時カラムに保存（メインのemailはまだ更新しない）
            $user->new_email = $validated['email'];
            $user->email_change_token = $token;
            
            // ★重要: 通知は「新しいメールアドレス」宛に送る
            // $userインスタンス宛だと古いメアドに飛んでしまうため、Notification::routeを使う
            Notification::route('mail', $validated['email'])
                ->notify(new EmailChangeNotification($token));
            
            $emailChanged = true;
        }

        $user->save();

        // フロントエンドへのメッセージを分岐
        $message = 'プロフィールを更新しました。';
        if ($emailChanged) {
            $message = '基本情報を更新しました。新しいメールアドレス宛に確認メールを送信しましたので、承認を行ってください。';
        }

        return response()->json([
            'message' => $message,
            'user' => $user,
            'email_changed' => $emailChanged // フロント制御用フラグ
        ]);
    }

    /**
     * メール変更の確定処理 (追加)
     */
    public function verifyEmailChange(Request $request)
    {
        $request->validate(['token' => 'required']);

        // トークンが一致するユーザーを探す
        $user = User::where('email_change_token', $request->token)->first();

        if (!$user || !$user->new_email) {
            return response()->json(['message' => '無効なトークンまたは期限切れです。'], 400);
        }

        // 確定処理：新しいメアドを正式採用
        $user->email = $user->new_email;
        $user->new_email = null;
        $user->email_change_token = null;
        $user->save();

        return response()->json(['message' => 'メールアドレスの変更が完了しました。']);
    }
}