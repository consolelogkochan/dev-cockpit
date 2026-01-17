<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    public function definition(): array
    {
        return [
            // 'name' ではなく 'title'
            'title' => $this->faker->sentence(3),
            
            // 'user_id' ではなく 'owner_id'
            'owner_id' => 1, // テスト用にID:1のユーザーに紐付け
            
            'description' => $this->faker->paragraph(),
            
            // 外部ツールのダミーデータ
            'github_repo' => 'laravel/framework', 
            'pl_board_id' => 'PL-' . $this->faker->numberBetween(1000, 9999),
            
            // サムネイル画像（ダミー画像URL）
            'thumbnail_url' => null,
        ];
    }
}