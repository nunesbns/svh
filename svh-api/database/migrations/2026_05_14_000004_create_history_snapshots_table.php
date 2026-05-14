<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('history_snapshots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignUuid('application_id')->nullable()->constrained('applications')->onDelete('cascade');
            $table->text('type');
            $table->text('scope');
            $table->text('user_sc_login');
            $table->binary('content_blob');
            $table->char('hash_sha256', 64);
            $table->timestamp('captured_at');
            $table->jsonb('metadata')->nullable();
            $table->timestamps();

            $table->index(['application_id', 'scope', 'captured_at']);
            $table->index(['hash_sha256']);
            $table->index(['project_id', 'captured_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('history_snapshots');
    }
};
