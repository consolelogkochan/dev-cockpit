<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\NotionPage;

class Project extends Model
{
    use HasFactory;

    // 一括代入（createメソッド等）を許可するカラム
    protected $fillable = [
        'owner_id',
        'title',
        'description',
        'thumbnail_url',
        'github_repo',
        'pl_board_id',
        'figma_file_key',
        'notion_settings',
    ];

    // ▼ ★追加: Notionページとの1対多リレーション
    public function notionPages()
    {
        return $this->hasMany(NotionPage::class);
    }

    // DBのデータ型とPHPの型を自動変換する設定
    protected $casts = [
        'notion_settings' => 'array', // JSONを自動でPHP配列に変換
    ];

    /**
     * プロジェクトの所有者
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * プロジェクトに参加しているメンバー
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_user')
                    ->withPivot('role') // 中間テーブルの role も取得
                    ->withTimestamps();
    }

    /**
     * FigmaのURLからFile Keyを自動抽出して保存する
     */
    public function setFigmaFileKeyAttribute($value)
    {
        /// 修正前: '/\/file\/([a-zA-Z0-9]+)/'
        // 修正後: 'file' または 'design' のどちらがきてもOKにする
        if (preg_match('/\/(?:file|design)\/([a-zA-Z0-9]+)/', $value, $matches)) {
            $this->attributes['figma_file_key'] = $matches[1];
        } else {
            // マッチしなければそのまま（あるいはKeyが直接入力された場合）
            $this->attributes['figma_file_key'] = $value;
        }
    }

    /**
     * Project-LiteのボードIDを設定する際のミューテータ
     * URLが入力された場合、そこからID部分(数字)を抽出する
     */
    protected function plBoardId(): Attribute
    {
        return Attribute::make(
            set: function ($value) {
                // 空の場合はnull
                if (empty($value)) {
                    return null;
                }

                // URL形式 (.../boards/123...) から数字を抽出
                // 例: http://localhost/boards/5 -> 5
                if (preg_match('/\/boards\/(\d+)/', $value, $matches)) {
                    return (int) $matches[1];
                }

                // URLじゃなくて直接数字が入力された場合はそのまま保存
                return (int) $value;
            }
        );
    }
}