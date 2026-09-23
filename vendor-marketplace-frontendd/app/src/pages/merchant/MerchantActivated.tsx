import React from "react";
import { CheckCircle2, Store, ArrowRight, Sparkles, ShoppingBag, Wallet } from "lucide-react";

interface MerchantActivatedProps {
  onEnterDashboard?: () => void;
}

export default function MerchantActivated({ onEnterDashboard }: MerchantActivatedProps): React.JSX.Element {
  const handleClick = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("merchant_status", "ACTIVE");
    }
    if (onEnterDashboard) {
      onEnterDashboard();
    } else if (typeof window !== "undefined") {
      window.location.href = "/merchant/dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-lg overflow-hidden relative p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Dekorasi Cahaya Hijau Sukses */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Ikon Utama Sukses */}
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
          <Store size={38} />
          <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-xl shadow-md border border-slate-100 text-emerald-600">
            <CheckCircle2 size={16} />
          </div>
        </div>

        {/* Teks Konten Utama */}
        <div className="space-y-2.5">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Hore! Toko Kamu Resmi Aktif 🎉
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Selamat! Tim admin sudah memverifikasi data dan KTM kamu. Sekarang toko kamu sudah bisa mulai menerima pesanan, membuat penawaran jasa, dan menarik saldo penjualan.
          </p>
        </div>

        {/* Tombol Masuk Dashboard */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleClick}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-emerald-600/20 cursor-pointer group"
          >
            <span>Masuk ke Dashboard Toko</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
}