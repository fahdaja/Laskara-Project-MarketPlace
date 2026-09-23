import React from "react";
import { XCircle, RotateCcw, ShieldAlert } from "lucide-react";

export default function MerchantRejected(): React.JSX.Element {
  
  // Fungsi buat reset status jadi onboarding lagi biar bisa revisi/isi ulang
  const handleReapply = () => {
    localStorage.setItem("merchant_status", "ONBOARDING");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-md overflow-hidden relative p-8 text-center space-y-6">
        
        {/* Dekorasi Cahaya Merah Tipis */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Ikon Utama Gagal/Ditolak */}
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-red-500/30">
          <XCircle size={38} />
        </div>

        {/* Teks Konten Utama */}
        <div className="space-y-2.5">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Pendaftaran Belum Disetujui
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Mohon maaf, tim admin mendapati ketidaksesuaian pada data atau foto KTM yang kamu unggah. Silakan periksa kembali dan lakukan pengisian ulang data toko.
          </p>
        </div>

        {/* Kotak Alasan (Opsional kalau dari backend ada pesan error-nya) */}
        <div className="bg-red-50/60 rounded-2xl p-4 border border-red-100 text-left space-y-1">
          <p className="text-[11px] font-bold text-red-900 flex items-center gap-1.5">
            <ShieldAlert size={14} /> Catatan Validator:
          </p>
          <p className="text-[11px] text-red-700 leading-normal">
            "Foto Kartu Tanda Mahasiswa (KTM) buram / tidak terbaca dengan jelas. Harap unggah foto yang lebih terang."
          </p>
        </div>

        {/* Tombol Aksi Revisi */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleReapply}
            className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-red-600/20 cursor-pointer group"
          >
            <RotateCcw size={14} className="group-hover:-rotate-45 transition-transform duration-300" />
            <span>Perbaiki & Isi Ulang Data</span>
          </button>
        </div>

      </div>
    </div>
  );
}