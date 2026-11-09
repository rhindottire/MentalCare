import React from "react";
import AppLayout from "../../Layouts/AppLayout";
import { Head, Link } from "@inertiajs/react";

interface Props {
  assessment: {
    id: number;
    nim: string;
    name: string;
    prodi: string;
    semester: number;
    date: string;
    c1: number;
    c2: number;
    c3: number;
    c4: number;
    c5: number;
    saw_score: number;
    saw_rank: number;
    topsis_score: number;
    topsis_rank: number;
    urgency: string;
    recommendation: string;
    status: string;
  };
}

export default function AssessmentResult({ assessment }: Props) {
  const isCritical = assessment.urgency?.includes("Kritis");
  const isHigh = assessment.urgency?.includes("Tinggi");

  return (
    <AppLayout title="Hasil Triase">
      <Head title="Lembar Diagnosis Triase - SIM-KEMAS" />

      <div className="max-w-2xl mx-auto">
        {/* Result Card: Clinical Sheet style */}
        <div className="bg-white dark:bg-[#121316] rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 shadow-2xs mb-6">
          {/* Header Status Tag */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80 mb-5">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                Lembar Hasil Triase Klinis
              </span>
              <h1 className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">
                {assessment.name} ({assessment.nim})
              </h1>
            </div>

            <div>
              {isCritical ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-mono font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
                  P1 • Kritis
                </span>
              ) : isHigh ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-mono font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60">
                  P2 • Tinggi
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-mono font-medium text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                  P3 / P4 • Normal
                </span>
              )}
            </div>
          </div>

          {/* Clinical Finding & Recommendation */}
          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 mb-5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
              Rekomendasi Tindakan Triase:
            </div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {assessment.recommendation}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Status Urgensi: <strong>{assessment.urgency}</strong> • Tanggal
              Asesmen: {assessment.date}
            </div>
          </div>

          {/* Algorithmic SPK Calculation Output */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-zinc-100 dark:border-zinc-800/80 mb-5">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">
                Rank SAW
              </span>
              <span className="text-base font-mono font-bold text-zinc-900 dark:text-white mt-0.5 block">
                #{assessment.saw_rank}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">
                Skor SAW
              </span>
              <span className="text-base font-mono font-bold text-zinc-900 dark:text-white mt-0.5 block">
                {assessment.saw_score?.toFixed(4)}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">
                Rank TOPSIS
              </span>
              <span className="text-base font-mono font-bold text-zinc-900 dark:text-white mt-0.5 block">
                #{assessment.topsis_rank}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">
                Skor TOPSIS
              </span>
              <span className="text-base font-mono font-bold text-zinc-900 dark:text-white mt-0.5 block">
                {assessment.topsis_score?.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Dimension Breakdown */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-zinc-900 dark:text-white mb-2">
              Rincian Skor Dimensi Klinis:
            </div>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] text-zinc-400 font-mono block">
                  Depresi
                </span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white mt-0.5 block">
                  {assessment.c1}
                </span>
              </div>
              <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] text-zinc-400 font-mono block">
                  Cemas
                </span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white mt-0.5 block">
                  {assessment.c2}
                </span>
              </div>
              <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] text-zinc-400 font-mono block">
                  Stres
                </span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white mt-0.5 block">
                  {assessment.c3}
                </span>
              </div>
              <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] text-zinc-400 font-mono block">
                  Δ IPK
                </span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white mt-0.5 block">
                  -{assessment.c4.toFixed(2)}
                </span>
              </div>
              <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] text-zinc-400 font-mono block">
                  Tidur
                </span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white mt-0.5 block">
                  {assessment.c5}/5
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/skrining"
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            ← Isi Skrining Mahasiswa Lain
          </Link>

          <div className="flex items-center space-x-2">
            <Link
              href="/spk"
              className="px-3.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-300"
            >
              Lihat Matriks SPK
            </Link>
            <Link
              href={`/spk?search=${assessment.nim}`}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-lg shadow-2xs"
            >
              Jadwalkan Konselor
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
