<?php

namespace Tests\Feature;

use App\Models\Assessment;
use App\Models\Counselor;
use App\Models\SpkCriterion;
use App\Models\SpkResult;
use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SpkFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed criteria
        SpkCriterion::create(['code' => 'C1', 'name' => 'Depresi', 'weight' => 0.25, 'type' => 'benefit']);
        SpkCriterion::create(['code' => 'C2', 'name' => 'Cemas', 'weight' => 0.25, 'type' => 'benefit']);
        SpkCriterion::create(['code' => 'C3', 'name' => 'Stres', 'weight' => 0.20, 'type' => 'benefit']);
        SpkCriterion::create(['code' => 'C4', 'name' => 'IPK Drop', 'weight' => 0.15, 'type' => 'benefit']);
        SpkCriterion::create(['code' => 'C5', 'name' => 'Tidur', 'weight' => 0.15, 'type' => 'benefit']);

        // Seed counselor
        Counselor::create([
            'name' => 'Dr. Psikolog Demo',
            'specialization' => 'Klinis Mahasiswa',
            'phone' => '081234567890',
            'is_active' => true,
        ]);
    }

    public function test_dashboard_can_be_rendered(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
    }

    public function test_spk_index_can_be_rendered(): void
    {
        $response = $this->get('/spk');
        $response->assertStatus(200);
    }

    public function test_student_screening_form_can_be_rendered(): void
    {
        $response = $this->get('/skrining');
        $response->assertStatus(200);
    }

    public function test_student_can_submit_screening_and_triggers_spk(): void
    {
        $payload = [
            'nim' => '230411100999',
            'name' => 'Mahasiswa Baru Uji Coba',
            'study_program' => 'Sistem Informasi',
            'faculty' => 'Fakultas Teknik',
            'semester' => 4,
            'phone' => '081234567899',
            'depression_sum' => 18,
            'anxiety_sum' => 15,
            'stress_sum' => 16,
            'gpa_drop' => 1.25,
            'sleep_disturbance' => 5,
            'notes' => 'Merasa sangat tertekan menjelang sidang tugas.',
        ];

        $response = $this->post('/skrining', $payload);

        $this->assertDatabaseHas('students', ['nim' => '230411100999']);
        $this->assertDatabaseHas('assessments', ['student_nim' => '230411100999', 'score_c5_sleep_disturbance' => 5]);
        $this->assertDatabaseHas('spk_results', ['urgency_level' => 'Prioritas 1 (Kritis / Darurat)']);

        $assessment = Assessment::where('student_nim', '230411100999')->first();
        $response->assertRedirect(route('assessment.result', ['id' => $assessment->id]));
    }

    public function test_can_schedule_counseling_session(): void
    {
        $student = Student::create([
            'nim' => '230411100888',
            'name' => 'Mahasiswa Test Rujukan',
            'study_program' => 'Teknik Informatika',
            'faculty' => 'Fakultas Teknik',
            'semester' => 6,
        ]);

        $assessment = Assessment::create([
            'student_nim' => $student->nim,
            'assessment_date' => now()->toDateString(),
            'score_c1_depression' => 30,
            'score_c2_anxiety' => 30,
            'score_c3_stress' => 30,
            'score_c4_gpa_drop' => 1.0,
            'score_c5_sleep_disturbance' => 4,
        ]);

        $spk = SpkResult::create([
            'assessment_id' => $assessment->id,
            'saw_score' => 0.75,
            'saw_rank' => 1,
            'topsis_score' => 0.80,
            'topsis_rank' => 1,
            'urgency_level' => 'Prioritas 1 (Kritis / Darurat)',
            'recommendation' => 'Rujukan Segera',
            'referral_status' => 'pending',
        ]);

        $counselor = Counselor::first();

        $response = $this->post('/konseling/jadwalkan', [
            'spk_result_id' => $spk->id,
            'counselor_id' => $counselor->id,
            'scheduled_at' => now()->addDays(2)->format('Y-m-d H:i:s'),
            'notes' => 'Catatan sesi konseling pertama.',
        ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('counseling_sessions', ['spk_result_id' => $spk->id, 'counselor_id' => $counselor->id]);
        $this->assertDatabaseHas('spk_results', ['id' => $spk->id, 'referral_status' => 'scheduled']);
    }
}
