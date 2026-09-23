import React, { useState } from "react";
import { 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  CheckCircle, 
  Building2, 
  CreditCard, 
  FileText,
  Sparkles,
  Lock,
  AlertCircle
} from "lucide-react";
import ConfirmationRegisterModal from "~/src/components/merchant/ConfirmationRegisterModal";
import { validateOnBoardingSteps } from "~/src/helper/onBoardingValidation";

export default function MerchantOnboarding(): React.JSX.Element {
  const [step, setStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState<{
    bio: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    securityPin: string;
    confirmPin: string;
    studentIdCard: string | File | null;
  }>({
    bio: "",
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    securityPin: "",
    confirmPin: "",
    studentIdCard: null, 
  });

  const [showConfirmRegisterModal, setShowConfirmRegisterModal] = useState<boolean>(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNextStep = (e?: React.MouseEvent) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }

    const validation = validateOnBoardingSteps(step, formData);

    if (!validation.isValid) {
      setErrorMessage(validation.message || 'Terjadi kesalahan');
      return;
    }
    
    setErrorMessage('');

    if (step === 4) {
      setShowConfirmRegisterModal(true);
      return;
    }

    setStep((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-900/5 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl w-full max-w-xl overflow-hidden relative">
        
        {/* Progress Bar Atas */}
        <div className="w-full bg-slate-100 h-1.5">
          <div 
            className="bg-blue-600 h-1.5 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <div className="p-8 space-y-6">

          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}
          
          {/* STEP 0: WELCOME SCREEN */}
          {step === 0 && (
            <div className="space-y-6 text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
                <Sparkles size={28} />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-slate-900">
                  Aktivasi Akun Merchant 
                </h1>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Lengkapi 4 langkah verifikasi berikut untuk mengamankan toko dan menyiapkan dompet pencairan dana kamu.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left space-y-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Tahapan Setup Toko:
                </p>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                    <span>1. Menulis deskripsi / bio ringkas toko</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                    <span>2. Mengisi informasi rekening bank pencairan</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                    <span>3. Membuat kode keamanan (PIN transaksi)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                    <span>4. Unggah foto Kartu Tanda Mahasiswa (KTM)</span>
                  </div>
                </div>
              </div>

              <button
                type="button" 
                onClick={() => setStep(1)}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
              >
                <span>Mulai Setup Sekarang</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* STEP 1: DESKRIPSI TOKO */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5 text-slate-900">
                  <Building2 size={20} className="text-blue-600" />
                  <h2 className="text-sm font-bold">Langkah 1: Deskripsi Toko</h2>
                </div>
                <span className="text-[11px] font-bold text-slate-400">1 dari 4</span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Bio / Deskripsi Singkat Toko *</label>
                  <textarea
                    rows={4}
                    placeholder="Ceritakan secara singkat keahlian, layanan, atau jasa yang ditawarkan oleh tokomu..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500 resize-none"
                  />
                  <p className="text-[11px] text-slate-400">Deskripsi ini akan dilihat oleh calon klien pada halaman profil tokomu.</p>
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button" 
                  onClick={() => setStep(0)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} />
                  <span>Kembali</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextStep} // 👈 Langsung dipanggil di klik
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <span>Selanjutnya</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: REKENING BANK */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5 text-slate-900">
                  <CreditCard size={20} className="text-blue-600" />
                  <h2 className="text-sm font-bold">Langkah 2: Rekening Pencairan Dana</h2>
                </div>
                <span className="text-[11px] font-bold text-slate-400">2 dari 4</span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Nama Bank *</label>
                  <select
                    value={formData.bankName}
                    onChange={(e) => handleInputChange("bankName", e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500"
                  >
                    <option value="">-- Pilih Bank --</option>
                    <option value="BCA">BCA</option>
                    <option value="Mandiri">Mandiri</option>
                    <option value="BNI">BNI</option>
                    <option value="BRI">BRI</option>
                    <option value="SeaBank">SeaBank</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Nomor Rekening *</label>
                  <input
                    type="text"
                    placeholder="Contoh: 1234567890"
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Nama Pemilik Rekening *</label>
                  <input
                    type="text"
                    placeholder="Nama sesuai buku tabungan / rekening"
                    value={formData.accountHolder}
                    onChange={(e) => handleInputChange("accountHolder", e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button" 
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} />
                  <span>Kembali</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <span>Selanjutnya</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: KODE KEAMANAN (PIN) */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5 text-slate-900">
                  <Lock size={20} className="text-blue-600" />
                  <h2 className="text-sm font-bold">Langkah 3: Set Kode Keamanan (PIN)</h2>
                </div>
                <span className="text-[11px] font-bold text-slate-400">3 dari 4</span>
              </div>

              <div className="space-y-4 text-xs">
                <p className="text-slate-500 leading-relaxed">
                  PIN ini akan selalu diminta setiap kali kamu melakukan penarikan saldo demi keamanan aset dompet tokomu.
                </p>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Masukkan 6 Digit PIN Keamanan *</label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="••••••"
                    value={formData.securityPin}
                    onChange={(e) => handleInputChange("securityPin", e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500 font-mono tracking-widest text-center text-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Konfirmasi 6 Digit PIN *</label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="••••••"
                    value={formData.confirmPin}
                    onChange={(e) => handleInputChange("confirmPin", e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500 font-mono tracking-widest text-center text-lg"
                  />
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button" 
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} />
                  <span>Kembali</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <span>Selanjutnya</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: UPLOAD KARTU TANDA MAHASISWA (KTM) */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5 text-slate-900">
                  <FileText size={20} className="text-blue-600" />
                  <h2 className="text-sm font-bold">Langkah 4: Unggah Kartu Tanda Mahasiswa (KTM)</h2>
                </div>
                <span className="text-[11px] font-bold text-slate-400">4 dari 4</span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Foto / Scan KTM Asli *</label>
                  
                  <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 bg-slate-50/50 rounded-2xl p-6 text-center cursor-pointer relative transition">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (e.target.files?.[0]) {
                          handleInputChange("studentIdCard", e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    <Upload size={24} className="mx-auto text-blue-600 mb-2" />
                    <p className="font-semibold text-slate-700">
                      {formData.studentIdCard && typeof formData.studentIdCard === "object" && "name" in formData.studentIdCard
                        ? formData.studentIdCard.name 
                        : (typeof formData.studentIdCard === "string" && formData.studentIdCard !== "" 
                            ? formData.studentIdCard 
                            : "Klik atau seret file foto KTM ke sini")}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Format: JPG, PNG, atau PDF (Maks. 5MB)</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} />
                  <span>Kembali</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <span>Kirim pendaftaran</span>
                  <CheckCircle size={14} />
                </button>
              </div>
            </div>
          )}

          {/* --- MODAL KONFIRMASI --- */}
          <ConfirmationRegisterModal
            isOpen={showConfirmRegisterModal}
            onClose={() => setShowConfirmRegisterModal(false)}
            onConfirm={() => {
              if (typeof window !== "undefined") {
                localStorage.setItem("merchant_status", "PENDING_VERIFICATION");
                window.location.href = "/merchant/pending";
              }
            }}
            isLoading={false}
          />

        </div>
      </div>
    </div>
  );
}