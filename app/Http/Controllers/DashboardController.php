<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\Counselor;
use App\Models\SpkResult;
use App\Models\Student;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $totalStudents = Student::count();
        $totalAssessments = Assessment::count();
        $totalCounselors = Counselor::where('is_active', true)->count();

        // Urgency Distribution
        $urgencyStats = SpkResult::select('urgency_level', DB::raw('count(*) as total'))
            ->groupBy('urgency_level')
            ->pluck('total', 'urgency_level')
            ->toArray();

        $kritisCount = (int) ($urgencyStats['Prioritas 1 (Kritis / Darurat)'] ?? 0);
        $tinggiCount = (int) ($urgencyStats['Prioritas 2 (Tinggi)'] ?? 0);
        $sedangCount = (int) ($urgencyStats['Prioritas 3 (Sedang)'] ?? 0);
        $rendahCount = (int) ($urgencyStats['Prioritas 4 (Rendah / Normal)'] ?? 0);

        // Prodi Distribution with Avg Scores
        $prodiStats = Student::join('assessments', 'students.nim', '=', 'assessments.student_nim')
            ->select(
                'students.study_program',
                DB::raw('count(*) as count'),
                DB::raw('round(avg(assessments.score_c1_depression), 1) as avg_depression'),
                DB::raw('round(avg(assessments.score_c2_anxiety), 1) as avg_anxiety'),
                DB::raw('round(avg(assessments.score_c3_stress), 1) as avg_stress')
            )
            ->groupBy('students.study_program')
            ->orderByDesc('count')
            ->get();

        // Top 5 Critical Triase
        $topCritical = SpkResult::with('assessment.student')
            ->where('urgency_level', 'Prioritas 1 (Kritis / Darurat)')
            ->orderBy('saw_rank')
            ->limit(5)
            ->get()
            ->map(function ($r) {
                $student = $r->assessment?->student;

                return [
                    'id' => $r->id,
                    'rank' => $r->saw_rank,
                    'nim' => $student ? $student->nim : '-',
                    'name' => $student ? $student->name : '-',
                    'prodi' => $student ? $student->study_program : '-',
                    'saw_score' => $r->saw_score,
                    'topsis_score' => $r->topsis_score,
                    'urgency' => $r->urgency_level,
                    'recommendation' => $r->recommendation,
                    'status' => $r->referral_status,
                ];
            });

        return Inertia::render('Dashboard', [
            'metrics' => [
                'totalStudents' => $totalStudents,
                'totalAssessments' => $totalAssessments,
                'totalCounselors' => $totalCounselors,
                'kritisCount' => $kritisCount,
                'tinggiCount' => $tinggiCount,
                'sedangCount' => $sedangCount,
                'rendahCount' => $rendahCount,
            ],
            'prodiStats' => $prodiStats,
            'topCritical' => $topCritical,
        ]);
    }
}
