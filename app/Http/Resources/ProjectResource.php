<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Project
 */
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
            'pl_board_id' => $this->pl_board_id,
            'figma_file_key' => $this->figma_file_key,

            // ▼▼▼ ★追加: これがないとフロントエンドに届きません ▼▼▼
            'notion_pages' => $this->notionPages,
            // ▲▲▲ 追加ここまで ▲▲▲

            // 日付フォーマット
            'created_at' => $this->created_at->format('Y-m-d'),
            'updated_at' => $this->updated_at->format('Y-m-d'),

        ];
    }
}
