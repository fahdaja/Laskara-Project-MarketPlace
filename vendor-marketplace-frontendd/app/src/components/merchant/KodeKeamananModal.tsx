import React, { useState } from "react";
import { Lock, Eye, EyeOff, X } from "lucide-react";

interface KodeKeamananModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  subtitle?: string;
  nominalText?: string; // Opsional: Untuk menampilkan info nominal jika dari penarikan dana
}

export default function KodeKeamananModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Masukkan PIN Keamanan",
  subtitle = "Konfirmasi tindakan sensitif akun",
  nominalText,
}: KodeKeamananModalProps): React.JSX.Element | null {
  const [pin, setPin] = useState<string>("");
  const [showPin, setShowPin] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!pin || pin.length !== 6) {
      setErrorMessage("Masukkan 6 digit PIN keamanan dengan benar.");
      return;
    }

    // Simulasi pengecekan PIN (asumsi PIN benar adalah "123456")
    if (pin !== "123456") {
      setErrorMessage("PIN keamanan yang kamu masukkan salah!");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setPin("");
      onSuccess(); // Jalankan fungsi callback jika PIN benar
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
              {errorMessage}
            </div>
          )}

          {nominalText && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-1">
              <p className="text-[11px] text-slate-500">Total Nominal:</p>
              <p className="text-base font-black text-slate-900 font-mono">
                {nominalText}
              </p>
            </div>
          )}

          {/* Input PIN 6 Angka */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block text-center">
              PIN Keamanan (6 Angka) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPin ? "text" : "password"}
                maxLength={6}
                required
                autoFocus
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••"
                className="w-full px-3.5 py-3 pr-10 text-center rounded-xl border border-slate-200 text-base font-black tracking-widest outline-none focus:border-blue-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center pt-1">
              *PIN Simulasi: <span className="font-mono font-bold text-slate-600">123456</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
            >
              {isLoading ? "Memproses..." : "Konfirmasi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}