import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Edit3,
  Save,
  Rocket,
  MessageSquareWarning,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  Upload,
  Eye,
  ShoppingBag,
  TrendingUp,
  Trash2,
  Power,
  AlertTriangle,
} from "lucide-react";
import Breadcrumb from "../../components/common/BreadCrumb";

interface PricingTier {
  name: string;
  price: number;
  description: string;
  deliveryDays: number;
}

export default function GigsDetail(): React.JSX.Element {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // State Modal Konfirmasi Hapus & Toggle Nonaktif
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Mock Data Layanan
  const [service, setService] = useState({
    id: id || "2",
    title: "Desain Logo Minimalis & Brand Guidelines",
    description:
      "Kami menyediakan pembuatan logo profesional lengkap dengan konsep modern, palet warna brand, typography, serta siap pakai untuk kebutuhan cetak dan digital.",
    category: "Desain & Grafis",
    status: "MENUNGGU" as "AKTIF" | "MENUNGGU" | "DITOLAK" | "DRAF",
    rejectionReason:
      "Harga paket basic terlalu rendah untuk standar kualitas platform. Silakan sesuaikan menjadi minimal Rp 50.000.",
    image: "/assets/images/hero-creative-studio.png",
    stats: {
      views: 1240,
      ordersCompleted: 18,
      totalRevenue: 2700000,
    },
    tiers: {
      basic: {
        name: "Basic",
        price: 50000,
        description: "1 Konsep Logo Utama + File PNG & JPG High Res",
        deliveryDays: 2,
      },
      standard: {
        name: "Standard",
        price: 150000,
        description: "2 Konsep Logo + File Vector Master (AI/EPS) + Color Palette",
        deliveryDays: 3,
      },
      premium: {
        name: "Premium",
        price: 350000,
        description: "3 Konsep Logo + Vector Master + Full Brand Guidelines PDF",
        deliveryDays: 5,
      },
    },
  });

  const handleChange = (field: string, value: string | number) => {
    setService((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTierChange = (
    tierKey: "basic" | "standard" | "premium",
    field: keyof PricingTier,
    value: string | number
  ) => {
    setService((prev) => ({
      ...prev,
      tiers: {
        ...prev.tiers,
        [tierKey]: {
          ...prev.tiers[tierKey],
          [field]: value,
        },
      },
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsEditing(false);
      if (service.status === "DITOLAK") {
        setService((prev) => ({ ...prev, status: "MENUNGGU" }));
      }
      alert("Perubahan layanan berhasil disimpan!");
    }, 1000);
  };

  // Handler Hapus Gig dari Halaman Detail
  const handleDeleteGig = () => {
    setIsDeleting(true);

    setTimeout(() => {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      // Pindah kembali ke halaman manajemen gigs setelah hapus
      navigate("/merchant/gigs");
    }, 800);
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6 pb-12">
      <Breadcrumb />

      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/merchant/gigs")}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition shadow-xs"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Detail Layanan #{service.id}
            </h1>
            <p className="text-xs text-slate-500">
              Kelola rincian harga, deskripsi paket, dan status tinjauan layanan.
            </p>
          </div>
        </div>

        {/* Action Toggle Edit / Save */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-semibold shadow-sm transition flex items-center gap-2"
            >
              <Save size={16} />
              <span>{isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-2"
            >
              <Edit3 size={16} />
              <span>Edit Layanan</span>
            </button>
          )}
        </div>
      </div>

      {/* Banner Catatan Penolakan (Jika Status DITOLAK) */}
      {service.status === "DITOLAK" && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
          <MessageSquareWarning size={20} className="text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
              Layanan Perlu Perbaikan
            </h4>
            <p className="text-xs text-rose-700 leading-relaxed">
              "{service.rejectionReason}"
            </p>
            <p className="text-[11px] text-rose-500 font-medium pt-1">
              *Tekan tombol <strong>Edit Layanan</strong> di atas untuk menyesuaikan dan mengajukan peninjauan ulang.
            </p>
          </div>
        </div>
      )}

      {/* Content Form Detail / Edit */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI (2 SPAN): Informasi Utama & Paket Harga */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card Info Umum */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Informasi Umum
            </h3>

            {/* Judul Layanan */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Judul Layanan
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={service.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-blue-500 transition"
                  required
                />
              ) : (
                <p className="text-sm font-bold text-slate-900">{service.title}</p>
              )}
            </div>

            {/* Deskripsi Layanan */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Deskripsi Lengkap
              </label>
              {isEditing ? (
                <textarea
                  rows={4}
                  value={service.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="w-full p-4 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-500 transition"
                  required
                />
              ) : (
                <p className="text-xs text-slate-600 leading-relaxed">
                  {service.description}
                </p>
              )}
            </div>
          </div>

          {/* Card Paket 3-Tier Pricing */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Paket & Harga Layanan</span>
              <Package size={18} className="text-slate-400" />
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["basic", "standard", "premium"] as const).map((tierKey) => {
                const tier = service.tiers[tierKey];
                return (
                  <div
                    key={tierKey}
                    className="bg-slate-50/70 border border-slate-200 p-4 rounded-xl space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                          Paket {tier.name}
                        </span>
                      </div>

                      {/* Input Price Tier */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase block">
                          Harga (IDR)
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={tier.price}
                            onChange={(e) =>
                              handleTierChange(tierKey, "price", Number(e.target.value))
                            }
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white outline-none focus:border-blue-500"
                          />
                        ) : (
                          <p className="text-sm font-bold text-slate-900">
                            {formatRupiah(tier.price)}
                          </p>
                        )}
                      </div>

                      {/* Input Deskripsi Tier */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase block">
                          Fasilitas
                        </label>
                        {isEditing ? (
                          <textarea
                            rows={3}
                            value={tier.description}
                            onChange={(e) =>
                              handleTierChange(tierKey, "description", e.target.value)
                            }
                            className="w-full p-2 rounded-lg border border-slate-200 text-xs font-medium bg-white outline-none focus:border-blue-500"
                          />
                        ) : (
                          <p className="text-xs text-slate-600 leading-relaxed min-h-[48px]">
                            {tier.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Estimasi Hari */}
                    <div className="space-y-1 border-t border-slate-200 pt-3 mt-2">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase block">
                        Waktu Pengerjaan
                      </label>
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={tier.deliveryDays}
                            onChange={(e) =>
                              handleTierChange(tierKey, "deliveryDays", Number(e.target.value))
                            }
                            className="w-16 px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold bg-white"
                          />
                          <span className="text-xs text-slate-500">Hari</span>
                        </div>
                      ) : (
                        <p className="text-xs font-bold text-slate-800">
                          {tier.deliveryDays} Hari Kerja
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* KOLOM KANAN (1 SPAN): Status, Image, Stats & Danger Zone */}
        <div className="space-y-6">
          
          {/* Card Status Layanan */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              Status Layanan
            </h3>

            <div className="flex items-center gap-2.5">
              {service.status === "AKTIF" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-xs">
                  <CheckCircle2 size={16} />
                  <span>AKTIF / TAYANG</span>
                </span>
              )}
              {service.status === "MENUNGGU" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 font-bold text-xs">
                  <Clock size={16} />
                  <span>MENUNGGU REVIEW</span>
                </span>
              )}
              {service.status === "DITOLAK" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs">
                  <XCircle size={16} />
                  <span>DITOLAK</span>
                </span>
              )}
            </div>

            {service.status === "AKTIF" && (
              <button
                type="button"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-xs"
              >
                <Rocket size={16} />
                <span>Boost Layanan Ini</span>
              </button>
            )}
          </div>

          {/* Card Gambar Cover + Upload State */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              Gambar Cover
            </h3>
            <div className="h-44 w-full rounded-xl bg-slate-100 overflow-hidden relative border border-slate-200 group">
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover"
              />
              {isEditing && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white cursor-pointer transition">
                  <Upload size={24} className="mb-1" />
                  <span className="text-xs font-semibold">Ubah Gambar</span>
                </div>
              )}
            </div>
          </div>

          {/* Card Performa Layanan */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              Performa Layanan
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500 flex items-center gap-2">
                  <Eye size={14} className="text-slate-400" />
                  Total Dilihat
                </span>
                <span className="font-bold text-slate-900">{service.stats.views}x</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500 flex items-center gap-2">
                  <ShoppingBag size={14} className="text-slate-400" />
                  Order Selesai
                </span>
                <span className="font-bold text-slate-900">{service.stats.ordersCompleted} Order</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500 flex items-center gap-2">
                  <TrendingUp size={14} className="text-slate-400" />
                  Pendapatan
                </span>
                <span className="font-bold text-emerald-600">{formatRupiah(service.stats.totalRevenue)}</span>
              </div>
            </div>
          </div>

          {/* Danger Zone: Nonaktifkan / Hapus */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <button
              type="button"
              className="w-full py-2 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-white text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Power size={14} />
              <span>Nonaktifkan Sementara</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full py-2 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Hapus Gig Ini</span>
            </button>
          </div>

        </div>

      </form>

      {/* MODAL KONFIRMASI HAPUS GIG */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
            
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Hapus Layanan Ini?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Kamu yakin ingin menghapus <strong>"{service.title}"</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteGig}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white text-xs font-semibold shadow-xs transition"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}