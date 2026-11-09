<?php

namespace App\Http\Controllers;

use App\Models\Counselor;
use App\Models\SpkCriterion;
use App\Models\SpkResult;
use App\Models\Student;
use App\Services\SpkCalculationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SpkController extends Controller
{
    public function index(Request $request): Response
    {
        $algorithm = $request->input('algorithm', 'saw'); // 'saw' or 'topsis'
        $search = $request->input('search');
        $urgency = $request->input('urgency');
        $prodi = $request->input('prodi');

        $query = SpkResult::with(['assessment.student', 'counselingSession.counselor']);

        if ($search) {
            $query->whereHas('assessment.student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('nim', 'like', "%{$search}%");
            });
        }

        if ($urgency) {
            $query->where('urgency_level', $urgency);
        }

        if ($prodi) {
            $query->whereHas('assessment.student', function ($q) use ($prodi) {
                $q->where('study_program', $prodi);
            });
        }

        if ($algorithm === 'topsis') {
            $query->orderBy('topsis_rank', 'asc');
        } else {
            $query->orderBy('saw_rank', 'asc');
        }

        $results = $query->paginate(15)->withQueryString()->through(function ($r) use ($algorithm) {
            $sched = null;
            if ($r->counselingSession && $r->counselingSession->scheduled_at) {
                $sched = is_string($r->counselingSession->scheduled_at)
                    ? Carbon::parse($r->counselingSession->scheduled_at)->format('d M Y H:i')
                    : $r->counselingSession->scheduled_at->format('d M Y H:i');
            }

            $assessment = $r->assessment;
            $student = $assessment ? $assessment->student : null;

            return [
                'id' => $r->id,
                'assessment_id' => $r->assessment_id,
                'nim' => $student ? $student->nim : '-',
                'name' => $student ? $student->name : '-',
                'prodi' => $student ? $student->study_program : '-',
                'semester' => $student ? $student->semester : 1,
                'c1' => $assessment ? $assessment->score_c1_depression : 0,
                'c2' => $assessment ? $assessment->score_c2_anxiety : 0,
                'c3' => $assessment ? $assessment->score_c3_stress : 0,
                'c4' => $assessment ? $assessment->score_c4_gpa_drop : 0.0,
                'c5' => $assessment ? $assessment->score_c5_sleep_disturbance : 0,
                'saw_score' => $r->saw_score,
                'saw_rank' => $r->saw_rank,
                'topsis_score' => $r->topsis_score,
                'topsis_rank' => $r->topsis_rank,
                'active_score' => $algorithm === 'topsis' ? $r->topsis_score : $r->saw_score,
                'active_rank' => $algorithm === 'topsis' ? $r->topsis_rank : $r->saw_rank,
                'urgency_level' => $r->urgency_level,
                'recommendation' => $r->recommendation,
                'referral_status' => $r->referral_status,
                'counselor' => $r->counselingSession?->counselor?->name,
                'scheduled_at' => $sched,
            ];
        });

        $criteria = SpkCriterion::all();
        $counselors = Counselor::where('is_active', true)->get();
        $prodiList = Student::select('study_program')->distinct()->pluck('study_program');

        return Inertia::render('Spk/Index', [
            'results' => $results,
            'criteria' => $criteria,
            'counselors' => $counselors,
            'prodiList' => $prodiList,
            'filters' => [
                'algorithm' => $algorithm,
                'search' => $search,
                'urgency' => $urgency,
                'prodi' => $prodi,
            ],
        ]);
    }

    public function recalculate(SpkCalculationService $service): RedirectResponse
    {
        $service->recalculateAll();

        return redirect()->back()->with('success', 'Kalkulasi ulang SAW dan TOPSIS berhasil diperbarui untuk seluruh dataset.');
    }

    public function exportCsv(): StreamedResponse
    {
        $results = SpkResult::with('assessment.student')->orderBy('saw_rank')->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="simkemas_spk_export.csv"',
        ];

        return response()->stream(function () use ($results) {
            $handle = fopen('php://output', 'w');
            if ($handle) {
                fputcsv($handle, [
                    'Ranking SAW', 'Ranking TOPSIS', 'NIM', 'Nama Mahasiswa', 'Program Studi',
                    'C1 Depresi', 'C2 Cemas', 'C3 Stres', 'C4 Penurunan IPK', 'C5 Gangguan Tidur',
                    'Skor SAW', 'Skor TOPSIS', 'Tingkat Urgensi', 'Rekomendasi Tindakan', 'Status Rujukan',
                ]);

                foreach ($results as $r) {
                    $assessment = $r->assessment;
                    $student = $assessment ? $assessment->student : null;

                    fputcsv($handle, [
                        $r->saw_rank,
                        $r->topsis_rank,
                        $student ? $student->nim : '-',
                        $student ? $student->name : '-',
                        $student ? $student->study_program : '-',
                        $assessment ? $assessment->score_c1_depression : 0,
                        $assessment ? $assessment->score_c2_anxiety : 0,
                        $assessment ? $assessment->score_c3_stress : 0,
                        $assessment ? $assessment->score_c4_gpa_drop : 0,
                        $assessment ? $assessment->score_c5_sleep_disturbance : 0,
                        $r->saw_score,
                        $r->topsis_score,
                        $r->urgency_level,
                        $r->recommendation,
                        $r->referral_status,
                    ]);
                }
                fclose($handle);
            }
        }, 200, $headers);
    }
}
