import { useState } from "react";

import {
  Compass,
  LogOut,
  Menu,
  MessageSquare,
  ReceiptText,
  UserRound,
  X,
} from "lucide-react";

import { Link, NavLink } from "react-router";

import type { AuthUser } from "~/src/types/auth";

interface ClientNavbarProps {
  profile: AuthUser;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ClientNavbar({ profile }: ClientNavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = getInitials(profile.fullName);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-12">
        {/* Brand */}
        <div className="flex items-center gap-9">
          <Link to="/marketplace" className="flex items-center gap-2.5">
            <img
              src="/assets/images/logo.png"
              alt="LayananPro"
              className="h-8 w-auto object-contain"
            />

            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-950">
                LayananPro
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            <NavLink
              to="/marketplace"
              className={({ isActive }) =>
                [
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                ].join(" ")
              }
            >
              <Compass size={17} />
              Jelajahi
            </NavLink>

            <NavLink
              to="/pesanan"
              className={({ isActive }) =>
                [
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                ].join(" ")
              }
            >
              <ReceiptText size={17} />
              Pesanan Saya
            </NavLink>

            <button
              type="button"
              disabled
              title="Akan dilanjutkan pada pengembangan fitur client berikutnya"
              className="flex cursor-not-allowed items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-400"
            >
              <MessageSquare size={17} />
              Chat
            </button>
          </nav>
        </div>

        {/* Desktop Profile */}
        <div className="relative hidden md:block">
          <button
            type="button"
            onClick={() => setProfileOpen((value) => !value)}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-2 py-1.5 transition hover:bg-slate-50"
          >
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-600 text-xs font-bold text-white">
              <span>{initials || "CL"}</span>

              {profile.avatarUrl && (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>

            <div className="hidden max-w-[150px] text-left xl:block">
              <p className="truncate text-xs font-bold text-slate-800">
                {profile.fullName}
              </p>

              <p className="truncate text-[10px] text-slate-400">
                {profile.email}
              </p>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-[calc(100%+10px)] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-950/10">
              <div className="px-3 py-3">
                <p className="text-sm font-bold text-slate-900">
                  {profile.fullName}
                </p>

                <p className="mt-0.5 truncate text-xs text-slate-400">
                  {profile.email}
                </p>
              </div>

              <div className="my-1 h-px bg-slate-100" />

              <button
                type="button"
                disabled
                className="flex w-full cursor-not-allowed items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-400"
              >
                <UserRound size={16} />
                Profil Saya
              </button>

              <Link
                to="/login"
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                <LogOut size={16} />
                Keluar
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 md:hidden"
          aria-label="Buka menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-6 py-4 md:hidden">
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-blue-600 text-xs font-bold text-white">
              {initials || "CL"}

              {profile.avatarUrl && (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">
                {profile.fullName}
              </p>

              <p className="truncate text-xs text-slate-400">{profile.email}</p>
            </div>
          </div>

          <NavLink
            to="/marketplace"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700"
          >
            <Compass size={18} />
            Jelajahi
          </NavLink>

          <NavLink
            to="/pesanan"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              [
                "mt-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50",
              ].join(" ")
            }
          >
            <ReceiptText size={18} />
            Pesanan Saya
          </NavLink>

          <Link
            to="/login"
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50"
          >
            <LogOut size={18} />
            Keluar
          </Link>
        </div>
      )}
    </header>
  );
}
