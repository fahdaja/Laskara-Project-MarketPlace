import { Outlet } from "react-router";

import ClientNavbar from "~/src/components/client/ClientNavbar";

import { getCurrentClient } from "~/src/services/auth";

export default function ClientLayout() {
  const profile = getCurrentClient();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <ClientNavbar profile={profile} />

      <main className="min-h-[calc(100vh-64px)]">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-8 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between md:px-12">
          <span>© {new Date().getFullYear()} LayananPro Marketplace</span>

          <span>Temukan vendor dan layanan profesional terbaik.</span>
        </div>
      </footer>
    </div>
  );
}
