<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();

            // プロジェクト作成者 (ユーザーが消えたらプロジェクトも消す設定)
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');

            $table->string('title');
            $table->text('description')->nullable();
            $table->string('thumbnail_url')->nullable();

            // 外部ツールの連携ID用カラム
            $table->string('github_repo')->nullable()->comment('例: owner/repo');
            $table->string('pl_board_id')->nullable()->comment('Project-Lite ID');
            $table->string('figma_file_key')->nullable()->comment('Figma File Key');

            // Notion用のJSONカラム (複数のページ情報を配列で保存)
            $table->json('notion_settings')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
