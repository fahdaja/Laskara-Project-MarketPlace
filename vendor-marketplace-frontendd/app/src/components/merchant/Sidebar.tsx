import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { 
  LayoutGrid, 
  MessageSquare, 
  ShoppingBag, 
  Receipt, 
  Users, 
  Store,
  Home,
  LogOut,
  Repeat
} from "lucide-react";
import LogoutModal from "../common/LogoutModal";
import ComingSoonModal from "../common/ComingSoonModal";


export default function Sidebar() {
  
  const location = useLocation();
  const navigate = useNavigate();
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  const [activeFeatureName, setActiveFeatureName] = useState<string>('');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // State lokal untuk testing switch role langsung di sidebar (jika belum di-handle dari parent)
  const [currentRole, setCurrentRole] = useState<"OWNER" | "ASSOCIATES">();

  const handleDisableNavClick = (e: React.MouseEvent, featureName: string) => {
    e.preventDefault();
    setActiveFeatureName(featureName);
    setIsComingSoonModalOpen(true);
  };
  
  // Daftar Menu Sidebar
  const menuItems = [
    { name: "Ringkasan Toko", path: "/merchant/dashboard", icon: Home },
    { name: "Manajemen Layanan", path: "/merchant/gigs", icon: LayoutGrid },
    { name: "Pesan & Penawaran", path: "/merchant/messages", icon: MessageSquare, isComingSoonModalOpen: true },
    { name: "Order", path: "/merchant/orders", icon: ShoppingBag },
    { name: "Transaksi", path: "/merchant/transactions", icon: Receipt, ownerOnly: true },
    { name: "Associate Toko", path: "/merchant/associates", icon: Users, ownerOnly: true },
    { name: "Toko Saya", path: "/merchant/profile", icon: Store, ownerOnly: true },
  ];

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setIsLogoutModalOpen(false);
    navigate("/login");
  };


  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
      {/* Logo / Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs">
            LT
          </div>
          Nama Toko
        </h2>
      </div>

      {/* 🛠️ TOMBOL SIMULASI SWITCH ROLE UNTUK TESTING */}
      <div className="px-4 pt-3 pb-1">
        <button
          className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold transition flex items-center justify-between border border-slate-200"
          title="Klik untuk simulasi ganti hak akses"
        >
          <span className="flex items-center gap-1.5">
            <Repeat size={13} className="text-blue-600" />
            Role: <span className="text-blue-600 uppercase">{currentRole}</span>
          </span>
          <span className="text-[10px] text-slate-400 font-normal underline">Ganti</span>
        </button>
      </div>

      {/* List Navigation Menu */}
      <nav className="flex-1 p-4 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            // Sembunyikan menu khusus owner jika role aktif adalah ASSOCIATES
            if (item.ownerOnly && currentRole === "ASSOCIATES") {
              return null;
            }
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => {
                  if (item.isComingSoonModalOpen){
                    handleDisableNavClick(e, item.name);
                  }
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={18} className={isActive ? "text-blue-600" : "text-slate-400"} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Tombol Logout di bagian paling bawah Sidebar */}
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-3 w-full px-4 py-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
          >
            <LogOut size={18} />
            <span>Keluar Akun</span>
          </button>
        </div>
      </nav>

      <ComingSoonModal
        isOpen={isComingSoonModalOpen}
        onClose={() => setIsComingSoonModalOpen(false)}
        featureName={activeFeatureName}
      />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </aside>
  );
}