import React, { useState, useEffect } from "react";
import { User, Briefcase, X, ArrowLeft } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register"; // Mengizinkan pemicu awal menentukan mode
  // initialRole
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
}: AuthModalProps) {
  // State untuk mengontrol apakah menampilkan opsi 'login' atau 'register'
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  // Jika modal ditutup, reset mode kembali ke default saat dibuka nanti
  const handleClose = () => {
    onClose();
    setMode(initialMode);
  };

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop / Latar Belakang Gelap */}
      <div
        className="fixed inset-0 bg-gray-950/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Kotak Modal Utama */}
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative z-10 border border-gray-100 transform transition-all duration-300 scale-100">
        {/* Tombol Back (Hanya muncul jika mode berubah dari pilihan awal) */}
        {mode !== initialMode && (
          <button
            onClick={() => setMode(initialMode)}
            className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-50 rounded-full transition"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        {/* Tombol Close di Pojok Kanan Atas */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-50 rounded-full transition"
        >
          <X size={20} />
        </button>

        {/* =========================================================================
            KONTEN MODE: MASUK (LOGIN)
            ========================================================================= */}
        {mode === "login" && (
          <>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900">
                Masuk Aplikasi
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Pilih jenis akun Anda untuk melanjutkan proses login
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  console.log("Login Client");
                  handleClose();
                }}
                className="group flex items-center gap-4 p-4 border border-gray-200 rounded-2xl text-left hover:border-blue-500 hover:bg-blue-50/30 transition duration-200"
              >
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition duration-200">
                  <User size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-950 text-base">
                    Masuk sebagai Client
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Mencari vendor atau mengelola kebutuhan proyek.
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  console.log("Login Merchant");
                  handleClose();
                }}
                className="group flex items-center gap-4 p-4 border border-gray-200 rounded-2xl text-left hover:border-purple-500 hover:bg-purple-50/30 transition duration-200"
              >
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition duration-200">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-950 text-base">
                    Masuk sebagai Merchant
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Menyediakan jasa profesional dan menawarkan keahlian.
                  </p>
                </div>
              </button>
            </div>

            <div className="mt-6 text-center text-xs text-gray-400">
              Belum punya akun?{" "}
              <button
                onClick={() => setMode("register")}
                className="text-blue-600 font-semibold hover:underline"
              >
                Daftar sekarang
              </button>
            </div>
          </>
        )}

        {/* =========================================================================
            KONTEN MODE: DAFTAR (REGISTER)
            ========================================================================= */}
        {mode === "register" && (
          <>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900">
                Daftar Akun Baru
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Bergabunglah bersama kami dan temukan kemudahan layanan
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  console.log("Register Client");
                  handleClose();
                }}
                className="group flex items-center gap-4 p-4 border border-gray-200 rounded-2xl text-left hover:border-blue-500 hover:bg-blue-50/30 transition duration-200"
              >
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition duration-200">
                  <User size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-950 text-base">
                    Daftar sebagai Client
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Temukan solusi praktis untuk bisnis dan proyek Anda.
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  console.log("Register Merchant");
                  handleClose();
                }}
                className="group flex items-center gap-4 p-4 border border-gray-200 rounded-2xl text-left hover:border-purple-500 hover:bg-purple-50/30 transition duration-200"
              >
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition duration-200">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-950 text-base">
                    Daftar sebagai Merchant
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Dapatkan klien lebih mudah dan kembangkan bisnis Anda.
                  </p>
                </div>
              </button>
            </div>

            <div className="mt-6 text-center text-xs text-gray-400">
              Sudah memiliki akun?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-blue-600 font-semibold hover:underline"
              >
                Masuk sekarang
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
