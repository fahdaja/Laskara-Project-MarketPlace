import React from "react";
import { Clock, ShieldCheck, RefreshCcw, ArrowLeft, Sparkles } from "lucide-react";

export default function MerchantPending(): React.JSX.Element {
  
  const handleCheckStatus = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("merchant_status", "APPROVE");
      window.location.href = "/merchant/approve";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-md overflow-hidden relative p-8 text-center space-y-6">
        
        {/* Dekorasi Cahaya Biru Tipis di Belakang Icon */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Ikon Utama dengan Nuansa Biru */}
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30 transform hover:scale-105 transition-transform duration-300">
          <Clock size={36} className="animate-spin-slow" />
          <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-xl shadow-md border border-slate-100 text-blue-600">
            <Sparkles size={14} />
          </div>
        </div>

        {/* Teks Konten Utama */}
        <div className="space-y-2.5">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Akun Kamu Sedang Ditinjau
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Data pendaftaran dan foto KTM lo udah berhasil dikirim ke tim admin kampus. Mohon tunggu sebentar ya, proses verifikasi biasanya memakan waktu maksimal <span className="font-semibold text-slate-700">1x24 jam</span>.
          </p>
        </div>

        {/* Tombol Aksi */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={handleCheckStatus}
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-blue-600/20 cursor-pointer group"
          >
            <RefreshCcw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
            <span>Cek Status Verifikasi</span>
          </button>
          
          <a
            href="/"
            className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 font-semibold text-xs transition"
          >
            <ArrowLeft size={13} />
            <span>Kembali ke Beranda Utama</span>
          </a>
        </div>

      </div>
    </div>
  );
}