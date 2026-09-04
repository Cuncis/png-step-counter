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
        Schema::create('challenge_step_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challenge_country_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->string('participant_name')->nullable();
            $table->unsignedInteger('steps');
            $table->timestamps();

            $table->index(['challenge_country_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('challenge_step_entries');
    }
};
