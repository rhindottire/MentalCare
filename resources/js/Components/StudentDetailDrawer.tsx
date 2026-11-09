import React, { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export interface DrawerStudentData {
  id: number;
  nim: string;
  name: string;
  prodi: string;
  semester: number;
  c1: number;
  c2: number;
  c3: number;
  c4: number;
  c5: number;
  saw_score: number;
  saw_rank: number;
  topsis_score: number;
  topsis_rank: number;
  urgency_level: string;
  recommendation: string;
  referral_status: string;
  counselor?: string;
  scheduled_at?: string;
}

interface Props {
  student: DrawerStudentData | null;
  onClose: () => void;
  onScheduleClick: (student: DrawerStudentData) => void;
}

export default function StudentDetailDrawer({
  student,
  onClose,
  onScheduleClick,
}: Props) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!student) return null;

  // Normalizing scores for radar chart representation (0-100 scale)
  const radarData = [
    {
      subject: "Depresi (C1)",
      nilai: Math.round((student.c1 / 42) * 100),
      benchmark: 35,
    },
    {
      subject: "Kecemasan (C2)",
      nilai: Math.round((student.c2 / 42) * 100),
      benchmark: 30,
    },
    {
      subject: "Stres (C3)",
      nilai: Math.round((student.c3 / 42) * 100),
      benchmark: 40,
    },
    {
      subject: "Δ IPK (C4)",
      nilai: Math.round((student.c4 / 2.0) * 100),
      benchmark: 20,
    },
    {
      subject: "Tidur (C5)",
      nilai: Math.round((student.c5 / 5.0) * 100),
      benchmark: 40,
    },
  ];

  const isCritical = student.urgency_level.includes("Kritis");

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose}></div>

      {/* Slide-over Drawer Panel */}
      <aside className="w-full max-w-md bg-white dark:bg-[#121316] border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col h-full animate-drawer overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-[#121316]/90 backdrop-blur-md z-10">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Detail Klinis Mahasiswa
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Profile Card */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/60">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white leading-tight">
                {student.name}
              </h2>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">
                NIM: {student.nim} • Semester {student.semester}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {student.prodi}
              </p>
            </div>

            <div>
              {isCritical ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
                  P1 • Kritis
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                  {student.urgency_level}
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
              Rekomendasi Tindakan:
            </span>
            <div className="font-semibold text-zinc-900 dark:text-zinc-100">
              {student.recommendation}
            </div>
          </div>
        </div>

        {/* Algorithmic Scores Comparison */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/60">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-3">
            Kalkulasi Multi-Atribut (MADM)
          </span>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase">
                Metode SAW
              </span>
              <div className="text-lg font-bold font-mono text-zinc-900 dark:text-white mt-1">
                {student.saw_score.toFixed(4)}
              </div>
              <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                Peringkat #{student.saw_rank} dari 100
              </span>
            </div>

            <div className="p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase">
                Metode TOPSIS
              </span>
              <div className="text-lg font-bold font-mono text-zinc-900 dark:text-white mt-1">
                {student.topsis_score.toFixed(4)}
              </div>
              <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                Peringkat #{student.topsis_rank} dari 100
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Radar Chart */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Radar Profil Gejala Klinis
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              Indeks Relatif (%)
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#71717a" opacity={0.2} />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 9, fill: "#71717a" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderRadius: "8px",
                    border: "1px solid #27272a",
                    fontSize: "11px",
                    color: "#fafafa",
                  }}
                />
                <Radar
                  name="Mahasiswa"
                  dataKey="nilai"
                  stroke="#4f46e5"
                  fill="#4f46e5"
                  fillOpacity={0.35}
                />
                <Radar
                  name="Rata-rata Kampus"
                  dataKey="benchmark"
                  stroke="#a1a1aa"
                  fill="#a1a1aa"
                  fillOpacity={0.1}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center space-x-4 text-[10px] text-zinc-400 mt-2">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>Skor Mahasiswa</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
              <span>Benchmark Kampus</span>
            </span>
          </div>
        </div>

        {/* Raw Criteria Scores */}
        <div className="p-5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-3">
            Skor Mentah Kriteria
          </span>
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-400 block">
                C1
              </span>
              <span className="font-mono font-bold text-zinc-900 dark:text-white mt-0.5 block">
                {student.c1}
              </span>
              <span className="text-[9px] text-zinc-400">Depresi</span>
            </div>
            <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-400 block">
                C2
              </span>
              <span className="font-mono font-bold text-zinc-900 dark:text-white mt-0.5 block">
                {student.c2}
              </span>
              <span className="text-[9px] text-zinc-400">Cemas</span>
            </div>
            <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-400 block">
                C3
              </span>
              <span className="font-mono font-bold text-zinc-900 dark:text-white mt-0.5 block">
                {student.c3}
              </span>
              <span className="text-[9px] text-zinc-400">Stres</span>
            </div>
            <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-400 block">
                C4
              </span>
              <span className="font-mono font-bold text-zinc-900 dark:text-white mt-0.5 block">
                -{student.c4.toFixed(2)}
              </span>
              <span className="text-[9px] text-zinc-400">Δ IPK</span>
            </div>
            <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-400 block">
                C5
              </span>
              <span className="font-mono font-bold text-zinc-900 dark:text-white mt-0.5 block">
                {student.c5}/5
              </span>
              <span className="text-[9px] text-zinc-400">Tidur</span>
            </div>
          </div>
        </div>

        {/* Footer Action Button */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 mt-auto sticky bottom-0 bg-white/95 dark:bg-[#121316]/95 backdrop-blur-md">
          <button
            onClick={() => {
              onClose();
              onScheduleClick(student);
            }}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 rounded-lg shadow-xs transition"
          >
            Tetapkan Jadwal Konseling →
          </button>
        </div>
      </aside>
    </div>
  );
}
