<?php

use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\CounselingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SpkController;
use Illuminate\Support\Facades\Route;

// 1. Dashboard Eksekutif & Analitik
Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

// 2. SPK Triase & Ranking Table (SAW & TOPSIS)
Route::get('/spk', [SpkController::class, 'index'])->name('spk.index');
Route::post('/spk/recalculate', [SpkController::class, 'recalculate'])->name('spk.recalculate');
Route::get('/spk/export', [SpkController::class, 'exportCsv'])->name('spk.export');

// 3. Self-Screening Mahasiswa (DASS-21)
Route::get('/skrining', [AssessmentController::class, 'create'])->name('assessment.create');
Route::post('/skrining', [AssessmentController::class, 'store'])->name('assessment.store');
Route::get('/skrining/hasil/{id}', [AssessmentController::class, 'showResult'])->name('assessment.result');

// 4. Manajemen Jadwal Konseling
Route::get('/konseling', [CounselingController::class, 'index'])->name('counseling.index');
Route::post('/konseling/jadwalkan', [CounselingController::class, 'schedule'])->name('counseling.schedule');
