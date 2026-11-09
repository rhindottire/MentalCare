<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\Student;
use App\Services\SpkCalculationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AssessmentController extends Controller
{
    public function create(): Response
    {
        // 21 DASS items categorized
        $dassItems = [
            // Depression (7 items)
            ['id' => 'q3', 'scale' => 'depression', 'text' => 'Saya merasa tidak dapat merasakan emosi positif sama sekali.'],
            ['id' => 'q5', 'scale' => 'depression', 'text' => 'Saya merasa sulit untuk berinisiatif melakukan sesuatu hal.'],
            ['id' => 'q10', 'scale' => 'depression', 'text' => 'Saya merasa tidak ada hal baik yang dapat saya harapkan di masa depan.'],
            ['id' => 'q13', 'scale' => 'depression', 'text' => 'Saya merasa sedih, murung, dan putus asa.'],
            ['id' => 'q16', 'scale' => 'depression', 'text' => 'Saya merasa tidak antusias terhadap kegiatan apapun.'],
            ['id' => 'q17', 'scale' => 'depression', 'text' => 'Saya merasa diri saya tidak berharga sebagai seorang individu.'],
            ['id' => 'q21', 'scale' => 'depression', 'text' => 'Saya merasa hidup ini tidak ada artinya lagi.'],

            // Anxiety (7 items)
            ['id' => 'q2', 'scale' => 'anxiety', 'text' => 'Saya menyadari mulut saya sering terasa kering.'],
            ['id' => 'q4', 'scale' => 'anxiety', 'text' => 'Saya mengalami kesulitan bernapas (misal: napas tersengal tanpa aktivitas fisik).'],
            ['id' => 'q7', 'scale' => 'anxiety', 'text' => 'Saya mengalami gemetar atau tremor pada tangan atau kaki.'],
            ['id' => 'q9', 'scale' => 'anxiety', 'text' => 'Saya khawatir tentang situasi yang mungkin membuat saya panik atau mempermalukan diri.'],
            ['id' => 'q15', 'scale' => 'anxiety', 'text' => 'Saya merasa hampir panik tanpa alasan yang jelas.'],
            ['id' => 'q19', 'scale' => 'anxiety', 'text' => 'Saya menyadari detak jantung saya berdebar kencang saat tidak berolahraga.'],
            ['id' => 'q20', 'scale' => 'anxiety', 'text' => 'Saya merasa takut tanpa alasan yang masuk akal.'],

            // Stress (7 items)
            ['id' => 'q1', 'scale' => 'stress', 'text' => 'Saya merasa sulit untuk bersantai dan menenangkan diri.'],
            ['id' => 'q6', 'scale' => 'stress', 'text' => 'Saya cenderung bereaksi berlebihan terhadap situasi yang tidak terduga.'],
            ['id' => 'q8', 'scale' => 'stress', 'text' => 'Saya merasa menghabiskan banyak energi karena sering merasa gelisah.'],
            ['id' => 'q11', 'scale' => 'stress', 'text' => 'Saya merasa mudah tersinggung atau lekas marah.'],
            ['id' => 'q12', 'scale' => 'stress', 'text' => 'Saya merasa sangat mudah gelisah jika terganggu saat mengerjakan sesuatu.'],
            ['id' => 'q14', 'scale' => 'stress', 'text' => 'Saya merasa tidak sabar ketika mengalami penundaan (misal: antrean/tugas tertunda).'],
            ['id' => 'q18', 'scale' => 'stress', 'text' => 'Saya merasa diri saya sangat peka dan mudah tersentuh perasaannya.'],
        ];

        return Inertia::render('Assessment/Create', [
            'dassItems' => $dassItems,
        ]);
    }

    public function store(Request $request, SpkCalculationService $service): RedirectResponse
    {
        $validated = $request->validate([
            'nim' => 'required|string|max:20',
            'name' => 'required|string|max:100',
            'study_program' => 'required|string|max:60',
            'faculty' => 'required|string|max:60',
            'semester' => 'required|integer|min:1|max:14',
            'phone' => 'nullable|string|max:20',
            'depression_sum' => 'required|integer|min:0|max:21',
            'anxiety_sum' => 'required|integer|min:0|max:21',
            'stress_sum' => 'required|integer|min:0|max:21',
            'gpa_drop' => 'required|numeric|min:0|max:2.0',
            'sleep_disturbance' => 'required|integer|min:1|max:5',
            'notes' => 'nullable|string|max:500',
        ]);

        // DASS-21 score is multiplied by 2 to match DASS-42 clinical scale (0-42)
        $scoreC1 = $validated['depression_sum'] * 2;
        $scoreC2 = $validated['anxiety_sum'] * 2;
        $scoreC3 = $validated['stress_sum'] * 2;

        $student = Student::updateOrCreate(
            ['nim' => $validated['nim']],
            [
                'name' => $validated['name'],
                'study_program' => $validated['study_program'],
                'faculty' => $validated['faculty'],
                'semester' => $validated['semester'],
                'email' => "{$validated['nim']}@student.trunojoyo.ac.id",
                'phone' => $validated['phone'],
            ]
        );

        $assessment = Assessment::create([
            'student_nim' => $student->nim,
            'assessment_date' => now()->toDateString(),
            'score_c1_depression' => $scoreC1,
            'score_c2_anxiety' => $scoreC2,
            'score_c3_stress' => $scoreC3,
            'score_c4_gpa_drop' => $validated['gpa_drop'],
            'score_c5_sleep_disturbance' => $validated['sleep_disturbance'],
            'student_notes' => $validated['notes'],
        ]);

        // Recalculate SPK rankings
        $service->recalculateAll();

        return redirect()->route('assessment.result', ['id' => $assessment->id])
            ->with('success', 'Skrining kesehatan mental berhasil disimpan.');
    }

    public function showResult(int $id): Response
    {
        $assessment = Assessment::with(['student', 'spkResult'])->findOrFail($id);

        $dateFormatted = is_string($assessment->assessment_date)
            ? Carbon::parse($assessment->assessment_date)->format('d M Y')
            : $assessment->assessment_date->format('d M Y');

        return Inertia::render('Assessment/Result', [
            'assessment' => [
                'id' => $assessment->id,
                'nim' => $assessment->student ? $assessment->student->nim : '',
                'name' => $assessment->student ? $assessment->student->name : '',
                'prodi' => $assessment->student ? $assessment->student->study_program : '',
                'semester' => $assessment->student ? $assessment->student->semester : 1,
                'date' => $dateFormatted,
                'c1' => $assessment->score_c1_depression,
                'c2' => $assessment->score_c2_anxiety,
                'c3' => $assessment->score_c3_stress,
                'c4' => $assessment->score_c4_gpa_drop,
                'c5' => $assessment->score_c5_sleep_disturbance,
                'saw_score' => $assessment->spkResult?->saw_score,
                'saw_rank' => $assessment->spkResult?->saw_rank,
                'topsis_score' => $assessment->spkResult?->topsis_score,
                'topsis_rank' => $assessment->spkResult?->topsis_rank,
                'urgency' => $assessment->spkResult?->urgency_level,
                'recommendation' => $assessment->spkResult?->recommendation,
                'status' => $assessment->spkResult?->referral_status,
            ],
        ]);
    }
}
