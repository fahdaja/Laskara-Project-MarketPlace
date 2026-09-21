import React, { useState } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  MessageSquare,
  User,
  Download,
  ExternalLink,
  ShieldAlert,
  Paperclip,
} from "lucide-react";
import Breadcrumb from "../../components/common/BreadCrumb";

export default function OrderDetail(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();

  // Mock Detail Data Order
  const [order, setOrder] = useState({
    id: id || "ORD-9482",
    clientName: "Budi Santoso",
    clientEmail: "budi.santoso@example.com",
    serviceTitle: "Desain Logo Minimalis & Brand Guidelines",
    packageTier: "Standard",
    price: 150000,
    adminFee: 5000,
    totalNet: 145000,
    orderDate: "20 Sep 2026, 14:30 WIB",
    deadline: "22 Sep 2026, 23:59 WIB",
    status: "IN_PROGRESS" as "PENDING" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED",
    requirements: {
      brandName: "Laskara Tech",
      slogan: "Innovating Digital Future",
      colorPreferences: "Dominan Biru Gelap (#0F172A) dan aksen Emas (#F59E0B)",
      notes: "Mohon sediakan opsi file format SVG dan PNG tanpa background (transparan).",
      attachedFile: "brief_laskara_v1.pdf",
    },
    timeline: [
      { status: "Pesanan Dibuat & Dibayar", time: "20 Sep 2026, 14:30 WIB", completed: true },
      { status: "Pesanan Diterima Merchant", time: "20 Sep 2026, 15:10 WIB", completed: true },
      { status: "Pengerjaan Proyek", time: "Sedang Berlangsung", completed: true, current: true },
      { status: "Pengiriman Hasil Pekerjaan", time: "-", completed: false },
      { status: "Persetujuan Klien & Dana Cair", time: "-", completed: false },
    ],
    deliverables: [
      {
        version: "v1",
        fileName: "laskara_logo_concept_draft.zip",
        uploadedAt: "21 Sep 2026, 10:00 WIB",
        note: "Draft konsep awal logo + alternatif warna.",
      },
    ],
  });

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
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

          <div className="flex items-center gap-2">
            <Link
              to="/merchant/messages"
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition shadow-sm"
            >
              <MessageSquare size={16} />
              <span>Chat Klien</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid 2 Kolom: Kiri (Main Info) & Kanan (Summary & Timeline) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI (2 SPAN) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Status Banner */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 flex items-start gap-4">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl">
              <Clock size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-blue-900 text-sm">Pesanan Dalam Pengerjaan</h3>
              <p className="text-xs text-blue-700 leading-relaxed">
                Tenggat pengerjaan pesanan ini adalah <span className="font-bold">{order.deadline}</span>. Pastikan mengunggah hasil karya sebelum batas waktu berakhir.
              </p>
            </div>
          </div>

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

            {/* Lampiran File Requirement */}
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

          {/* Section 2: Deliverables (Riwayat File Pengiriman Pekerjaan) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Upload size={16} className="text-emerald-600" />
                <span>Pengiriman Hasil Pekerjaan (Deliverables)</span>
              </h3>
            </div>

            {order.deliverables.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
                <p className="text-xs text-slate-500 font-medium">Belum ada hasil pekerjaan yang dikirimkan.</p>
                <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition">
                  Unggah Hasil Pekerjaan Pertama
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {order.deliverables.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                        Hasil {item.version}
                      </span>
                      <span className="text-[10px] text-slate-400">{item.uploadedAt}</span>
                    </div>

                    <p className="text-slate-600 font-medium">{item.note}</p>

                    <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="font-mono text-slate-700 font-semibold">{item.fileName}</span>
                      <button className="text-blue-600 hover:underline flex items-center gap-1 font-semibold text-[11px]">
                        <Download size={14} />
                        <span>Unduh File</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* KOLOM KANAN (1 SPAN) */}
        <div className="space-y-6">

          {/* Card Info Klien & Rincian Pembayaran */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              Rincian Transaksi
            </h3>

            {/* Info Klien */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                <User size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{order.clientName}</p>
                <p className="text-[10px] text-slate-400 truncate">{order.clientEmail}</p>
              </div>
            </div>

            {/* Breakdown Biaya */}
            <div className="space-y-2 text-xs pt-1">
              <div className="flex justify-between text-slate-600">
                <span>Harga Paket ({order.packageTier})</span>
                <span className="font-semibold">{formatRupiah(order.price)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Biaya Layanan Platform</span>
                <span className="font-semibold text-rose-500">-{formatRupiah(order.adminFee)}</span>
              </div>
              <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-slate-900 text-sm">
                <span>Pendapatan Bersih</span>
                <span className="text-emerald-600">{formatRupiah(order.totalNet)}</span>
              </div>
            </div>
          </div>

          {/* Card Timeline Status Proyek */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              Progres Timeline Status
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
              {order.timeline.map((step, idx) => (
                <div key={idx} className="relative">
                  <div
                    className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                      step.completed
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300"
                    }`}
                  >
                    {step.completed && <CheckCircle2 size={10} />}
                  </div>

                  <div>
                    <p className={`text-xs font-bold ${step.current ? "text-blue-600" : "text-slate-800"}`}>
                      {step.status}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Help / Dispute Card */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <ShieldAlert size={16} />
              <span>Ada Kendala Pesanan?</span>
            </div>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Jika klien tidak memberikan balasan atau ada ketidaksesuaian instruksi, kamu dapat mengajukan eskalasi ke Tim Support.
            </p>
            <button className="text-xs font-bold text-amber-800 hover:underline block pt-1">
              Ajukan Bantuan / Dispute &gt;
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}