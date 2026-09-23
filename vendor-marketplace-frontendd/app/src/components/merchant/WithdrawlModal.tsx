import React, { useState } from "react";
import { Link } from "react-router";
import { Building2, X, ShieldCheck, ExternalLink } from "lucide-react";
import KodeKeamananModal from "./KodeKeamananModal";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  savedBankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  onSuccessWithdraw: (amount: number) => void;
}

export default function WithdrawalModal({
  isOpen,
  onClose,
  availableBalance,
  savedBankAccount,
  onSuccessWithdraw,
}: WithdrawalModalProps): React.JSX.Element | null {
  // State khusus untuk modal PIN di dalam komponen ini
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number | "">("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  if (!isOpen && !isPinModalOpen) return null;

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  };

  // STEP 1: Validasi form -> Sembunyikan form nominal, LANGSUNG buka modal PIN
  const handleProceedToPin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const amountNum = Number(withdrawAmount);

    if (!amountNum || amountNum < 50000) {
      setErrorMessage("Minimal penarikan saldo adalah Rp 50.000");
      return;
    }

    if (amountNum > availableBalance) {
      setErrorMessage("Nominal penarikan melebihi saldo yang tersedia.");
      return;
    }

    // PENTING: Tutup modal form penarikan DULU, baru buka modal PIN dalam satu siklus render yang aman
    onClose(); 
    setIsPinModalOpen(true);
  };

  // STEP 2: Jika PIN benar
  const handleSuccessfulPinVerification = () => {
    const amountNum = Number(withdrawAmount);
    onSuccessWithdraw(amountNum); 
    setIsPinModalOpen(false);
    setWithdrawAmount("");
  };

  return (
    <>
      {/* MODAL 1: FORM INPUT NOMINAL PENARIKAN (Hanya muncul jika isOpen true & isPinModalOpen false) */}
      {isOpen && !isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Tarik Saldo ke Bank</h3>
                  <p className="text-xs text-slate-500">Minimal penarikan dana adalah Rp 50.000</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleProceedToPin} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                  {errorMessage}
                </div>
              )}

              {/* REKENING BANK TERKUNCI */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Rekening Bank Tujuan
                  </label>
                  <Link
                    to="/merchant/profile"
                    className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>Ubah Rekening</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-blue-600 font-extrabold text-xs shadow-2xs">
                      {savedBankAccount.bankName}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Bank {savedBankAccount.bankName} • **** {savedBankAccount.accountNumber.slice(-4)}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        a.n {savedBankAccount.accountHolder}
                      </p>
                    </div>
                  </div>
                  <ShieldCheck size={18} className="text-emerald-500 flex-shrink-0" />
                </div>
              </div>

              {/* Input Nominal */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Nominal Penarikan (IDR)
                  </label>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(availableBalance)}
                    className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Tarik Semua ({formatRupiah(availableBalance)})
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    min={50000}
                    max={availableBalance}
                    required
                    placeholder="0"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value ? Number(e.target.value) : "")}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Rincian Biaya */}
              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 space-y-1 border border-slate-100">
                <div className="flex justify-between">
                  <span>Biaya Transfer Bank:</span>
                  <span className="font-semibold text-emerald-600">Gratis (Promo)</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimasi Masuk Rekening:</span>
                  <span className="font-semibold text-slate-700">Maksimal 1x24 Jam Kerja</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                >
                  Lanjut ke Verifikasi PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: KODE KEAMANAN PIN */}
      <KodeKeamananModal
        isOpen={isPinModalOpen}
        onClose={() => {
          setIsPinModalOpen(false);
          // Jika user membatalkan PIN, buka kembali modal input nominal
          // (Kita bisa panggil ulang fungsi trigger dari parent atau biarkan terbuka kembali)
        }}
        onSuccess={handleSuccessfulPinVerification}
        title="Masukkan PIN Keamanan"
        subtitle="Konfirmasi pencairan saldo toko"
        nominalText={withdrawAmount ? formatRupiah(Number(withdrawAmount)) : undefined}
      />
    </>
  );
}