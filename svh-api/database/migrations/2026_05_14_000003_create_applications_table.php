<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('project_id')->constrained('projects')->onDelete('cascade');
            $table->text('cod_prj');
            $table->text('cod_apl');
            $table->text('display_name')->nullable();
            $table->timestamp('first_seen_at')->useCurrent();
            $table->timestamps();

            $table->unique(['project_id', 'cod_prj', 'cod_apl']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
