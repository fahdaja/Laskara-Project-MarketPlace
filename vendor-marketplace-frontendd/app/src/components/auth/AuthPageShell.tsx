import React from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

interface AuthPageShellProps {
  children: React.ReactNode;
}

export default function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6">
      {/* 1. Header Navbar Sederhana */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between py-2">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src="/assets/images/logo.png"
            alt="LayananPro Logo"
            className="h-8 w-auto object-contain"
          />
          <span className="font-bold text-xl text-slate-900 tracking-tight">
            LayananPro
          </span>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft size={16} />
          <span>Kembali</span>
        </Link>
      </header>

      {/* 2. Main Card Form (DI SINI PERBAIKANNYA) */}
      <main className="my-auto py-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Card Wrapper dengan background putih, shadow, & border */}
          <div className="bg-white py-8 px-6 sm:px-8 shadow-sm border border-slate-200/80 rounded-3xl">
            {children}
          </div>
        </div>
      </main>

      {/* 3. Footer Copyright */}
      <footer className="text-center text-xs text-slate-400 py-4">
        © {new Date().getFullYear()} LayananPro. All rights reserved.
      </footer>
    </div>
  );
}