import React from 'react';
import { Rocket, X, Sparkles } from 'lucide-react';

interface ComingSoonModalProps{
    isOpen: boolean;
    onClose: () => void
    featureName?: string;
}

export default function ComingSoonModal({ isOpen, onClose, featureName = "Fitur Ini" }: ComingSoonModalProps) {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      {/* Container Modal */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all border border-slate-100">
        
        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Konten Utama */}
        <div className="flex flex-col items-center text-center">
          
          {/* Badge & Icon */}
          <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Rocket className="h-8 w-8 animate-bounce" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-slate-900">
              <Sparkles className="h-2.5 w-2.5" />
            </span>
          </div>

          {/* Judul & Deskripsi */}
          <span className="mb-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            Dalam Pengembangan
          </span>
          
          <h3 className="mt-2 text-xl font-bold text-slate-800">
             Fitur {featureName} Segera Hadir!
          </h3>
          
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            Kami sedang menyiapkan fitur ini agar kamu bisa menikmati pengalaman yang lebih maksimal. Ditunggu ya!
          </p>

          {/* Tombol Aksi */}
          <div className="mt-6 w-full">
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all"
            >
              Mengerti
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}