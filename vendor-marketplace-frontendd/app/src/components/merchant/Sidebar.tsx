import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router"; // 1. Tambahkan useNavigate
import { 
  LayoutGrid, 
  MessageSquare, 
  ShoppingBag, 
  Receipt, 
  Users, 
  Store,
  Home,
  LogOut
} from "lucide-react";
import LogoutModal from "../common/LogoutModal";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate(); // 2. Deklarasikan hook navigate

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  // Daftar Menu Sidebar dengan Path URL yang sudah disesuaikan
  const menuItems = [
    { name: "Ringkasan Toko", path: "/merchant/dashboard", icon: Home },
    { name: "Manajemen Layanan", path: "/merchant/gigs", icon: LayoutGrid }, // Sesuaikan ke /services
    { name: "Pesan & Penawaran", path: "/merchant/messages", icon: MessageSquare },
    { name: "Order", path: "/merchant/orders", icon: ShoppingBag },
    { name: "Transaksi", path: "/merchant/transactions", icon: Receipt },
    { name: "Associate Toko", path: "/merchant/associates", icon: Users },
    { name: "Toko Saya", path: "/merchant/profile", icon: Store }, // Sesuaikan ke /store
  ];

  const handleLogout = () => {
    // Hapus token/session
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    // Tutup modal & arahkan ke Login
    setIsLogoutModalOpen(false);
    navigate("/login");
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
      {/* Logo / Brand Header */}
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs">
            LT
          </div>
          Nama Toko
        </h2>
      </div>

      {/* List Navigation Menu */}
      <nav className="flex-1 p-4 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Cek apakah path saat ini sama dengan menu
            const isActive = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
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

      {/* Modal Konfirmasi Logout */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </aside>
  );
}