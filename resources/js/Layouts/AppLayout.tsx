import React, { ReactNode } from "react";
import { Link, usePage } from "@inertiajs/react";
import ThemeToggle from "../Components/ThemeToggle";

interface Props {
  title?: string;
  children: ReactNode;
}

export default function AppLayout({ title, children }: Props) {
  const { url } = usePage();
  const flash = (usePage().props as any).flash;

  const navItems = [
    { label: "Ringkasan Triase", href: "/", active: url === "/" },
    {
      label: "Matriks SPK (100 Mahasiswa)",
      href: "/spk",
      active: url.startsWith("/spk"),
    },
    {
      label: "Skrining DASS-21",
      href: "/skrining",
      active: url.startsWith("/skrining"),
    },
    {
      label: "Jadwal Konseling",
      href: "/konseling",
      active: url.startsWith("/konseling"),
    },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#0c0d0e] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-150">
      {/* Top Bar Navigation: 52px precision height */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0c0d0e]/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[52px] flex items-center justify-between">
          {/* Brand & Context */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-7 h-7 rounded-md bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-bold text-xs shadow-xs transition group-hover:scale-95">
                Ψ
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
                  SIM-KEMAS
                </span>
                <span className="hidden sm:inline-block text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-l border-zinc-200 dark:border-zinc-800 pl-2">
                  FT UTM
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md text-[13px] transition-colors ${
                    item.active
                      ? "font-semibold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800/80"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Actions & Utilities */}
          <div className="flex items-center space-x-2.5">
            <div className="hidden lg:flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/60 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>SAW & TOPSIS</span>
            </div>

            <ThemeToggle />

            <Link
              href="/skrining"
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition shadow-2xs"
            >
              + Skrining Baru
            </Link>
          </div>
        </div>
      </header>

      {/* Flash Message */}
      {flash?.success && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 w-full">
          <div className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs px-3.5 py-2.5 rounded-lg flex items-center justify-between shadow-xs">
            <span>{flash.success}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200/80 dark:border-zinc-800/80 py-5 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400 dark:text-zinc-500">
          <div>
            <strong className="text-zinc-600 dark:text-zinc-300 font-medium">
              SIM-KEMAS
            </strong>{" "}
            — Sistem Informasi Triase & SPK Kesehatan Mental Mahasiswa
          </div>
          <div>
            Sub-Project Sistem Informasi • FT Universitas Trunojoyo Madura
          </div>
        </div>
      </footer>
    </div>
  );
}
