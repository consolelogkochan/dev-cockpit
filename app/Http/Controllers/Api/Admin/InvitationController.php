<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invitation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class InvitationController extends Controller
{
    /**
     * 招待コード一覧を取得
     * (未使用のものを優先、あるいは全件表示)
     */
    public function index()
    {
        // 作成日時の新しい順に取得
        // フロントエンドで「誰が作ったか」を表示するために creator リレーションもロード
        $invitations = Invitation::with('creator')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($invitations);
    }

    /**
     * 新しい招待コードを生成して保存
     */
    public function store(Request $request)
    {
        // 1. ランダムな文字列生成 (例: "A1B2C3D4E5")
        // 重複チェックを一応行う（whileループで既存コードと被らないか確認）
        do {
            $code = strtoupper(Str::random(10));
        } while (Invitation::where('code', $code)->exists());

        // 2. データベースへ保存
        $invitation = Invitation::create([
            'code' => $code,
            'created_by' => $request->user()->id,
            'is_used' => false,
            'expires_at' => null, // 今回は無期限とします（必要なら now()->addDays(7) 等）
        ]);

        return response()->json([
            'message' => '招待コードを発行しました。',
            'data' => $invitation,
        ], 201);
    }

    /**
     * 招待コードの削除（オプション）
     * 間違って発行した場合などのために実装しておくと便利です
     */
    public function destroy(string $id)
    {
        $invitation = Invitation::findOrFail($id);
        $invitation->delete();

        return response()->json(['message' => '招待コードを削除しました。']);
    }
}
