<?php

namespace Database\Seeders;

use App\Models\Assessment;
use App\Models\Counselor;
use App\Models\SpkCriterion;
use App\Models\Student;
use App\Models\User;
use App\Services\SpkCalculationService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Users (Admin, Konselor, Mahasiswa Demo)
        User::updateOrCreate(
            ['email' => 'admin@simkemas.ac.id'],
            [
                'name' => 'Administrator Kampus',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        User::updateOrCreate(
            ['email' => 'konselor@simkemas.ac.id'],
            [
                'name' => 'Dr. Rina Rahayu, M.Psi., Psikolog',
                'password' => Hash::make('password'),
                'role' => 'counselor',
            ]
        );

        User::updateOrCreate(
            ['email' => 'mahasiswa@simkemas.ac.id'],
            [
                'name' => 'Rizky Handayani',
                'password' => Hash::make('password'),
                'role' => 'student',
                'nim' => '260411100045',
            ]
        );

        // 2. Seed Criteria
        $criteriaData = [
            ['code' => 'C1', 'name' => 'Tingkat Gejala Depresi (DASS-21)', 'weight' => 0.25, 'type' => 'benefit', 'description' => 'Rentang skor 0-42. Mengukur anhedonia, disforia, keputusasaan, dan penurunan inisiatif.'],
            ['code' => 'C2', 'name' => 'Tingkat Gejala Kecemasan (DASS-21)', 'weight' => 0.25, 'type' => 'benefit', 'description' => 'Rentang skor 0-42. Mengukur respon otonom somatik, kepanikan, dan ketakutan situasional.'],
            ['code' => 'C3', 'name' => 'Tingkat Stres Emosional (DASS-21)', 'weight' => 0.20, 'type' => 'benefit', 'description' => 'Rentang skor 0-42. Mengukur ketegangan syaraf, iritabilitas, dan reaksi berlebihan terhadap stresor.'],
            ['code' => 'C4', 'name' => 'Penurunan IPK Semester Ini', 'weight' => 0.15, 'type' => 'benefit', 'description' => 'Selisih penurunan IPK (0.00 - 2.00). Dampak stres terhadap fungsi akademik.'],
            ['code' => 'C5', 'name' => 'Gangguan Tidur & Fungsi Harian', 'weight' => 0.15, 'type' => 'benefit', 'description' => 'Skala 1-5 (1=Sangat Baik, 5=Insomnia Parah & Disfungsi Sosial).'],
        ];

        foreach ($criteriaData as $c) {
            SpkCriterion::updateOrCreate(['code' => $c['code']], $c);
        }

        // 3. Seed Counselors
        $counselors = [
            ['name' => 'Dr. Rina Rahayu, M.Psi., Psikolog', 'specialization' => 'Krisis Emosi, Depresi & Trauma Mahasiswa', 'phone' => '081234567890'],
            ['name' => 'Farhan Nugraha, S.Psi., M.A.', 'specialization' => 'Kecemasan Akademik, Tugas Akhir & Burnout', 'phone' => '081234567891'],
            ['name' => 'Siti Aisyah, M.Psi.', 'specialization' => 'Penyesuaian Diri, Hubungan Interpersonal & Karir', 'phone' => '081234567892'],
        ];

        foreach ($counselors as $cs) {
            Counselor::updateOrCreate(['name' => $cs['name']], $cs);
        }

        // 4. Import 100 Students & Assessments from CSV
        $csvFile = base_path('dataset_kesehatan_mental_100.csv');
        if (file_exists($csvFile)) {
            $handle = fopen($csvFile, 'r');
            // Skip header
            fgetcsv($handle);

            while (($row = fgetcsv($handle)) !== false) {
                // Header: Ranking, NIM, Nama Mahasiswa, Program Studi, Fakultas, Semester, C1, C2, C3, C4, C5, Skor_SAW, Tingkat_Urgensi, Rekomendasi
                $nim = $row[1];
                $name = $row[2];
                $prodi = $row[3];
                $fakultas = $row[4];
                $semester = (int) $row[5];
                $c1 = (int) $row[6];
                $c2 = (int) $row[7];
                $c3 = (int) $row[8];
                $c4 = (float) $row[9];
                $c5 = (int) $row[10];

                Student::updateOrCreate(
                    ['nim' => $nim],
                    [
                        'name' => $name,
                        'study_program' => $prodi,
                        'faculty' => $fakultas,
                        'semester' => $semester,
                        'email' => "{$nim}@student.trunojoyo.ac.id",
                        'phone' => '08'.rand(1111111111, 9999999999),
                    ]
                );

                Assessment::updateOrCreate(
                    [
                        'student_nim' => $nim,
                        'assessment_date' => '2026-11-05',
                    ],
                    [
                        'score_c1_depression' => $c1,
                        'score_c2_anxiety' => $c2,
                        'score_c3_stress' => $c3,
                        'score_c4_gpa_drop' => $c4,
                        'score_c5_sleep_disturbance' => $c5,
                        'student_notes' => 'Asesmen awal triase kesehatan mental semester ganjil.',
                    ]
                );
            }
            fclose($handle);
        }

        // 5. Run SPK Calculation Engine (SAW + TOPSIS)
        $spkEngine = new SpkCalculationService;
        $spkEngine->recalculateAll();
    }
}
