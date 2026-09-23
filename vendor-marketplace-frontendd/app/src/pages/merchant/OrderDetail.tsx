import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  FileText,
  Upload,
  MessageSquare,
  User,
  Download,
  Paperclip,
  Phone,
  TrendingUp,
  Receipt,
  CreditCard,
  Check,
  X,
  AlertCircle,
  Send,
  Folder
} from "lucide-react";
import Breadcrumb from "../../components/common/BreadCrumb";
import type { OrderDetailType } from "~/src/types/Order";
import { initialOrderDetail } from "~/src/data/mockOrders";
import { formatRupiah } from "~/src/utils/formatRupiah";
import { getWhatsAppUrl } from "~/src/helper/whatsappHelpers";


export default function OrderDetail(): React.JSX.Element {
  const { id } = useParams();
  const orderDetail= initialOrderDetail.find((item) => item.id === id)
  const [order, setOrder] = useState<OrderDetailType>(orderDetail || initialOrderDetail[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [messageText, setMessageText] = useState("");
  const whatsappUrl = getWhatsAppUrl(order.clientPhone, order.clientName, order.id)

  const handleAcceptOrder = () => {
    setOrder((prev) => ({ ...prev, status: "IN_PROGRESS" }));
    alert("Pesanan berhasil diterima!");
  };

  const handleRejectOrder = () => {
    if (confirm("Apakah Anda yakin ingin menolak pesanan ini?")) {
      setOrder((prev) => ({ ...prev, status: "REJECTED" }));
      alert("Pesanan telah ditolak.");
    }
  };

  const handleDeliverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Silakan pilih file hasil pekerjaan terlebih dahulu.");
      return;
    }

    setOrder((prev) => ({
      ...prev,
      status: "IN_REVIEW",
      deliverables: [
        ...prev.deliverables,
        {
          version: `v${prev.deliverables.length + 1}`,
          fileName: selectedFile.name,
          uploadedAt: "Baru saja",
          note: messageText || "Berikut hasil pengerjaan terbaru untuk ditinjau.",
        },
      ],
    }));

    setSelectedFile(null);
    setMessageText("");
    alert("Hasil pekerjaan berhasil dikirim ke klien!");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header & Breadcrumb */}
      <div>
        <Breadcrumb />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-3">
            <Link
              to="/merchant/orders"
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-sm"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">Detail Pesanan</h1>
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                  {order.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Dipesan pada {order.orderDate}
              </p>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-2 transition shadow-sm"
          >
            <MessageSquare size={16} className="text-emerald-600" />
            <span>Chat WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Grid 2 Kolom */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI (2 SPAN) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* BANNER STATUS PENDING */}
          {order.status === "PENDING" && (
            <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-amber-950 text-sm">Pesanan Baru Menunggu Konfirmasi</h3>
                  <p className="text-xs text-amber-800/90 leading-relaxed mt-0.5">
                    Harap tinjau kebutuhan dan batasan waktu pekerjaan sebelum menerima pesanan ini.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={handleRejectOrder}
                  className="px-4 py-2.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
                >
                  <X size={15} />
                  <span>Tolak</span>
                </button>

                <button
                  onClick={handleAcceptOrder}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm shadow-emerald-600/20"
                >
                  <Check size={15} />
                  <span>Terima Pesanan</span>
                </button>
              </div>
            </div>
          )}

          {/* BANNER STATUS IN_PROGRESS */}
          {order.status === "IN_PROGRESS" && (
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 flex items-start gap-4">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shrink-0">
                <Clock size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-blue-900 text-sm">Pesanan Dalam Pengerjaan</h3>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Tenggat pengerjaan pesanan ini adalah <span className="font-bold">{order.deadline}</span>. Pastikan mengunggah hasil karya sebelum batas waktu berakhir.
                </p>
              </div>
            </div>
          )}

          {/* BANNER STATUS IN_REVIEW */}
          {order.status === "IN_REVIEW" && (
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-5 flex items-start gap-4">
              <div className="p-2.5 bg-indigo-600 text-white rounded-xl shrink-0">
                <FileText size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-indigo-900 text-sm">Menunggu Review Klien</h3>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  Hasil pekerjaan sudah dikirim. Klien sedang memeriksa dan meninjau hasil proyek ini.
                </p>
              </div>
            </div>
          )}

          {/* BANNER STATUS COMPLETED */}
          {order.status === "COMPLETED" && (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-emerald-950 text-sm">Pesanan Telah Selesai</h3>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Klien telah menyetujui hasil pekerjaan. Dana sebesar <span className="font-bold">{formatRupiah(order.totalNet)}</span> telah diteruskan ke saldo dompet toko kamu.
                </p>
              </div>
            </div>
          )}

          {/* BANNER STATUS REJECTED */}
          {order.status === "REJECTED" && (
            <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-5 flex items-start gap-4">
              <div className="p-2.5 bg-rose-600 text-white rounded-xl shrink-0">
                <AlertCircle size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-rose-950 text-sm">Pesanan Telah Ditolak</h3>
                <p className="text-xs text-rose-700 leading-relaxed">
                  Pesanan ini ditolak. Dana pembayaran sebesar <span className="font-bold">{formatRupiah(order.price)}</span> akan dikembalikan ke saldo klien.
                </p>
              </div>
            </div>
          )}

          {/* Section 1: Brief / Requirement Klien */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText size={16} className="text-blue-600" />
                <span>Instruksi & Requirement Klien</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Verifikasi System
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-[11px] text-slate-400 font-medium">Nama Brand / Produk:</span>
                <p className="font-bold text-slate-800">{order.requirements.brandName}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-[11px] text-slate-400 font-medium">Slogan / Tagline:</span>
                <p className="font-bold text-slate-800">{order.requirements.slogan}</p>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-[11px] text-slate-400 font-medium">Preferensi Warna & Konsep:</span>
              <p className="p-3 bg-slate-50 rounded-xl font-medium text-slate-700">
                {order.requirements.colorPreferences}
              </p>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-[11px] text-slate-400 font-medium">Catatan Tambahan:</span>
              <p className="p-3 bg-slate-50 rounded-xl font-medium text-slate-700 italic">
                "{order.requirements.notes}"
              </p>
            </div>

            {order.requirements.attachedFile && (
              <div className="pt-2">
                <span className="text-[11px] text-slate-400 font-medium block mb-1.5">
                  Lampiran Brief dari Klien:
                </span>
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Paperclip size={16} className="text-blue-600" />
                    <span className="text-xs font-semibold text-slate-800">
                      {order.requirements.attachedFile}
                    </span>
                  </div>
                  <Download size={16} className="text-slate-400 hover:text-slate-600" />
                </div>
              </div>
            )}
          </div>

          {/* ==============================================================
              CARD: FORM PENGIRIMAN HASIL PEKERJAAN (Clean & Streamlined)
              ============================================================== */}
          {order.status !== "COMPLETED" && order.status !== "REJECTED" && order.status !== "PENDING" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Upload size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Kirim Hasil Pekerjaan</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Unggah berkas final atau revisi untuk klien.</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  Siap Kirim
                </span>
              </div>

              <form onSubmit={handleDeliverSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <label className="flex-1 flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl hover:border-emerald-500 hover:bg-white transition cursor-pointer group">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                    />
                    <div className="flex items-center gap-3 min-w-0">
                      <Folder size={18} className="text-slate-400 group-hover:text-emerald-600 transition shrink-0" />
                      <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 truncate">
                        {selectedFile ? selectedFile.name : "Pilih File Pekerjaan (ZIP, PDF, MP4)"}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 shrink-0 ml-2 group-hover:underline">
                      {selectedFile ? "Ganti File" : "Browse"}
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-sm shadow-emerald-600/20 shrink-0"
                  >
                    <Send size={15} />
                    <span>Kirim</span>
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Tuliskan catatan pengerjaan atau instruksi untuk klien (opsional)..."
                  className="w-full p-3 rounded-xl border border-slate-200/80 text-xs bg-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition resize-none placeholder:text-slate-400"
                />
              </form>
            </div>
          )}

        </div>

        {/* KOLOM KANAN (1 SPAN) */}
        <div className="space-y-6">

          {/* Card Rincian Transaksi */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-6 shadow-sm relative overflow-hidden">
            
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500" />

            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Receipt size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Rincian Transaksi
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">Escrow Platform Verified</p>
                </div>
              </div>

              {order.status === "REJECTED" ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Dibatalkan
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Lunas
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Informasi Pembeli
                </span>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  Verified User
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                    {order.clientName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {order.clientName}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 truncate">
                      {order.clientEmail}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-1 border-t border-slate-200/60 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 text-slate-600 shadow-2xs">
                    <span className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                      <Phone size={13} className="text-emerald-500" /> No. WhatsApp
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-800">
                      {order.clientPhone}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Rincian Biaya
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2 rounded-xl hover:bg-slate-50 transition">
                  <span className="flex items-center gap-2 text-slate-600">
                    <CreditCard size={15} className="text-slate-400" />
                    <span>Harga Paket ({order.packageTier})</span>
                  </span>
                  <span className="font-bold text-slate-900">{formatRupiah(order.price)}</span>
                </div>

                <div className="flex justify-between items-center p-2 rounded-xl hover:bg-slate-50 transition">
                  <span className="flex items-center gap-2 text-slate-600">
                    <Receipt size={15} className="text-slate-400" />
                    <span>Biaya Layanan Platform</span>
                  </span>
                  <span className="font-bold text-rose-500">-{formatRupiah(order.adminFee)}</span>
                </div>
              </div>
            </div>

            {order.status === "REJECTED" ? (
              <div className="relative overflow-hidden rounded-2xl bg-slate-100 text-slate-800 p-5 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-slate-400" />
                    Pendapatan Bersih
                  </span>
                  <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-md border border-rose-200">
                    Batal
                  </span>
                </div>

                <div className="pt-1">
                  <span className="text-2xl font-black font-mono tracking-tight text-slate-400 line-through">
                    {formatRupiah(order.totalNet)}
                  </span>
                  <span className="text-xs font-bold text-rose-600 block mt-1">
                    Rp0 (Pesanan Ditolak)
                  </span>
                </div>

                <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-200">
                  *Dana sebesar {formatRupiah(order.price)} dikembalikan sepenuhnya ke saldo klien.
                </p>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-5 shadow-xl space-y-3">
                <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />
                <div className="absolute -left-8 -top-8 w-28 h-28 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-emerald-400" />
                    Pendapatan Bersih
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-emerald-500/30">
                    {order.status === "COMPLETED" ? "Sudah Dicairkan" : "Siap Cair"}
                  </span>
                </div>

                <div className="pt-1 relative z-10">
                  <span className="text-2xl font-black font-mono tracking-tight text-white block">
                    {formatRupiah(order.totalNet)}
                  </span>
                </div>

                <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-800 relative z-10">
                  {order.status === "COMPLETED"
                    ? "*Dana telah masuk ke saldo toko."
                    : "*Otomatis masuk ke saldo setelah pekerjaan disetujui klien."}
                </p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}