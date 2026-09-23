import React, { useState } from "react";
import { Link } from "react-router";
import AuthModal from "./AuthModal";

export default function Navbar(): React.JSX.Element {
  
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);

  return (
    <nav className="bg-white border-b border-gray-100 w-full font-sans sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16">
        {/* 1. SISI KIRI: Area Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/assets/images/logo.png"
              alt="LayananPro Logo"
              className="h-8 w-auto object-contain"
            />
            <span className="font-bold text-xl text-gray-900 tracking-tight">
              LayananPro
            </span>
          </Link>

          {/* 2. NAVIGATION LINKS */}
          <ul className="hidden md:flex items-center gap-6 font-semibold text-sm text-gray-600">
            <li>
              <Link
                to="/marketplace"
                className="hover:text-blue-600 transition"
              >
                Jelajahi
              </Link>
            </li>
            <li>
              <Link
                to="/register/merchant"
                className="hover:text-blue-600 transition"
              >
                Menjadi Vendor
              </Link>
            </li>
          </ul>
        </div>

        {/* 3. SISI KANAN: Tombol Masuk & Daftar */}
        <div className="flex items-center gap-3">
          {/* Tombol Masuk -> Langsung Navigasi ke Portal Login Universal */}
          <Link
            to="/login"
            className="bg-gray-100 text-gray-700 text-xs font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-200 transition border border-gray-200"
          >
            Masuk
          </Link>

          {/* Tombol Daftar -> Membuka AuthModal pilihan registrasi */}
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="text-xs font-semibold text-white bg-blue-600 rounded-xl px-5 py-2.5 hover:bg-blue-700 transition shadow-sm"
          >
            Daftar
          </button>
        </div>
      </div>

      {/* Render AuthModal khusus Pendaftaran */}
      <AuthModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </nav>
  );
}
