<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $page_id
 * @property string $project_id
 */
class NotionPage extends Model
{
    use HasFactory;

    // 保存を許可するカラム
    protected $fillable = ['project_id', 'page_id', 'title'];

    // ▼▼▼ このミューテータを追加 ▼▼▼
    /**
     * page_id に値をセットするとき、URLなら自動でIDだけ抜き出す
     */
    public function setPageIdAttribute($value)
    {
        // NotionのURL形式: https://www.notion.so/Page-Title-1234567890abcdef1234567890abcdef
        // 末尾の32桁の英数字（ハイフンなし）を抽出する正規表現
        if (preg_match('/([a-f0-9]{32})$/', $value, $matches)) {
            $this->attributes['page_id'] = $matches[1];
        } else {
            // URL形式でないならそのまま保存
            $this->attributes['page_id'] = $value;
        }
    }
    // ▲▲▲ 追加ここまで ▲▲▲

    /**
     * リレーション: このNotionページは一つのプロジェクトに属する
     */
    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
