<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('new_email')->nullable()->after('email')->comment('変更待ちの新しいメールアドレス');
            $table->string('email_change_token')->nullable()->after('new_email')->comment('メール変更用トークン');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['new_email', 'email_change_token']);
        });
    }
};
