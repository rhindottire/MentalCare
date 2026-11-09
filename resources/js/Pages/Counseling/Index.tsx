import React from "react";
import AppLayout from "../../Layouts/AppLayout";
import { Head, Link } from "@inertiajs/react";

interface CounselingSessionItem {
  id: number;
  nim: string;
  name: string;
  prodi: string;
  urgency: string;
  counselor?: string;
  scheduled_at?: string;
  status: string;
  notes?: string;
}

interface CounselorItem {
  id: number;
  name: string;
  specialization: string;
  phone: string;
}

interface Props {
  sessions: CounselingSessionItem[];
  counselors: CounselorItem[];
}

export default function CounselingIndex({ sessions, counselors }: Props) {
  return (
    <AppLayout title="Jadwal Konseling">
      <Head title="Manajemen Jadwal Konseling - SIM-KEMAS" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
            Layanan & Penjadwalan Konseling Klinis
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Monitoring intervensi tatap muka bagi mahasiswa hasil rujukan SPK.
          </p>
        </div>

        <Link
          href="/spk"
          className="inline-flex items-center text-xs font-semibold text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 px-3 py-1.5 rounded-lg shadow-2xs transition"
        >
          + Rujuk dari Triase SPK
        </Link>
      </div>

      {/* Counselors on Duty */}
      <div className="mb-6">
        <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2.5">
          Psikolog & Konselor Kampus Aktif
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {counselors.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-[#121316] rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-3.5 shadow-2xs flex items-center space-x-3"
            >
              <div className="w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-700 dark:text-zinc-200">
                {c.name.charAt(3) || "P"}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                  {c.name}
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                  {c.specialization}
                </p>
                <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
                  WA: {c.phone}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white dark:bg-[#121316] rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-900 dark:text-white">
            Daftar Sesi Konseling Terjadwal
          </span>
          <span className="text-[11px] font-mono text-zinc-400">
            {sessions.length} Sesi Aktif
          </span>
        </div>

        {sessions.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 dark:text-zinc-500">
            <div className="w-8 h-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-600">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Belum ada sesi konseling yang dijadwalkan.
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Buka menu{" "}
              <Link
                href="/spk"
                className="text-indigo-600 dark:text-indigo-400 underline"
              >
                Matriks SPK
              </Link>{" "}
              dan klik tombol "Jadwalkan" pada mahasiswa prioritas kritis.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/60 dark:bg-zinc-800/40 text-[11px] font-mono uppercase text-zinc-400 dark:text-zinc-500 border-b border-zinc-200/80 dark:border-zinc-800/80">
                <tr>
                  <th className="px-3.5 py-2.5">Mahasiswa</th>
                  <th className="px-3.5 py-2.5">Urgensi</th>
                  <th className="px-3.5 py-2.5">Konselor</th>
                  <th className="px-3.5 py-2.5">Waktu Pertemuan</th>
                  <th className="px-3.5 py-2.5">Catatan Klinis</th>
                  <th className="px-3.5 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {sessions.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30"
                  >
                    <td className="px-3.5 py-3">
                      <div className="font-semibold text-zinc-900 dark:text-white">
                        {s.name}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400">
                        {s.nim} • {s.prodi}
                      </div>
                    </td>
                    <td className="px-3.5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
                        {s.urgency}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-zinc-700 dark:text-zinc-300 font-medium">
                      {s.counselor || "-"}
                    </td>
                    <td className="px-3.5 py-3 font-mono text-zinc-600 dark:text-zinc-400 text-[11px]">
                      {s.scheduled_at || "-"}
                    </td>
                    <td className="px-3.5 py-3 text-zinc-500 dark:text-zinc-400 max-w-xs truncate text-[11px]">
                      {s.notes || "-"}
                    </td>
                    <td className="px-3.5 py-3 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
