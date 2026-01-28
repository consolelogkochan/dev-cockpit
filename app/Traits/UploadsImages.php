<?php

namespace App\Traits;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

trait UploadsImages
{
    /**
     * 画像をアップロードして、公開パスを返す
     *
     * @param Request $request
     * @param string $key リクエストのキー名 (例: 'thumbnail_file')
     * @param string $folder 保存先フォルダ (例: 'projects')
     * @return string|null 保存されたパス (例: '/storage/projects/xxx.jpg') または null
     */
    public function uploadImage(Request $request, string $key, string $folder = 'images')
    {
        if ($request->hasFile($key) && $request->file($key)->isValid()) {
            // publicディスクの指定フォルダに保存
            // store() は自動的にハッシュ名を生成してくれます
            $path = $request->file($key)->store($folder, 'public');

            // Webからアクセス可能なURLパスを返す (/storage/...)
            return '/storage/' . $path;
        }

        return null;
    }

    /**
     * 古い画像を削除する (更新時用)
     *
     * @param string|null $path DBに保存されているパス
     */
    public function deleteImage(?string $path)
    {
        if (!$path) return;

        // パスから '/storage/' を取り除いて、実際のファイルパスにする
        $relativePath = str_replace('/storage/', '', $path);

        if (Storage::disk('public')->exists($relativePath)) {
            Storage::disk('public')->delete($relativePath);
        }
    }
}