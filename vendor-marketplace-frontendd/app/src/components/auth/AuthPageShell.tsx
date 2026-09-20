import type { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

import logo from "~/src/assets/images/logo.png";

interface AuthPageShellProps {
  children: ReactNode;
}

export default function AuthPageShell({
  children,
}: AuthPageShellProps) {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-6 sm:px-10 lg:px-14">
          <Link
            to="/"
            className="flex items-center gap-3"
            aria-label="Kembali ke LayananPro"
          >
            <img
              src={logo}
              alt=""
              className="h-9 w-auto object-contain"
            />

            <span className="text-xl font-bold tracking-tight text-slate-900">
              LayananPro
            </span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">
              Kembali
            </span>
          </Link>
        </header>

        {/* Content */}
        <section className="flex flex-1 items-start justify-center px-6 pt-12 sm:px-10">
          <div className="w-full max-w-[430px]">
            {children}
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 pb-7 text-center text-xs text-slate-400 sm:px-10">
          © {new Date().getFullYear()} LayananPro
        </footer>
      </div>
    </main>
  );
}