<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotionPage extends Model
{
    use HasFactory;

    // 保存を許可するカラム
    protected $fillable = ['project_id', 'page_id', 'title'];

    /**
     * リレーション: このNotionページは一つのプロジェクトに属する
     */
    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}