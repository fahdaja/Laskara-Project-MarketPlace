import React, { useState } from "react";
import { AlertTriangle, CheckCircle, X } from "lucide-react";
import { useNavigate } from "react-router";

interface ConfirmationRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function ConfirmationRegisterModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: ConfirmationRegisterModalProps): React.JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 transition-all duration-300">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden relative space-y-6 p-6 transform scale-100 transition-all duration-300 animate-in fade-in zoom-in-95">
        
        {/* Tombol Close */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Icon Peringatan / Konfirmasi */}
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner border border-amber-100 mt-2">
          <AlertTriangle size={28} />
        </div>

        {/* Teks Konten */}
        <div className="text-center space-y-2">
          <h3 className="text-base font-bold text-slate-900">
            Kirim data pendaftaran sekarang?
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed px-4">
            Pastikan nomor rekening dan PIN yang lo masukin udah benar ya. Setelah dikirim, data bakal langsung ditinjau oleh admin.
          </p>
        </div>

        {/* Tombol Aksi */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs transition cursor-pointer"
          >
            Cek Lagi
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Mengirim...</span>
            ) : (
              <>
                <CheckCircle size={15} />
                <span>Ya, Kirim Data</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}