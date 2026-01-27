<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * ユーザー一覧を取得
     */
    public function index()
    {
        // IDの降順（新しい順）で取得し、1ページ10件でページネーション
        return User::orderBy('id', 'desc')->paginate(10);
    }

    /**
     * 指定したユーザーを削除 (BAN)
     */
    public function destroy(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        // 安全装置: 自分自身は削除できないようにする
        if ($request->user()->id === $user->id) {
            return response()->json(['message' => '自分自身を削除することはできません。'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'ユーザーを削除しました。']);
    }
}
