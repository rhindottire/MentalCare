import React, { useState } from "react";
import AppLayout from "../../Layouts/AppLayout";
import { Head, useForm } from "@inertiajs/react";

interface DassItem {
  id: string;
  scale: "depression" | "anxiety" | "stress";
  text: string;
}

interface Props {
  dassItems: DassItem[];
}

export default function AssessmentCreate({ dassItems }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const { data, setData, post, processing, errors } = useForm({
    nim: "",
    name: "",
    study_program: "Sistem Informasi",
    faculty: "Fakultas Teknik",
    semester: 5,
    phone: "",
    depression_sum: 0,
    anxiety_sum: 0,
    stress_sum: 0,
    gpa_drop: 0.2,
    sleep_disturbance: 2,
    notes: "",
  });

  const handleAnswerChange = (
    itemId: string,
    value: number,
    scale: "depression" | "anxiety" | "stress",
  ) => {
    const nextAnswers = { ...answers, [itemId]: value };
    setAnswers(nextAnswers);

    let dep = 0;
    let anx = 0;
    let str = 0;

    dassItems.forEach((item) => {
      const val = nextAnswers[item.id] !== undefined ? nextAnswers[item.id] : 0;
      if (item.scale === "depression") dep += val;
      if (item.scale === "anxiety") anx += val;
      if (item.scale === "stress") str += val;
    });

    setData((prev) => ({
      ...prev,
      depression_sum: dep,
      anxiety_sum: anx,
      stress_sum: str,
    }));
  };

  const answeredCount = Object.keys(answers).length;
  const progressPct = Math.round((answeredCount / dassItems.length) * 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post("/skrining");
  };

  return (
    <AppLayout title="Skrining DASS-21">
      <Head title="Asesmen Mandiri Mahasiswa - SIM-KEMAS" />

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Instrumen Klinis Baku DASS-21
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-2xl mt-0.5">
            Formulir Asesmen Triase Mahasiswa
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Skrining mandiri 21 butir pernyataan psikometrik untuk mendeteksi
            dini indikator depresi, kecemasan somatik, dan stres akademik.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Identitas */}
          <div className="bg-white dark:bg-[#121316] rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-2xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-3 pb-2 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
              <span>1. Data Akademik Mahasiswa</span>
              <span className="text-[11px] font-normal font-mono text-zinc-400">
                Wajib Diisi
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  NIM Mahasiswa
                </label>
                <input
                  type="text"
                  required
                  placeholder="230411100xxx"
                  value={data.nim}
                  onChange={(e) => setData("nim", e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-hidden focus:border-zinc-400"
                />
                {errors.nim && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.nim}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama mahasiswa"
                  value={data.name}
                  onChange={(e) => setData("name", e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-hidden focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Program Studi
                </label>
                <select
                  value={data.study_program}
                  onChange={(e) => setData("study_program", e.target.value)}
                  className="w-full text-xs px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-hidden"
                >
                  <option value="Sistem Informasi">Sistem Informasi</option>
                  <option value="Teknik Informatika">Teknik Informatika</option>
                  <option value="Teknik Elektro">Teknik Elektro</option>
                  <option value="Teknik Industri">Teknik Industri</option>
                  <option value="Teknik Mesin">Teknik Mesin</option>
                  <option value="Teknik Mekatronika">Teknik Mekatronika</option>
                  <option value="Manajemen">Manajemen</option>
                  <option value="Akuntansi">Akuntansi</option>
                  <option value="Ilmu Hukum">Ilmu Hukum</option>
                  <option value="Psikologi">Psikologi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Fakultas
                </label>
                <input
                  type="text"
                  required
                  value={data.faculty}
                  onChange={(e) => setData("faculty", e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Semester
                </label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  required
                  value={data.semester}
                  onChange={(e) =>
                    setData("semester", parseInt(e.target.value) || 1)
                  }
                  className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Kontak Darurat / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="08xxxxxxxxxx"
                  value={data.phone}
                  onChange={(e) => setData("phone", e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 2: DASS-21 Questionnaire */}
          <div className="bg-white dark:bg-[#121316] rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80 mb-4 gap-2">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                  2. Kuesioner Gejala Psikologis (1 Minggu Terakhir)
                </h2>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                  Skala: 0 (Tidak Pernah) s/d 3 (Hampir Selalu)
                </p>
              </div>

              {/* Minimal Live Score Tally */}
              <div className="flex items-center space-x-2 text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  Depresi: {data.depression_sum * 2}
                </span>
                <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  Cemas: {data.anxiety_sum * 2}
                </span>
                <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  Stres: {data.stress_sum * 2}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-5">
              <div
                style={{ width: `${progressPct}%` }}
                className="bg-zinc-900 dark:bg-white h-full transition-all duration-300"
              ></div>
            </div>

            {/* Question Items List */}
            <div className="space-y-3">
              {dassItems.map((item, index) => {
                const currentVal =
                  answers[item.id] !== undefined ? answers[item.id] : 0;
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/60 hover:border-zinc-200 dark:hover:border-zinc-700/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="text-xs text-zinc-800 dark:text-zinc-200 flex-1">
                      <span className="font-mono text-zinc-400 mr-2 text-[11px]">
                        {String(index + 1).padStart(2, "0")}.
                      </span>
                      {item.text}
                    </div>

                    {/* Precision Segmented Control for 0-3 */}
                    <div className="inline-flex rounded-lg bg-zinc-100 dark:bg-zinc-800/70 p-0.5 border border-zinc-200 dark:border-zinc-700/60 self-start sm:self-auto">
                      {[0, 1, 2, 3].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() =>
                            handleAnswerChange(item.id, val, item.scale)
                          }
                          className={`w-7 h-6 rounded-md text-xs font-mono font-medium transition ${
                            currentVal === val
                              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs font-bold"
                              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Indikator Akademik & Tidur */}
          <div className="bg-white dark:bg-[#121316] rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-2xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
              3. Dampak Fisiologis & Akademik
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  <span>C4. Penurunan IPK Semester Ini</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    -{data.gpa_drop.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  value={data.gpa_drop}
                  onChange={(e) =>
                    setData("gpa_drop", parseFloat(e.target.value))
                  }
                  className="w-full accent-zinc-900 dark:accent-white"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-400 mt-1">
                  <span>0.00 (Stabil)</span>
                  <span>1.00 (Penurunan Signifikan)</span>
                  <span>2.00 (Ekstrem)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  C5. Kualitas Tidur & Disfungsi Harian
                </label>
                <select
                  value={data.sleep_disturbance}
                  onChange={(e) =>
                    setData("sleep_disturbance", parseInt(e.target.value) || 1)
                  }
                  className="w-full text-xs px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-hidden"
                >
                  <option value="1">
                    Skala 1 — Tidur Normal & Nyenyak (7-8 Jam)
                  </option>
                  <option value="2">
                    Skala 2 — Insomnia Ringan Saat Menjelang Ujian
                  </option>
                  <option value="3">
                    Skala 3 — Sering Terbangun & Mengantuk di Kelas
                  </option>
                  <option value="4">
                    Skala 4 — Insomnia Kronis, Sulit Berfungsi Harian
                  </option>
                  <option value="5">
                    Skala 5 — Disfungsi Parah, Tidak Tidur Berhari-hari
                  </option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Catatan / Penjelasan Keluhan Pribadi (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ceritakan kendala emosional atau tekanan akademik yang sedang dihadapi..."
                  value={data.notes}
                  onChange={(e) => setData("notes", e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Submit Bar */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-zinc-400">
              {answeredCount} dari {dassItems.length} butir telah terjawab
            </span>

            <button
              type="submit"
              disabled={processing}
              className="px-5 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 rounded-lg shadow-xs transition disabled:opacity-50"
            >
              {processing
                ? "Memproses Triase..."
                : "Simpan & Proses Triase SPK →"}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
