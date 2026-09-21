import React, { useState, useRef, useEffect } from "react";
import { Bell, User, ChevronDown, Store, LogOut, ExternalLink, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router";
import LogoutModal from "../common/LogoutModal";

interface HeaderProps {
  userName?: string;
  storeName?: string;
}

export default function Header({ 
  userName = "Samuel", 
  storeName = "Laskara Store" 
}: HeaderProps): React.JSX.Element {
  const navigate = useNavigate();
  
  // State Dropdown
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Ref untuk close dropdown saat klik di luar area
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setIsLogoutModalOpen(false);
    navigate("/login");
  };

  return (
    <header className="flex h-16 w-full items-center justify-end border-b border-slate-200 bg-white px-6 flex-shrink-0 relative z-30">
      <div className="flex items-center gap-4" ref={dropdownRef}>
        
        {/* 1. NOTIFIKASI DROPDOWN */}
        <div className="relative">
          <button
            type="button"
            aria-label="Notifikasi"
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
            className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 transition"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {/* Popover Notifikasi */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl py-2 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Notifikasi</span>
                <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-bold">
                  2 Baru
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                <div className="p-3 hover:bg-slate-50 transition cursor-pointer text-xs space-y-1">
                  <p className="font-semibold text-slate-800">Pesanan Baru #ORD-9482</p>
                  <p className="text-[11px] text-slate-500">Budi Santoso telah memesan Desain Logo Minimalis.</p>
                  <span className="text-[10px] text-slate-400">10 menit yang lalu</span>
                </div>
                <div className="p-3 hover:bg-slate-50 transition cursor-pointer text-xs space-y-1">
                  <p className="font-semibold text-slate-800">Pesan Baru dari Siti Rahma</p>
                  <p className="text-[11px] text-slate-500">Halo mas, mau tanya paket UI/UX...</p>
                  <span className="text-[10px] text-slate-400">1 jam yang lalu</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Separator Line */}
        <div className="h-5 w-[1px] bg-slate-200" />

        {/* 2. PROFILE MENU DROPDOWN */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
              <User size={18} />
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold text-slate-800 block leading-tight">{userName}</span>
              <span className="text-[10px] font-semibold text-slate-400 block">{storeName}</span>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {/* Menu Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-xl py-1.5 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{userName}</p>
                <p className="text-[11px] text-slate-400">Merchant Owner</p>
              </div>

              <div className="p-1">
                <Link
                  to="/merchant/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition"
                >
                  <Store size={15} className="text-slate-400" />
                  <span>Pengaturan Toko</span>
                </Link>
              </div>

              <div className="p-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsLogoutModalOpen(true);
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
                >
                  <LogOut size={15} />
                  <span>Keluar Akun</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Modal Logout */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </header>
  );
}