import React, { useState, useMemo } from "react";
import AppLayout from "../../Layouts/AppLayout";
import { Head, Link, router } from "@inertiajs/react";
import StudentDetailDrawer, {
  DrawerStudentData,
} from "../../Components/StudentDetailDrawer";

interface SpkItem {
  id: number;
  assessment_id: number;
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
  active_score: number;
  active_rank: number;
  urgency_level: string;
  recommendation: string;
  referral_status: string;
  counselor?: string;
  scheduled_at?: string;
}

interface Props {
  results: {
    data: SpkItem[];
    current_page: number;
    last_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
  };
  criteria: Array<{
    code: string;
    name: string;
    weight: number;
    type: string;
    description: string;
  }>;
  counselors: Array<{
    id: number;
    name: string;
    specialization: string;
  }>;
  prodiList: string[];
  filters: {
    algorithm: "saw" | "topsis";
    search?: string;
    urgency?: string;
    prodi?: string;
  };
}

export default function SpkIndex({
  results,
  criteria,
  counselors,
  prodiList,
  filters,
}: Props) {
  const [algorithm, setAlgorithm] = useState<"saw" | "topsis">(
    filters.algorithm || "saw",
  );
  const [search, setSearch] = useState(filters.search || "");
  const [urgency, setUrgency] = useState(filters.urgency || "");
  const [prodi, setProdi] = useState(filters.prodi || "");
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Interactive Live Simulator State
  const [showSimulator, setShowSimulator] = useState(false);
  const [weights, setWeights] = useState({
    c1: 25,
    c2: 25,
    c3: 20,
    c4: 15,
    c5: 15,
  });

  // Drawer state
  const [drawerStudent, setDrawerStudent] = useState<DrawerStudentData | null>(
    null,
  );

  // Modal state for scheduling counseling
  const [selectedItem, setSelectedItem] = useState<SpkItem | null>(null);
  const [counselorId, setCounselorId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");

  const handleFilterChange = (
    newAlgo?: "saw" | "topsis",
    newSearch?: string,
    newUrgency?: string,
    newProdi?: string,
  ) => {
    const algo = newAlgo !== undefined ? newAlgo : algorithm;
    const s = newSearch !== undefined ? newSearch : search;
    const u = newUrgency !== undefined ? newUrgency : urgency;
    const p = newProdi !== undefined ? newProdi : prodi;

    router.get(
      "/spk",
      {
        algorithm: algo,
        search: s || undefined,
        urgency: u || undefined,
        prodi: p || undefined,
      },
      { preserveState: true, replace: true },
    );
  };

  const handleRecalculate = () => {
    setIsRecalculating(true);
    router.post(
      "/spk/recalculate",
      {},
      {
        onFinish: () => setIsRecalculating(false),
      },
    );
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !counselorId || !scheduledAt) return;

    router.post(
      "/konseling/jadwalkan",
      {
        spk_result_id: selectedItem.id,
        counselor_id: counselorId,
        scheduled_at: scheduledAt,
        notes: clinicalNotes,
      },
      {
        onSuccess: () => {
          setSelectedItem(null);
          setCounselorId("");
          setScheduledAt("");
          setClinicalNotes("");
        },
      },
    );
  };

  // Live Client-Side Recalculation for Real-Time Sensitivity Simulator
  const isCustomWeight =
    weights.c1 !== 25 ||
    weights.c2 !== 25 ||
    weights.c3 !== 20 ||
    weights.c4 !== 15 ||
    weights.c5 !== 15;

  const displayedData = useMemo(() => {
    if (!isCustomWeight) return results.data;

    const totalW =
      weights.c1 + weights.c2 + weights.c3 + weights.c4 + weights.c5 || 100;
    const w1 = weights.c1 / totalW;
    const w2 = weights.c2 / totalW;
    const w3 = weights.c3 / totalW;
    const w4 = weights.c4 / totalW;
    const w5 = weights.c5 / totalW;

    const maxC1 = Math.max(...results.data.map((d) => d.c1), 1);
    const maxC2 = Math.max(...results.data.map((d) => d.c2), 1);
    const maxC3 = Math.max(...results.data.map((d) => d.c3), 1);
    const maxC4 = Math.max(...results.data.map((d) => d.c4), 0.1);
    const maxC5 = Math.max(...results.data.map((d) => d.c5), 1);

    const simulated = results.data.map((item) => {
      const score =
        (item.c1 / maxC1) * w1 +
        (item.c2 / maxC2) * w2 +
        (item.c3 / maxC3) * w3 +
        (item.c4 / maxC4) * w4 +
        (item.c5 / maxC5) * w5;
      return {
        ...item,
        active_score: Math.round(score * 10000) / 10000,
      };
    });

    // Re-sort and re-rank
    simulated.sort((a, b) => b.active_score - a.active_score);
    return simulated.map((item, idx) => ({
      ...item,
      active_rank: idx + 1,
    }));
  }, [results.data, weights, isCustomWeight]);

  const resetWeights = () => {
    setWeights({ c1: 25, c2: 25, c3: 20, c4: 15, c5: 15 });
  };

  const getUrgencyBadge = (level: string) => {
    if (level.includes("Kritis")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
          P1 • Kritis
        </span>
      );
    }
    if (level.includes("Tinggi")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60">
          P2 • Tinggi
        </span>
      );
    }
    if (level.includes("Sedang")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
          P3 • Sedang
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
        P4 • Normal
      </span>
    );
  };

  return (
    <AppLayout title="Matriks SPK">
      <Head title="Matriks & Triase SPK - SIM-KEMAS" />

      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
            Matriks & Perangkingan Triase SPK
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Menampilkan evaluasi komparatif multi-kriteria untuk 100 sampel
            mahasiswa. Klik baris untuk membuka radar interaktif.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowSimulator(!showSimulator)}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              showSimulator
                ? "bg-indigo-600 text-white shadow-2xs"
                : "text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
            }`}
          >
            ⚡ Simulator Bobot Real-Time
          </button>
          <button
            onClick={handleRecalculate}
            disabled={isRecalculating}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition disabled:opacity-50"
          >
            {isRecalculating ? "Menghitung..." : "↻ Hitung Ulang"}
          </button>
          <a
            href="/spk/export"
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition shadow-2xs"
          >
            ↓ Unduh CSV
          </a>
        </div>
      </div>

      {/* Live Weight Simulator Drawer / Accordion */}
      {showSimulator && (
        <div className="bg-white dark:bg-[#121316] p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 shadow-xs mb-5 animate-fade-scale">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
              <span className="text-xs font-bold text-zinc-900 dark:text-white">
                Mode Simulasi Sensitivitas Bobot SPK (Kalkulasi 0ms Client-Side)
              </span>
            </div>
            {isCustomWeight && (
              <button
                onClick={resetWeights}
                className="text-[11px] font-mono text-rose-600 hover:underline"
              >
                Reset ke Bobot Baku
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div>
              <div className="flex justify-between text-[11px] font-mono mb-1">
                <span className="text-zinc-500">C1. Depresi</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {weights.c1}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={weights.c1}
                onChange={(e) =>
                  setWeights({ ...weights, c1: parseInt(e.target.value) || 0 })
                }
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono mb-1">
                <span className="text-zinc-500">C2. Cemas</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {weights.c2}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={weights.c2}
                onChange={(e) =>
                  setWeights({ ...weights, c2: parseInt(e.target.value) || 0 })
                }
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono mb-1">
                <span className="text-zinc-500">C3. Stres</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {weights.c3}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={weights.c3}
                onChange={(e) =>
                  setWeights({ ...weights, c3: parseInt(e.target.value) || 0 })
                }
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono mb-1">
                <span className="text-zinc-500">C4. Δ IPK</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {weights.c4}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={weights.c4}
                onChange={(e) =>
                  setWeights({ ...weights, c4: parseInt(e.target.value) || 0 })
                }
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono mb-1">
                <span className="text-zinc-500">C5. Tidur</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {weights.c5}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={weights.c5}
                onChange={(e) =>
                  setWeights({ ...weights, c5: parseInt(e.target.value) || 0 })
                }
                className="w-full accent-indigo-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Filter & Algorithm Selector Strip */}
      <div className="bg-white dark:bg-[#121316] p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Segmented Control */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mr-1">
            Algoritma:
          </span>
          <div className="inline-flex rounded-lg bg-zinc-100 dark:bg-zinc-800/70 p-0.5 border border-zinc-200 dark:border-zinc-700/60">
            <button
              type="button"
              onClick={() => {
                setAlgorithm("saw");
                handleFilterChange("saw");
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                algorithm === "saw"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs font-semibold"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              SAW (Linear)
            </button>
            <button
              type="button"
              onClick={() => {
                setAlgorithm("topsis");
                handleFilterChange("topsis");
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                algorithm === "topsis"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs font-semibold"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              TOPSIS (Euclidean)
            </button>
          </div>
        </div>

        {/* Filter Inputs */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Cari NIM atau nama..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleFilterChange(undefined, e.target.value);
            }}
            className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-hidden focus:border-zinc-400 w-44"
          />

          <select
            value={urgency}
            onChange={(e) => {
              setUrgency(e.target.value);
              handleFilterChange(undefined, undefined, e.target.value);
            }}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-hidden"
          >
            <option value="">Semua Urgensi</option>
            <option value="Prioritas 1 (Kritis / Darurat)">Kritis (P1)</option>
            <option value="Prioritas 2 (Tinggi)">Tinggi (P2)</option>
            <option value="Prioritas 3 (Sedang)">Sedang (P3)</option>
            <option value="Prioritas 4 (Rendah / Normal)">Normal (P4)</option>
          </select>

          <select
            value={prodi}
            onChange={(e) => {
              setProdi(e.target.value);
              handleFilterChange(
                undefined,
                undefined,
                undefined,
                e.target.value,
              );
            }}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-hidden"
          >
            <option value="">Semua Prodi</option>
            {prodiList.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white dark:bg-[#121316] rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs overflow-hidden mb-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/60 dark:bg-zinc-800/40 text-[11px] font-mono uppercase text-zinc-400 dark:text-zinc-500 border-b border-zinc-200/80 dark:border-zinc-800/80">
              <tr>
                <th className="px-3.5 py-2.5 text-center w-12">Rank</th>
                <th className="px-3.5 py-2.5">Mahasiswa</th>
                <th className="px-3.5 py-2.5">Prodi</th>
                <th className="px-2.5 py-2.5 text-right font-mono">C1 (Dep)</th>
                <th className="px-2.5 py-2.5 text-right font-mono">C2 (Cem)</th>
                <th className="px-2.5 py-2.5 text-right font-mono">C3 (Str)</th>
                <th className="px-2.5 py-2.5 text-right font-mono">
                  C4 (ΔIPK)
                </th>
                <th className="px-2.5 py-2.5 text-right font-mono">C5 (Tdr)</th>
                <th className="px-3.5 py-2.5 text-right font-mono text-zinc-900 dark:text-white font-bold">
                  Skor {algorithm.toUpperCase()}
                </th>
                <th className="px-3.5 py-2.5">Status Triase</th>
                <th className="px-3.5 py-2.5 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {displayedData.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setDrawerStudent(item)}
                  className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors group"
                >
                  <td className="px-3.5 py-2.5 text-center font-mono font-bold text-zinc-900 dark:text-white text-xs">
                    #{item.active_rank}
                  </td>
                  <td className="px-3.5 py-2.5">
                    <div className="font-semibold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.name}
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400">
                      {item.nim} • Sem. {item.semester}
                    </div>
                  </td>
                  <td className="px-3.5 py-2.5 text-zinc-500 dark:text-zinc-400 text-[11px]">
                    {item.prodi}
                  </td>
                  <td className="px-2.5 py-2.5 text-right font-mono text-zinc-600 dark:text-zinc-300">
                    {item.c1}
                  </td>
                  <td className="px-2.5 py-2.5 text-right font-mono text-zinc-600 dark:text-zinc-300">
                    {item.c2}
                  </td>
                  <td className="px-2.5 py-2.5 text-right font-mono text-zinc-600 dark:text-zinc-300">
                    {item.c3}
                  </td>
                  <td className="px-2.5 py-2.5 text-right font-mono text-zinc-600 dark:text-zinc-300">
                    {item.c4.toFixed(2)}
                  </td>
                  <td className="px-2.5 py-2.5 text-right font-mono text-zinc-600 dark:text-zinc-300">
                    {item.c5}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono font-bold text-zinc-900 dark:text-white bg-zinc-50/50 dark:bg-zinc-800/20">
                    {item.active_score.toFixed(4)}
                  </td>
                  <td className="px-3.5 py-2.5">
                    {getUrgencyBadge(item.urgency_level)}
                  </td>
                  <td
                    className="px-3.5 py-2.5 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.referral_status === "scheduled" ? (
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ Terjadwal
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="inline-flex items-center px-2 py-1 text-[11px] font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-md transition hover:scale-105 active:scale-95"
                      >
                        Jadwalkan
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <div>
            Menampilkan halaman {results.current_page} dari {results.last_page}{" "}
            ({results.total} data)
          </div>
          <div className="flex items-center space-x-1">
            {results.links.map((link, idx) => (
              <Link
                key={idx}
                href={link.url || "#"}
                className={`px-2.5 py-1 rounded text-xs ${
                  link.active
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold"
                    : link.url
                      ? "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      : "text-zinc-300 dark:text-zinc-600 pointer-events-none"
                }`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Slide-over Detail Drawer Component */}
      <StudentDetailDrawer
        student={drawerStudent}
        onClose={() => setDrawerStudent(null)}
        onScheduleClick={(s) => {
          const match = results.data.find((item) => item.id === s.id);
          if (match) setSelectedItem(match);
        }}
      />

      {/* Modal: Schedule Counseling Session */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#121316] rounded-xl max-w-md w-full p-5 shadow-xl border border-zinc-200 dark:border-zinc-800 animate-fade-scale">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Penetapan Jadwal Konseling
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Rujukan otomatis berdasarkan rekomendasi SPK SIM-KEMAS
                </p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 text-xs mb-4 space-y-1 text-zinc-700 dark:text-zinc-300">
              <div>
                <strong>Mahasiswa:</strong> {selectedItem.name} (
                {selectedItem.nim})
              </div>
              <div>
                <strong>Program Studi:</strong> {selectedItem.prodi}
              </div>
              <div>
                <strong>Tingkat Urgensi:</strong> {selectedItem.urgency_level}
              </div>
              <div>
                <strong>Skor:</strong> SAW {selectedItem.saw_score.toFixed(4)} |
                TOPSIS {selectedItem.topsis_score.toFixed(4)}
              </div>
              <div className="text-indigo-600 dark:text-indigo-400 font-medium pt-1">
                <strong>Rekomendasi:</strong> {selectedItem.recommendation}
              </div>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Pilih Konselor Kampus:
                </label>
                <select
                  required
                  value={counselorId}
                  onChange={(e) => setCounselorId(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 focus:outline-hidden bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                >
                  <option value="">-- Pilih Konselor --</option>
                  {counselors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Waktu Konseling:
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 focus:outline-hidden bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Catatan Klinis (Opsional):
                </label>
                <textarea
                  rows={2}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Prioritas sesi..."
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 focus:outline-hidden bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 rounded-lg shadow-2xs"
                >
                  Tetapkan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
