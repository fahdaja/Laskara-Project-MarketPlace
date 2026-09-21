import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Upload, CheckCircle2, Layers } from "lucide-react";
import Breadcrumb from "../../components/common/BreadCrumb";

interface PackageTier {
  price: number | "";
  feature1: string;
  feature2: string;
  feature3: string;
}

export default function AddGig(): React.JSX.Element {
  const navigate = useNavigate();

  // State Form Utama
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  // State 3 Tier Paket (Basic, Standard, Premium)
  const [packages, setPackages] = useState<{
    basic: PackageTier;
    standard: PackageTier;
    premium: PackageTier;
  }>({
    basic: { price: "", feature1: "", feature2: "", feature3: "" },
    standard: { price: "", feature1: "", feature2: "", feature3: "" },
    premium: { price: "", feature1: "", feature2: "", feature3: "" },
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper Update State Paket
  const handlePackageChange = (
    tier: "basic" | "standard" | "premium",
    field: keyof PackageTier,
    value: string | number
  ) => {
    setPackages((prev) => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        [field]: value,
      },
    }));
  };

  // Upload Gambar Handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulasi kirim data ke API backend
    setTimeout(() => {
      setIsSubmitting(false);
      navigate("/merchant/services");
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header & Breadcrumb Navigasi */}
      <div>
        <Breadcrumb />
        <div className="flex items-center gap-4 mt-2">
          <Link
            to="/merchant/gigs"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-sm"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Buat Layanan Baru</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Tentukan paket penawaran dan fitur yang akan didapatkan oleh calon klien.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: Informasi dasar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              NAMA LAYANAN <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="contoh: Desain Logo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              DESKRIPSI <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Jelaskan nilai utama layanan dan dampak operasionalnya..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              KATEGORI <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition bg-white text-slate-700"
            >
              <option value="">Pilih kategori</option>
              <option value="desain">Desain & Grafis</option>
              <option value="web">Web & Aplikasi</option>
              <option value="video">Video & Animasi</option>
              <option value="writing">Penulisan & Penerjemahan</option>
            </select>
          </div>
        </div>

        {/* SECTION 2: Harga & Ketentuan (3 Card Tiers Sesuai Figma) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Harga & Ketentuan Paket
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* TIER 01: BASIC */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm hover:border-slate-300 transition">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  TIER 01
                </span>
                <h3 className="font-bold text-slate-800 text-sm">Basic</h3>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Harga Paket (IDR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={packages.basic.price}
                    onChange={(e) =>
                      handlePackageChange("basic", "price", e.target.value ? Number(e.target.value) : "")
                    }
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-semibold text-slate-500">Fitur yang Termasuk:</p>
                <input
                  type="text"
                  placeholder="Fitur 1 (mis. 1 Konsep Logo)"
                  value={packages.basic.feature1}
                  onChange={(e) => handlePackageChange("basic", "feature1", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-100 bg-slate-50/50 text-xs outline-none focus:bg-white focus:border-blue-400 transition"
                />
                <input
                  type="text"
                  placeholder="Fitur 2 (mis. File PNG/JPG)"
                  value={packages.basic.feature2}
                  onChange={(e) => handlePackageChange("basic", "feature2", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-100 bg-slate-50/50 text-xs outline-none focus:bg-white focus:border-blue-400 transition"
                />
                <input
                  type="text"
                  placeholder="Fitur 3 (mis. 1x Revisi)"
                  value={packages.basic.feature3}
                  onChange={(e) => handlePackageChange("basic", "feature3", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-100 bg-slate-50/50 text-xs outline-none focus:bg-white focus:border-blue-400 transition"
                />
              </div>
            </div>

            {/* TIER 02: STANDARD (POPULAR / HIGHLIGHT) */}
            <div className="bg-white rounded-2xl border-2 border-blue-500 p-5 space-y-4 shadow-md relative">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[10px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  TIER 02
                </span>
                <h3 className="font-bold text-blue-600 text-sm">Standard</h3>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Harga Paket (IDR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={packages.standard.price}
                    onChange={(e) =>
                      handlePackageChange("standard", "price", e.target.value ? Number(e.target.value) : "")
                    }
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-semibold text-slate-500">Fitur yang Termasuk:</p>
                <input
                  type="text"
                  placeholder="Fitur 1 (mis. 3 Konsep Logo)"
                  value={packages.standard.feature1}
                  onChange={(e) => handlePackageChange("standard", "feature1", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-100 bg-slate-50/50 text-xs outline-none focus:bg-white focus:border-blue-400 transition"
                />
                <input
                  type="text"
                  placeholder="Fitur 2 (mis. File Vector Master .AI)"
                  value={packages.standard.feature2}
                  onChange={(e) => handlePackageChange("standard", "feature2", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-100 bg-slate-50/50 text-xs outline-none focus:bg-white focus:border-blue-400 transition"
                />
                <input
                  type="text"
                  placeholder="Fitur 3 (mis. 3x Revisi)"
                  value={packages.standard.feature3}
                  onChange={(e) => handlePackageChange("standard", "feature3", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-100 bg-slate-50/50 text-xs outline-none focus:bg-white focus:border-blue-400 transition"
                />
              </div>
            </div>

            {/* TIER 03: PREMIUM */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm hover:border-slate-300 transition">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  TIER 03
                </span>
                <h3 className="font-bold text-slate-800 text-sm">Premium</h3>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Harga Paket (IDR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={packages.premium.price}
                    onChange={(e) =>
                      handlePackageChange("premium", "price", e.target.value ? Number(e.target.value) : "")
                    }
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-semibold text-slate-500">Fitur yang Termasuk:</p>
                <input
                  type="text"
                  placeholder="Fitur 1 (mis. Unlimited Konsep)"
                  value={packages.premium.feature1}
                  onChange={(e) => handlePackageChange("premium", "feature1", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-100 bg-slate-50/50 text-xs outline-none focus:bg-white focus:border-blue-400 transition"
                />
                <input
                  type="text"
                  placeholder="Fitur 2 (mis. Full Brand Styleguide)"
                  value={packages.premium.feature2}
                  onChange={(e) => handlePackageChange("premium", "feature2", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-100 bg-slate-50/50 text-xs outline-none focus:bg-white focus:border-blue-400 transition"
                />
                <input
                  type="text"
                  placeholder="Fitur 3 (mis. Revisi Tanpa Batas)"
                  value={packages.premium.feature3}
                  onChange={(e) => handlePackageChange("premium", "feature3", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-100 bg-slate-50/50 text-xs outline-none focus:bg-white focus:border-blue-400 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Portfolio Assets (Dropzone Image) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            PORTFOLIO ASSETS
          </label>

          <div className="relative border-2 border-dashed border-slate-200 hover:border-blue-500 bg-slate-50/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />

            {imagePreview ? (
              <div className="relative w-full max-w-sm h-40 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Upload size={20} />
                </div>
                <p className="text-xs font-medium text-slate-600">
                  Drag and drop assets or{" "}
                  <span className="text-blue-600 font-bold underline">browse</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  High-resolution PNG, JPG (Min 1080p recommended)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Button Selesai */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs transition shadow-sm flex items-center gap-2"
          >
            {isSubmitting ? (
              <span>Menyimpan...</span>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Selesai & Publish Layanan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}