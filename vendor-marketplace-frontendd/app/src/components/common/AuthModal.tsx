import React from "react";
import { User, Briefcase, X, Store } from "lucide-react";
import { useNavigate } from "react-router";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleRegisterClient = () => {
    onClose();
    navigate("/register/client");
  };

  const handleRegisterMerchant = () => {
    onClose();
    navigate("/register/merchant");
  };

  const handleGoToLogin = () => {
    onClose();
    navigate("/login");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop / Latar Belakang Gelap */}
      <div
        className="fixed inset-0 bg-gray-950/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Kotak Modal Utama */}
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative z-10 border border-gray-100 transform transition-all duration-300 scale-100">
        {/* Tombol Close di Pojok Kanan Atas */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-50 rounded-full transition"
        >
          <X size={20} />
        </button>

        {/* Header Modal */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900">
            Daftar Akun Baru
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            Pilih jenis akun yang sesuai dengan kebutuhan Anda
          </p>
        </div>

        {/* Pilihan Jenis Registrasi */}
        <div className="flex flex-col gap-4">
          {/* Option: Client */}
          <button
            onClick={handleRegisterClient}
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
                Temukan vendor profesional untuk proyek dan bisnis Anda.
              </p>
            </div>
          </button>

          {/* Option: Merchant */}
          <button
            onClick={handleRegisterMerchant}
            className="group flex items-center gap-4 p-4 border border-gray-200 rounded-2xl text-left hover:border-purple-500 hover:bg-purple-50/30 transition duration-200"
          >
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition duration-200">
              <Store size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-950 text-base">
                Daftar sebagai Merchant
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Tawarkan jasa profesional dan kelola pesanan klien.
              </p>
            </div>
          </button>
        </div>

        {/* Footer Link ke Halaman Login Universal */}
        <div className="mt-6 text-center text-xs text-gray-400">
          Sudah memiliki akun?{" "}
          <button
            onClick={handleGoToLogin}
            className="text-blue-600 font-semibold hover:underline"
          >
            Masuk sekarang
          </button>
        </div>
      </div>
    </div>
  );
}