<?php

namespace App\Services;

use App\Models\Assessment;
use App\Models\SpkCriterion;
use App\Models\SpkResult;

class SpkCalculationService
{
    /**
     * Weights configuration (default fallback if DB not populated)
     * C1: Depression (0.25)
     * C2: Anxiety (0.25)
     * C3: Stress (0.20)
     * C4: GPA Drop (0.15)
     * C5: Sleep Disturbance (0.15)
     */
    public function getCriteriaWeights(): array
    {
        $dbCriteria = SpkCriterion::pluck('weight', 'code')->toArray();
        if (count($dbCriteria) >= 5) {
            return $dbCriteria;
        }

        return [
            'C1' => 0.25,
            'C2' => 0.25,
            'C3' => 0.20,
            'C4' => 0.15,
            'C5' => 0.15,
        ];
    }

    /**
     * Calculate SAW and TOPSIS for all assessments in the database
     * and persist/update rankings into spk_results table.
     */
    public function recalculateAll(): array
    {
        $assessments = Assessment::with('student')->get();
        if ($assessments->isEmpty()) {
            return [];
        }

        $weights = $this->getCriteriaWeights();
        $matrix = [];

        foreach ($assessments as $a) {
            $matrix[$a->id] = [
                'C1' => (float) $a->score_c1_depression,
                'C2' => (float) $a->score_c2_anxiety,
                'C3' => (float) $a->score_c3_stress,
                'C4' => (float) $a->score_c4_gpa_drop,
                'C5' => (float) $a->score_c5_sleep_disturbance,
            ];
        }

        // 1. Calculate SAW
        $sawScores = $this->calculateSaw($matrix, $weights);

        // 2. Calculate TOPSIS
        $topsisScores = $this->calculateTopsis($matrix, $weights);

        // 3. Assign Rankings
        arsort($sawScores);
        $sawRanks = [];
        $rank = 1;
        foreach ($sawScores as $id => $val) {
            $sawRanks[$id] = $rank++;
        }

        arsort($topsisScores);
        $topsisRanks = [];
        $rank = 1;
        foreach ($topsisScores as $id => $val) {
            $topsisRanks[$id] = $rank++;
        }

        // 4. Update Database
        $results = [];
        foreach ($assessments as $a) {
            $id = $a->id;
            $sawVal = $sawScores[$id] ?? 0.0;
            $topVal = $topsisScores[$id] ?? 0.0;
            $urgency = $this->determineUrgency($sawVal);
            $recommendation = $this->determineRecommendation($sawVal);

            $spkResult = SpkResult::updateOrCreate(
                ['assessment_id' => $id],
                [
                    'saw_score' => $sawVal,
                    'saw_rank' => $sawRanks[$id],
                    'topsis_score' => $topVal,
                    'topsis_rank' => $topsisRanks[$id],
                    'urgency_level' => $urgency,
                    'recommendation' => $recommendation,
                ]
            );

            $results[] = $spkResult;
        }

        return $results;
    }

    /**
     * SAW calculation algorithm
     */
    public function calculateSaw(array $matrix, array $weights): array
    {
        $maxC = [
            'C1' => 1.0,
            'C2' => 1.0,
            'C3' => 1.0,
            'C4' => 0.01,
            'C5' => 1.0,
        ];

        foreach ($matrix as $row) {
            foreach (['C1', 'C2', 'C3', 'C4', 'C5'] as $c) {
                if ($row[$c] > $maxC[$c]) {
                    $maxC[$c] = $row[$c];
                }
            }
        }

        $scores = [];
        foreach ($matrix as $id => $row) {
            $score = 0.0;
            foreach (['C1', 'C2', 'C3', 'C4', 'C5'] as $c) {
                $divisor = $maxC[$c] > 0 ? $maxC[$c] : 1.0;
                $normalized = $row[$c] / $divisor;
                $score += $normalized * ($weights[$c] ?? 0.2);
            }
            $scores[$id] = round($score, 4);
        }

        return $scores;
    }

    /**
     * TOPSIS calculation algorithm
     */
    public function calculateTopsis(array $matrix, array $weights): array
    {
        $sumSquares = ['C1' => 0.0, 'C2' => 0.0, 'C3' => 0.0, 'C4' => 0.0, 'C5' => 0.0];
        foreach ($matrix as $row) {
            foreach (['C1', 'C2', 'C3', 'C4', 'C5'] as $c) {
                $sumSquares[$c] += pow($row[$c], 2);
            }
        }

        $denom = [];
        foreach ($sumSquares as $c => $sum) {
            $denom[$c] = sqrt($sum) > 0 ? sqrt($sum) : 1.0;
        }

        // Weighted normalized matrix
        $weighted = [];
        foreach ($matrix as $id => $row) {
            foreach (['C1', 'C2', 'C3', 'C4', 'C5'] as $c) {
                $r = $row[$c] / $denom[$c];
                $weighted[$id][$c] = $r * ($weights[$c] ?? 0.2);
            }
        }

        // Positive ideal (A+) and negative ideal (A-)
        $idealPos = ['C1' => -INF, 'C2' => -INF, 'C3' => -INF, 'C4' => -INF, 'C5' => -INF];
        $idealNeg = ['C1' => INF, 'C2' => INF, 'C3' => INF, 'C4' => INF, 'C5' => INF];

        foreach ($weighted as $row) {
            foreach (['C1', 'C2', 'C3', 'C4', 'C5'] as $c) {
                if ($row[$c] > $idealPos[$c]) {
                    $idealPos[$c] = $row[$c];
                }
                if ($row[$c] < $idealNeg[$c]) {
                    $idealNeg[$c] = $row[$c];
                }
            }
        }

        // Euclidean distances and relative closeness
        $scores = [];
        foreach ($weighted as $id => $row) {
            $dPos = 0.0;
            $dNeg = 0.0;
            foreach (['C1', 'C2', 'C3', 'C4', 'C5'] as $c) {
                $dPos += pow($row[$c] - $idealPos[$c], 2);
                $dNeg += pow($row[$c] - $idealNeg[$c], 2);
            }
            $dPos = sqrt($dPos);
            $dNeg = sqrt($dNeg);

            $closeness = ($dPos + $dNeg) > 0 ? ($dNeg / ($dPos + $dNeg)) : 0.0;
            $scores[$id] = round($closeness, 4);
        }

        return $scores;
    }

    public function determineUrgency(float $score): string
    {
        if ($score >= 0.70) {
            return 'Prioritas 1 (Kritis / Darurat)';
        }
        if ($score >= 0.50) {
            return 'Prioritas 2 (Tinggi)';
        }
        if ($score >= 0.30) {
            return 'Prioritas 3 (Sedang)';
        }

        return 'Prioritas 4 (Rendah / Normal)';
    }

    public function determineRecommendation(float $score): string
    {
        if ($score >= 0.70) {
            return 'Rujukan Segera ke Psikolog Kampus (< 24 Jam)';
        }
        if ($score >= 0.50) {
            return 'Jadwalkan Konseling Tatap Muka (Minggu Ini)';
        }
        if ($score >= 0.30) {
            return 'Konseling Kelompok / Bimbingan Dosen Wali';
        }

        return 'Edukasi Mandiri & Monitoring Berkala';
    }
}
