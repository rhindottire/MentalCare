<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Mahasiswa
        Schema::create('students', function (Blueprint $table) {
            $table->string('nim', 20)->primary();
            $table->string('name', 100);
            $table->string('study_program', 60);
            $table->string('faculty', 60);
            $table->integer('semester');
            $table->string('email', 100)->nullable();
            $table->string('phone', 20)->nullable();
            $table->timestamps();
        });

        // 2. Konselor
        Schema::create('counselors', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('specialization', 100);
            $table->string('phone', 20);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 3. Kriteria SPK
        Schema::create('spk_criteria', function (Blueprint $table) {
            $table->string('code', 10)->primary();
            $table->string('name', 100);
            $table->decimal('weight', 4, 2);
            $table->string('type', 10); // benefit / cost
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 4. Asesmen Kesehatan Mental (DASS-21 + Akademik)
        Schema::create('assessments', function (Blueprint $table) {
            $table->id();
            $table->string('student_nim', 20);
            $table->date('assessment_date');
            $table->integer('score_c1_depression');
            $table->integer('score_c2_anxiety');
            $table->integer('score_c3_stress');
            $table->decimal('score_c4_gpa_drop', 3, 2);
            $table->integer('score_c5_sleep_disturbance');
            $table->text('student_notes')->nullable();
            $table->timestamps();

            $table->foreign('student_nim')->references('nim')->on('students')->onDelete('cascade');
        });

        // 5. Hasil Perhitungan SPK (SAW & TOPSIS)
        Schema::create('spk_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessment_id')->constrained('assessments')->onDelete('cascade');
            $table->decimal('saw_score', 6, 4);
            $table->integer('saw_rank')->default(0);
            $table->decimal('topsis_score', 6, 4)->default(0.0000);
            $table->integer('topsis_rank')->default(0);
            $table->string('urgency_level', 50); // Prioritas 1 (Kritis), Prioritas 2 (Tinggi), Prioritas 3 (Sedang), Prioritas 4 (Rendah)
            $table->text('recommendation');
            $table->string('referral_status', 20)->default('pending'); // pending, scheduled, completed
            $table->timestamps();
        });

        // 6. Sesi Konseling / Rekam Klinis
        Schema::create('counseling_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('spk_result_id')->constrained('spk_results')->onDelete('cascade');
            $table->foreignId('counselor_id')->nullable()->constrained('counselors')->nullOnDelete();
            $table->dateTime('scheduled_at')->nullable();
            $table->string('status', 20)->default('scheduled'); // scheduled, completed, cancelled
            $table->text('clinical_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('counseling_sessions');
        Schema::dropIfExists('spk_results');
        Schema::dropIfExists('assessments');
        Schema::dropIfExists('spk_criteria');
        Schema::dropIfExists('counselors');
        Schema::dropIfExists('students');
    }
};
