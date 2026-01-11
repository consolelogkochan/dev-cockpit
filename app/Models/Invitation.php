<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'created_by',
        'is_used',
        'expires_at',
    ];

    // 日付や真偽値を自動変換する設定
    protected $casts = [
        'is_used' => 'boolean',
        'expires_at' => 'datetime', // これで Carbon インスタンスとして扱えます
    ];

    /**
     * このコードの発行者
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}