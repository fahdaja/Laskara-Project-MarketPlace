import React, { useState } from "react";
import {
  Store,
  Upload,
  Save,
  Building2,
  FileCheck,
  CheckCircle2,
  Globe,
  Clock,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import Breadcrumb from "../../components/common/BreadCrumb";

export default function StoreProfile(): React.JSX.Element {
  // State Form Toko
  const [storeName, setStoreName] = useState<string>("Nama Toko");
  const [storeCategory, setStoreCategory] = useState<string>("Desain & Grafis");
  const [description, setDescription] = useState<string>(
    "Kami menyediakan jasa desain grafis, branding logo, dan solusi visual kreatif berkualitas tinggi untuk memperkuat identitas brand bisnis kamu."
  );
  const [operatingHours, setOperatingHours] = useState<string>("Senin - Jumat (09:00 - 18:00)");
  const [bankName, setBankName] = useState<string>("BCA");
  const [accountNumber, setAccountNumber] = useState<string>("8821049182");
  const [accountHolder, setAccountHolder] = useState<string>("Muhammad Fahd");

  // State Gambar
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Profil toko berhasil diperbarui!");
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header & Breadcrumb */}
      <div>
        <Breadcrumb />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Toko Saya</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Atur profil publik toko, logo, deskripsi, dan informasi rekening penarikan dana.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium text-xs transition shadow-sm"
          >
            <Save size={16} />
            <span>{isSaving ? "Memproses..." : "Simpan Perubahan"}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: Header Banner & Logo Toko */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Banner Cover */}
          <div className="relative h-44 bg-slate-100 flex items-center justify-center border-b border-slate-200">
            {bannerPreview ? (
              <img src={bannerPreview} alt="Banner Toko" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-slate-400 space-y-1">
                <Upload size={24} className="mx-auto" />
                <p className="text-xs font-semibold">Unggah Banner Cover Toko (1200 x 400px)</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>

          {/* Logo Profile Avatar */}
          <div className="p-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4 -mt-10">
              <div className="relative w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Toko" className="w-full h-full object-cover" />
                ) : (
                  <Store size={36} className="text-slate-400" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>

              <div className="pb-1">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>{storeName || "Nama Toko"}</span>
                  <span title="Toko Terverifikasi" className="inline-flex items-center">
  <ShieldCheck size={20} className="text-blue-600" />
</span>
                </h2>
                <p className="text-xs text-slate-500">{storeCategory}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md uppercase tracking-wider border border-emerald-100">
                Toko Aktif
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 2: Informasi Dasar Toko */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
            <Store size={16} className="text-blue-600" />
            <span>Informasi Publik Toko</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Nama Toko / Brand <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Kategori Utama Layanan <span className="text-rose-500">*</span>
              </label>
              <select
                value={storeCategory}
                onChange={(e) => setStoreCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-500 bg-white transition"
              >
                <option value="Desain & Grafis">Desain & Grafis</option>
                <option value="Web & Aplikasi">Web & Aplikasi</option>
                <option value="Video & Animasi">Video & Animasi</option>
                <option value="Penulisan & Penerjemahan">Penulisan & Penerjemahan</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Jam Operasional Toko
            </label>
            <input
              type="text"
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
              placeholder="contoh: Senin - Jumat (08:00 - 17:00 WIB)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Deskripsi & Biografi Toko
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan keahlian, pengalaman, dan nilai tambah dari jasa toko kamu..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-500 transition resize-none"
            />
          </div>
        </div>

        {/* SECTION 3: Pengaturan Rekening Bank */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 size={16} className="text-blue-600" />
            <span>Rekening Bank Penarikan Dana</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Nama Bank <span className="text-rose-500">*</span>
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-500 bg-white transition"
              >
                <option value="BCA">Bank BCA</option>
                <option value="Mandiri">Bank Mandiri</option>
                <option value="BNI">Bank BNI</option>
                <option value="BRI">Bank BRI</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Nomor Rekening <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-blue-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Nama Pemilik Rekening <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: Status Verifikasi Dokumen */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
            <FileCheck size={16} className="text-blue-600" />
            <span>Dokumen Verifikasi Toko</span>
          </h3>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Kartu Tanda Mahasiswa (KTM) / SK Toko</p>
                <p className="text-[11px] text-slate-500">Telah diverifikasi oleh Admin Platform</p>
              </div>
            </div>

            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-md uppercase">
              VERIFIED
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}