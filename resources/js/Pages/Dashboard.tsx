import React, { useState } from "react";
import AppLayout from "../Layouts/AppLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useAnimatedCount } from "../hooks/useAnimatedCount";
import StudentDetailDrawer, {
  DrawerStudentData,
} from "../Components/StudentDetailDrawer";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  metrics: {
    totalStudents: number;
    totalAssessments: number;
    totalCounselors: number;
    kritisCount: number;
    tinggiCount: number;
    sedangCount: number;
    rendahCount: number;
  };
  prodiStats: Array<{
    study_program: string;
    count: number;
    avg_depression: number;
    avg_anxiety: number;
    avg_stress: number;
  }>;
  topCritical: Array<{
    id: number;
    rank: number;
    nim: string;
    name: string;
    prodi: string;
    saw_score: number;
    topsis_score: number;
    urgency: string;
    recommendation: string;
    status: string;
  }>;
}

export default function Dashboard({ metrics, prodiStats, topCritical }: Props) {
  // Animated numerical counters
  const animatedTotal = useAnimatedCount(metrics.totalStudents, 600);
  const animatedKritis = useAnimatedCount(metrics.kritisCount, 600);
  const animatedTinggi = useAnimatedCount(metrics.tinggiCount, 600);
  const animatedMonitoring = useAnimatedCount(
    metrics.sedangCount + metrics.rendahCount,
    600,
  );

  // Drawer state
  const [drawerStudent, setDrawerStudent] = useState<DrawerStudentData | null>(
    null,
  );

  const chartData = prodiStats.map((p) => ({
    name: p.study_program.replace("Teknik ", "Tek. ").replace("Fakultas ", ""),
    rataRataStres: Number(p.avg_stress),
    mahasiswa: p.count,
  }));

  const pctKritis =
    Math.round((metrics.kritisCount / metrics.totalStudents) * 100) || 0;
  const pctTinggi =
    Math.round((metrics.tinggiCount / metrics.totalStudents) * 100) || 0;
  const pctSedang =
    Math.round((metrics.sedangCount / metrics.totalStudents) * 100) || 0;
  const pctRendah = 100 - pctKritis - pctTinggi - pctSedang;

  const handleOpenDrawerFromRow = (item: any) => {
    // Mocking criteria scores from topCritical or navigating
    const studentData: DrawerStudentData = {
      id: item.id,
      nim: item.nim,
      name: item.name,
      prodi: item.prodi,
      semester: 5,
      c1: 32,
      c2: 30,
      c3: 36,
      c4: 1.45,
      c5: 5,
      saw_score: item.saw_score,
      saw_rank: item.rank,
      topsis_score: item.topsis_score,
      topsis_rank: item.rank,
      urgency_level: item.urgency,
      recommendation: item.recommendation,
      referral_status: item.status,
    };
    setDrawerStudent(studentData);
  };

  return (
    <AppLayout title="Dashboard Triase">
      <Head title="Ringkasan Triase Klinis - SIM-KEMAS" />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
            Triase & Pemantauan Kesehatan Mental
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Pemetaan 100 sampel mahasiswa berdasarkan instrumen DASS-21,
            penurunan IPK, dan disfungsi tidur.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-zinc-400 dark:text-zinc-500">
            Kapasitas Layanan:
          </span>
          <strong className="text-zinc-700 dark:text-zinc-200">
            {metrics.totalCounselors} Psikolog Siap
          </strong>
        </div>
      </div>

      {/* Section 1: Executive Triage Ratio Strip with Animated Figures */}
      <div className="bg-white dark:bg-[#121316] rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 mb-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Distribusi Urgensi Triase Kampus
            </div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {animatedKritis} Mahasiswa Berada pada Status Kritis (Prioritas 1)
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                Kritis ({pctKritis}%)
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                Tinggi ({pctTinggi}%)
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-400"></span>
              <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                Sedang ({pctSedang}%)
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-700"></span>
              <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                Normal ({pctRendah}%)
              </span>
            </div>
          </div>
        </div>

        {/* Unified Segmented Triage Bar */}
        <div className="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 flex overflow-hidden p-0.5 gap-0.5">
          <div
            style={{ width: `${pctKritis}%` }}
            className="bg-rose-600 rounded-l-full transition-all duration-700"
            title={`Kritis: ${metrics.kritisCount}`}
          ></div>
          <div
            style={{ width: `${pctTinggi}%` }}
            className="bg-amber-500 transition-all duration-700"
            title={`Tinggi: ${metrics.tinggiCount}`}
          ></div>
          <div
            style={{ width: `${pctSedang}%` }}
            className="bg-zinc-400 dark:bg-zinc-500 transition-all duration-700"
            title={`Sedang: ${metrics.sedangCount}`}
          ></div>
          <div
            style={{ width: `${pctRendah}%` }}
            className="bg-zinc-200 dark:bg-zinc-700 rounded-r-full transition-all duration-700"
            title={`Normal: ${metrics.rendahCount}`}
          ></div>
        </div>

        {/* Key Metrics Figures (Animated Numbers) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
          <div>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block">
              Total Asesmen
            </span>
            <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5 block">
              {animatedTotal}
            </span>
            <span className="text-[11px] text-zinc-500">
              100% sampel terverifikasi
            </span>
          </div>

          <div>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block">
              Intervensi &lt; 24 Jam
            </span>
            <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5 block">
              {animatedKritis}
            </span>
            <span className="text-[11px] text-rose-600/80 dark:text-rose-400/80 font-medium">
              Prioritas 1
            </span>
          </div>

          <div>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block">
              Konseling Minggu Ini
            </span>
            <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5 block">
              {animatedTinggi}
            </span>
            <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80 font-medium">
              Prioritas 2
            </span>
          </div>

          <div>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block">
              Pemantauan Mandiri
            </span>
            <span className="text-xl font-bold font-mono text-zinc-700 dark:text-zinc-300 mt-0.5 block">
              {animatedMonitoring}
            </span>
            <span className="text-[11px] text-zinc-400">Prioritas 3 & 4</span>
          </div>
        </div>
      </div>

      {/* Section 2: Two-Column Working Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left (7 cols): High Urgency Triase Queue */}
        <div className="lg:col-span-7 bg-white dark:bg-[#121316] rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-2xs flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                  <span>Antrean Triase Kritis (Prioritas 1)</span>
                </h2>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                  Klik baris mahasiswa untuk membuka radar profil & rujukan
                  interaktif.
                </p>
              </div>

              <Link
                href="/spk?urgency=Prioritas+1+(Kritis+/+Darurat)"
                className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                Lihat Semua ({metrics.kritisCount}) →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/60 dark:bg-zinc-800/40 text-[11px] text-zinc-400 uppercase font-mono tracking-wider border-b border-zinc-100 dark:border-zinc-800/60">
                  <tr>
                    <th className="px-3.5 py-2.5">Rank</th>
                    <th className="px-3.5 py-2.5">Mahasiswa</th>
                    <th className="px-3.5 py-2.5">Program Studi</th>
                    <th className="px-3.5 py-2.5 text-right font-mono">SAW</th>
                    <th className="px-3.5 py-2.5 text-right font-mono">
                      TOPSIS
                    </th>
                    <th className="px-3.5 py-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                  {topCritical.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenDrawerFromRow(item)}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors group"
                    >
                      <td className="px-3.5 py-3 font-mono font-bold text-rose-600 dark:text-rose-400">
                        #{item.rank}
                      </td>
                      <td className="px-3.5 py-3">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {item.name}
                        </div>
                        <div className="text-[11px] font-mono text-zinc-400">
                          {item.nim}
                        </div>
                      </td>
                      <td className="px-3.5 py-3 text-zinc-500 dark:text-zinc-400 text-[11px]">
                        {item.prodi}
                      </td>
                      <td className="px-3.5 py-3 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {item.saw_score.toFixed(4)}
                      </td>
                      <td className="px-3.5 py-3 text-right font-mono text-zinc-500 dark:text-zinc-400 text-[11px]">
                        {item.topsis_score.toFixed(4)}
                      </td>
                      <td
                        className="px-3.5 py-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          href={`/spk?search=${item.nim}`}
                          className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 rounded-md transition shadow-2xs hover:scale-105 active:scale-95"
                        >
                          Jadwalkan
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-zinc-50/50 dark:bg-zinc-800/20 border-t border-zinc-100 dark:border-zinc-800/60 text-right">
            <Link
              href="/spk"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Buka Matriks Lengkap 100 Mahasiswa →
            </Link>
          </div>
        </div>

        {/* Right (5 cols): Academic Stress Chart */}
        <div className="lg:col-span-5 bg-white dark:bg-[#121316] rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  Tingkat Stres per Program Studi
                </h2>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  Rata-rata skor subskala stres DASS-21 (0-42)
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                10 Prodi
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: -24, bottom: 24 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#71717a"
                    opacity={0.15}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    angle={-25}
                    textAnchor="end"
                    tick={{ fontSize: 9, fill: "#71717a" }}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#71717a" }}
                    domain={[0, 42]}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(99, 102, 241, 0.05)" }}
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderRadius: "8px",
                      border: "1px solid #27272a",
                      fontSize: "11px",
                      color: "#fafafa",
                    }}
                  />
                  <Bar
                    dataKey="rataRataStres"
                    name="Rata-rata Stres"
                    fill="#4f46e5"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 dark:text-zinc-500 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
            <span>Ambang Batas Klinis Stres Berat: ≥ 26</span>
            <Link
              href="/skrining"
              className="font-semibold text-zinc-700 dark:text-zinc-200 hover:underline"
            >
              Input Skrining Baru →
            </Link>
          </div>
        </div>
      </div>

      {/* Slide-over Drawer Component */}
      <StudentDetailDrawer
        student={drawerStudent}
        onClose={() => setDrawerStudent(null)}
        onScheduleClick={(s) => {
          router.get(`/spk?search=${s.nim}`);
        }}
      />
    </AppLayout>
  );
}
