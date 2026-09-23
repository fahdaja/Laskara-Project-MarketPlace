import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Upload, CheckCircle2, Layers, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import Breadcrumb from "../../components/common/BreadCrumb";
import type { PackageTier } from "~/src/types/Gigs";
import type { PortfolioItem } from "~/src/types/Gigs";

export default function AddGig(): React.JSX.Element {
  const navigate = useNavigate();

  // State Form Utama
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const [packages, setPackages] = useState<{
    basic: PackageTier;
    standard: PackageTier;
    premium: PackageTier;
  }>({
    basic: { price: "", features: [""] },
    standard: { price: "", features: [""] },
    premium: { price: "", features: [""] },
  });

  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePackagePriceChange = (
    tier: "basic" | "standard" | "premium",
    value: number | ""
  ) => {
    setPackages((prev) => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        price: value,
      },
    }));
  };

  // Helper Tambah Baris Fitur pada Tier Tertentu
  const handleAddFeatureRow = (tier: "basic" | "standard" | "premium") => {
    setPackages((prev) => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        features: [...prev[tier].features, ""],
      },
    }));
  };

  // Helper Update Nilai Baris Fitur Tertentu
  const handleFeatureChange = (
    tier: "basic" | "standard" | "premium",
    index: number,
    value: string
  ) => {
    setPackages((prev) => {
      const updatedFeatures = [...prev[tier].features];
      updatedFeatures[index] = value;
      return {
        ...prev,
        [tier]: {
          ...prev[tier],
          features: updatedFeatures,
        },
      };
    });
  };

  // Helper Hapus Baris Fitur pada Tier Tertentu
  const handleRemoveFeatureRow = (
    tier: "basic" | "standard" | "premium",
    index: number
  ) => {
    setPackages((prev) => {
      const updatedFeatures = prev[tier].features.filter((_, i) => i !== index);
      return {
        ...prev,
        [tier]: {
          ...prev[tier],
          features: updatedFeatures.length > 0 ? updatedFeatures : [""], // Minimal sisakan 1 baris kosong
        },
      };
    });
  };

  // Handler Tambah File Portofolio
  const handleAddPortfolioImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const newItem: PortfolioItem = {
          id: `PORTO-${Date.now()}`,
          image: reader.result as string,
        };
        setPortfolios((prev) => [...prev, newItem]);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  // Hapus Portofolio dari List
  const handleRemovePortfolioItem = (id: string) => {
    setPortfolios((prev) => prev.filter((item) => item.id !== id));
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
              Tentukan paket penawaran, fitur dinamis, dan daftar portofolio unggulan untuk klien.
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
              placeholder="contoh: Desain Logo Profesional & Branding"
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

        {/* SECTION 2: Harga & Ketentuan (3 Card Tiers dengan List Fitur Dinamis) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Harga & Ketentuan Paket
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* TIER 01: BASIC */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm hover:border-slate-300 transition flex flex-col justify-between">
              <div className="space-y-4">
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
                      placeholder="0"
                      value={packages.basic.price}
                      onChange={(e) =>
                        handlePackagePriceChange("basic", e.target.value ? Number(e.target.value) : "")
                      }
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* List Fitur Dinamis Basic */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-slate-500">Fitur yang Termasuk:</p>
                    <button
                      type="button"
                      onClick={() => handleAddFeatureRow("basic")}
                      className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Plus size={12} /> Tambah Fitur
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {packages.basic.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          required
                          placeholder={`Fitur #${index + 1}`}
                          value={feature}
                          onChange={(e) => handleFeatureChange("basic", index, e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-xs outline-none focus:bg-white focus:border-blue-400 transition"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFeatureRow("basic", index)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus baris"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* TIER 02: STANDARD */}
            <div className="bg-white rounded-2xl border-2 border-blue-500 p-5 space-y-4 shadow-md relative flex flex-col justify-between">
              <div className="space-y-4">
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
                      placeholder="0"
                      value={packages.standard.price}
                      onChange={(e) =>
                        handlePackagePriceChange("standard", e.target.value ? Number(e.target.value) : "")
                      }
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* List Fitur Dinamis Standard */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-slate-500">Fitur yang Termasuk:</p>
                    <button
                      type="button"
                      onClick={() => handleAddFeatureRow("standard")}
                      className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Plus size={12} /> Tambah Fitur
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {packages.standard.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          required
                          placeholder={`Fitur #${index + 1}`}
                          value={feature}
                          onChange={(e) => handleFeatureChange("standard", index, e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-xs outline-none focus:bg-white focus:border-blue-400 transition"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFeatureRow("standard", index)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus baris"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* TIER 03: PREMIUM */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm hover:border-slate-300 transition flex flex-col justify-between">
              <div className="space-y-4">
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
                      placeholder="0"
                      value={packages.premium.price}
                      onChange={(e) =>
                        handlePackagePriceChange("premium", e.target.value ? Number(e.target.value) : "")
                      }
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* List Fitur Dinamis Premium */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-slate-500">Fitur yang Termasuk:</p>
                    <button
                      type="button"
                      onClick={() => handleAddFeatureRow("premium")}
                      className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Plus size={12} /> Tambah Fitur
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {packages.premium.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          required
                          placeholder={`Fitur #${index + 1}`}
                          value={feature}
                          onChange={(e) => handleFeatureChange("premium", index, e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-xs outline-none focus:bg-white focus:border-blue-400 transition"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFeatureRow("premium", index)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus baris"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Portfolio Assets (Grid Plus Add Button) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Daftar Portofolio Layanan ({portfolios.length} Gambar)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Klik kotak tambah (+) untuk mengunggah dan menambahkan gambar portofolio ke dalam list.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-1">
            {portfolios.map((item) => (
              <div
                key={item.id}
                className="relative bg-white border border-slate-200 rounded-2xl p-2 space-y-2 shadow-2xs group"
              >
                <div className="relative h-32 rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                  <img src={item.image} alt="Portofolio" className="w-full h-full object-cover" />
                </div>

                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold text-slate-400">
                    Portofolio #{portfolios.indexOf(item) + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemovePortfolioItem(item.id)}
                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                    title="Hapus gambar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            <label className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/30 rounded-2xl h-[156px] flex flex-col items-center justify-center text-center cursor-pointer transition group">
              <input
                type="file"
                accept="image/*"
                onChange={handleAddPortfolioImage}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-200 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition mb-2">
                <Plus size={20} />
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition">
                Tambah Portofolio
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG</span>
            </label>
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