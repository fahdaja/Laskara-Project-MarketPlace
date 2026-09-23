import React, { useState } from "react";
import {
  Store,
  Upload,
  Save,
  Building2,
  FileCheck,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Edit3,
  X,
  AlertCircle
} from "lucide-react";
import Breadcrumb from "../../components/common/BreadCrumb";

export default function StoreProfile(): React.JSX.Element {
  // State Form Toko
  const [storeName, setStoreName] = useState<string>("Nama Toko");
  const [isStoreNameSet, setIsStoreNameSet] = useState<boolean>(true); // Simulasi: true jika nama toko sudah pernah disimpan/diatur
  const [description, setDescription] = useState<string>(
    "Kami menyediakan jasa desain grafis, branding logo, dan solusi visual kreatif berkualitas tinggi untuk memperkuat identitas brand bisnis kamu."
  );
  
  // State Rekening Bank
  const [bankName, setBankName] = useState<string>("BCA");
  const [accountNumber, setAccountNumber] = useState<string>("8821049182");
  const [accountHolder, setAccountHolder] = useState<string>("Muhammad Fahd");

  // State Dinamis PIN Keamanan
  const [hasExistingPin, setHasExistingPin] = useState<boolean>(true); 
  const [isChangingPin, setIsChangingPin] = useState<boolean>(false);
  const [oldPin, setOldPin] = useState<string>("");
  const [newPin, setNewPin] = useState<string>("");
  const [confirmPin, setConfirmPin] = useState<string>("");

  // State Toggle Show/Hide PIN
  const [showOldPin, setShowOldPin] = useState<boolean>(false);
  const [showNewPin, setShowNewPin] = useState<boolean>(false);
  const [showConfirmPin, setShowConfirmPin] = useState<boolean>(false);

  // State Gambar
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // State Kontrol Mode (Read-Only vs Editable)
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditable) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditable) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Jika user sedang mencoba mengganti PIN
    if (isChangingPin) {
      if (!oldPin) {
        alert("Silakan masukkan PIN lama kamu untuk verifikasi.");
        return;
      }
      if (oldPin !== "123456") {
        alert("PIN lama yang kamu masukkan salah!");
        return;
      }
      if (!newPin || newPin.length !== 6) {
        alert("PIN baru harus terdiri dari 6 angka.");
        return;
      }
      if (newPin !== confirmPin) {
        alert("Konfirmasi PIN baru tidak cocok!");
        return;
      }
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsEditable(false);
      setIsChangingPin(false);
      setOldPin("");
      setNewPin("");
      setConfirmPin("");
      setHasExistingPin(true);
      setIsStoreNameSet(true); // Pastikan nama toko terkunci permanen setelah disimpan
      alert("Perubahan profil dan keamanan toko berhasil disimpan!");
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
              Atur profil publik toko, logo, rekening bank, dan kode keamanan penarikan dana.
            </p>
          </div>

          {/* Tombol Kontrol Mode */}
          {!isEditable ? (
            <button
              type="button"
              onClick={() => setIsEditable(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition shadow-sm"
            >
              <Edit3 size={16} />
              <span>Update Profil Toko</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditable(false);
                  setIsChangingPin(false);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition"
              >
                <X size={15} />
                <span>Batal</span>
              </button>

              <button
                type="submit"
                form="store-profile-form"
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium text-xs transition shadow-sm"
              >
                <Save size={16} />
                <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <form id="store-profile-form" onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: Header Banner & Logo Toko */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="relative h-44 bg-slate-100 flex items-center justify-center border-b border-slate-200">
            {bannerPreview ? (
              <img src={bannerPreview} alt="Banner Toko" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-slate-400 space-y-1">
                <Upload size={24} className="mx-auto" />
                <p className="text-xs font-semibold">Banner Cover Toko</p>
              </div>
            )}
            {isEditable && (
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
            )}
          </div>

          <div className="p-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4 -mt-10">
              <div className="relative w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Toko" className="w-full h-full object-cover" />
                ) : (
                  <Store size={36} className="text-slate-400" />
                )}
                {isEditable && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                )}
              </div>

              <div className="pb-1">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>{storeName || "Nama Toko"}</span>
                  <span title="Toko Terverifikasi" className="inline-flex items-center">
                    <ShieldCheck size={20} className="text-blue-600" />
                  </span>
                </h2>
                <p className="text-xs text-slate-500">Merchant Terverifikasi</p>
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Nama Toko / Brand <span className="text-rose-500">*</span>
              </label>
              {isStoreNameSet && (
                <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                  <Lock size={11} /> Permanen (Tidak dapat diubah)
                </span>
              )}
            </div>
            <input
              type="text"
              required
              disabled={isStoreNameSet} // Terkunci permanen jika sudah diset
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Deskripsi & Biografi Toko
            </label>
            <textarea
              rows={4}
              disabled={!isEditable}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan keahlian, pengalaman, dan nilai tambah dari jasa toko kamu..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-600 transition resize-none"
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
                disabled={!isEditable}
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-500 bg-white disabled:bg-slate-50 disabled:text-slate-600 transition"
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
                disabled={!isEditable}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-600 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Nama Pemilik Rekening <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={!isEditable}
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-600 transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: Kode Keamanan / PIN Penarikan Dana */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Lock size={16} className="text-blue-600" />
              <span>Kode Keamanan / PIN Penarikan Dana</span>
            </h3>
            
            {hasExistingPin && !isChangingPin && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                PIN Aktif (Terkunci)
              </span>
            )}
          </div>

          {!isChangingPin ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-800">PIN Keamanan Penarikan Telah Dikonfigurasi</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Untuk alasan keamanan, PIN disembunyikan. Tekan tombol di samping jika ingin mengubahnya.
                </p>
              </div>

              {isEditable && (
                <button
                  type="button"
                  onClick={() => setIsChangingPin(true)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition shrink-0 shadow-2xs"
                >
                  Ubah PIN Penarikan
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4 p-4 bg-amber-50/50 rounded-xl border border-amber-200/80">
              <p className="text-xs font-bold text-amber-900">
                Verifikasi PIN Lama untuk Mengatur PIN Baru:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* PIN Lama */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    PIN Lama (6 Angka) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPin ? "text" : "password"}
                      maxLength={6}
                      value={oldPin}
                      onChange={(e) => setOldPin(e.target.value)}
                      placeholder="••••••"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 bg-white text-xs font-bold tracking-widest outline-none focus:border-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPin(!showOldPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showOldPin ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* PIN Baru */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    PIN Baru (6 Angka) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPin ? "text" : "password"}
                      maxLength={6}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="••••••"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 bg-white text-xs font-bold tracking-widest outline-none focus:border-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPin(!showNewPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPin ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Konfirmasi PIN Baru */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Konfirmasi PIN Baru <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPin ? "text" : "password"}
                      maxLength={6}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="••••••"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 bg-white text-xs font-bold tracking-widest outline-none focus:border-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPin(!showConfirmPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPin ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPin(false);
                    setOldPin("");
                    setNewPin("");
                    setConfirmPin("");
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                >
                  Batal Ubah PIN
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 5: Status Verifikasi Dokumen */}
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