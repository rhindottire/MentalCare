<?php

namespace App\Http\Controllers;

use App\Models\CounselingSession;
use App\Models\Counselor;
use App\Models\SpkResult;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class CounselingController extends Controller
{
    public function index(): Response
    {
        $sessions = CounselingSession::with(['spkResult.assessment.student', 'counselor'])
            ->orderBy('scheduled_at', 'desc')
            ->get()
            ->map(function ($s) {
                $sched = null;
                if ($s->scheduled_at) {
                    $sched = is_string($s->scheduled_at)
                        ? Carbon::parse($s->scheduled_at)->format('d M Y H:i')
                        : $s->scheduled_at->format('d M Y H:i');
                }

                $student = $s->spkResult?->assessment?->student;

                return [
                    'id' => $s->id,
                    'nim' => $student ? $student->nim : '-',
                    'name' => $student ? $student->name : '-',
                    'prodi' => $student ? $student->study_program : '-',
                    'urgency' => $s->spkResult ? $s->spkResult->urgency_level : '-',
                    'counselor' => $s->counselor?->name,
                    'scheduled_at' => $sched,
                    'status' => $s->status,
                    'notes' => $s->clinical_notes,
                ];
            });

        $counselors = Counselor::where('is_active', true)->get();

        return Inertia::render('Counseling/Index', [
            'sessions' => $sessions,
            'counselors' => $counselors,
        ]);
    }

    public function schedule(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'spk_result_id' => 'required|exists:spk_results,id',
            'counselor_id' => 'required|exists:counselors,id',
            'scheduled_at' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        CounselingSession::updateOrCreate(
            ['spk_result_id' => $validated['spk_result_id']],
            [
                'counselor_id' => $validated['counselor_id'],
                'scheduled_at' => $validated['scheduled_at'],
                'status' => 'scheduled',
                'clinical_notes' => $validated['notes'],
            ]
        );

        $spkResult = SpkResult::find($validated['spk_result_id']);
        if ($spkResult) {
            $spkResult->update(['referral_status' => 'scheduled']);
        }

        return redirect()->back()->with('success', 'Jadwal konseling berhasil dikonfirmasi dan ditetapkan.');
    }
}
