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
        Schema::create('country_goals', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code', 2)->unique();
            $table->unsignedInteger('goal_steps');
            $table->timestamps();
        });

        DB::table('country_goals')->insert([
            ['name' => 'Malaysia', 'code' => 'MY', 'goal_steps' => 300_000, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Philippines', 'code' => 'PH', 'goal_steps' => 300_000, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Indonesia', 'code' => 'ID', 'goal_steps' => 300_000, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('country_goals');
    }
};
