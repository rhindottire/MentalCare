<?php

namespace Tests\Unit;

use App\Services\SpkCalculationService;
use PHPUnit\Framework\TestCase;

class SpkCalculationServiceTest extends TestCase
{
    private SpkCalculationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new SpkCalculationService;
    }

    public function test_saw_calculation_accuracy(): void
    {
        $matrix = [
            1 => ['C1' => 40.0, 'C2' => 40.0, 'C3' => 40.0, 'C4' => 2.0, 'C5' => 5.0],
            2 => ['C1' => 20.0, 'C2' => 20.0, 'C3' => 20.0, 'C4' => 1.0, 'C5' => 2.5],
        ];

        $weights = [
            'C1' => 0.25,
            'C2' => 0.25,
            'C3' => 0.20,
            'C4' => 0.15,
            'C5' => 0.15,
        ];

        $scores = $this->service->calculateSaw($matrix, $weights);

        // Maximum values are from item 1: all normalized ratios = 1.0 -> sum(w) = 1.0
        $this->assertEquals(1.0, $scores[1]);

        // Item 2 has exactly half of item 1 -> normalized ratios = 0.5 -> sum(0.5 * w) = 0.5
        $this->assertEquals(0.5, $scores[2]);
    }

    public function test_topsis_calculation_accuracy(): void
    {
        $matrix = [
            1 => ['C1' => 40.0, 'C2' => 40.0, 'C3' => 40.0, 'C4' => 2.0, 'C5' => 5.0],
            2 => ['C1' => 10.0, 'C2' => 10.0, 'C3' => 10.0, 'C4' => 0.5, 'C5' => 1.0],
        ];

        $weights = [
            'C1' => 0.25,
            'C2' => 0.25,
            'C3' => 0.20,
            'C4' => 0.15,
            'C5' => 0.15,
        ];

        $scores = $this->service->calculateTopsis($matrix, $weights);

        // Item 1 has strictly higher values on all benefit criteria -> higher closeness to ideal
        $this->assertGreaterThan($scores[2], $scores[1]);
        $this->assertEquals(1.0, $scores[1]);
        $this->assertEquals(0.0, $scores[2]);
    }

    public function test_urgency_level_determination(): void
    {
        $this->assertEquals('Prioritas 1 (Kritis / Darurat)', $this->service->determineUrgency(0.85));
        $this->assertEquals('Prioritas 2 (Tinggi)', $this->service->determineUrgency(0.65));
        $this->assertEquals('Prioritas 3 (Sedang)', $this->service->determineUrgency(0.45));
        $this->assertEquals('Prioritas 4 (Rendah / Normal)', $this->service->determineUrgency(0.20));
    }
}
