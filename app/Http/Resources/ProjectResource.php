<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title, // name -> title
            'description' => $this->description,
            'thumbnail_url' => $this->thumbnail_url,
            'github_repo' => $this->github_repo,
            
            // 日付フォーマット
            'created_at' => $this->created_at->format('Y-m-d'),
            
            // ↓ 存在しないカラムは削除しました
            // status, priority, due_date
        ];
    }
}