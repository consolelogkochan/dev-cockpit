<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notion_pages', function (Blueprint $table) {
            $table->id();

            // どのプロジェクトに紐づくか (Projectとの紐付け)
            // cascade: プロジェクトが消えたら、このNotionページデータも道連れで消す
            $table->foreignId('project_id')->constrained()->onDelete('cascade');

            // NotionのページID (例: 1a2b3c...)
            $table->string('page_id');
            
            // 将来用: メモや識別名を入れられるようにしておく（今回は使わなくてもOK）
            $table->string('title')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notion_pages');
    }
};