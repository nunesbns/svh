<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('api_keys', function (Blueprint $table) {
            $table->string('scriptcase_username')->nullable()->after('name');
        });

        // Populate existing data with lowercase first name of each record
        $apiKeys = DB::table('api_keys')->get();
        foreach ($apiKeys as $apiKey) {
            $nameParts = explode(' ', trim($apiKey->name));
            $firstName = strtolower($nameParts[0]);
            DB::table('api_keys')
                ->where('id', $apiKey->id)
                ->update(['scriptcase_username' => $firstName]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('api_keys', function (Blueprint $table) {
            $table->dropColumn('scriptcase_username');
        });
    }
};
