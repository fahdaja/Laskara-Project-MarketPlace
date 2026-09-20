import React, { useState } from "react";
import { Link } from "react-router";
import logo from "../../assets/images/logo.png";
import AuthModal from "./AuthModal";

export default function Navbar(): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  // State untuk menyimpan mode awal saat modal terbuka ('login' atau 'register')
  const [modalMode, setModalMode] = useState<"login" | "register">("login");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Fungsi untuk membuka modal sesuai tombol yang diklik
  const openAuthModal = (mode: "login" | "register") => {
    setModalMode(mode);
    setIsModalOpen(true);
  };

  return (
    <nav className="bg-white border-b border-gray-100 w-full font-sans">
      <div className="max-w-7xl mx-auto py-12 px-6 md:px-12 flex items-center justify-between h-16 ">
        {/* 1. SISI KIRI: Area Logo */}
        <div className="flex items-center space-x-4 ">
          <img
            src={logo}
            alt="layanan pro img"
            className="h-8 w-auto object-contain"
          />
          <span className="font-bold text-xl text-gray-900 ">LayananPro</span>
        </div>

        <ul className="flex items-center gap-8 font-semibold text-gray-500 max-auto mr-auto ml-8 ">
          <Link to="/" className="nav-link">
            <li className="hover:text-blue-700">Jelajahi</li>
          </Link>
          <Link to="/" className="nav-link">
            <li className="hover:text-blue-700">Menjadi Vendor</li>
          </Link>
        </ul>

        {/* 3. SISI KANAN: Tombol Masuk & Daftar */}
        <div className="flex items-center gap-4 ">
          {/* Tombol Masuk -> Membuka modal langsung ke opsi Login */}
          <button
            onClick={() => openAuthModal("login")}
            className="bg-gray-100 text-gray text-sm font-medium px-6 py-3 rounded-2xl hover:bg-gray-200 transition shadow-md border border-gray-200 flex items-center gap-2"
          >
            Masuk
          </button>

          {/* Tombol Daftar -> Membuka modal langsung ke opsi Register */}
          <button
            onClick={() => openAuthModal("register")}
            className="text-center font-medium text-white bg-blue-600 rounded-2xl px-6 py-3 hover:bg-blue-700 transition"
          >
            Daftar
          </button>
        </div>
      </div>

      {/* Render AuthModal di luar flex container agar posisinya stabil */}
      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialMode={modalMode}
      />
    </nav>
  );
}
