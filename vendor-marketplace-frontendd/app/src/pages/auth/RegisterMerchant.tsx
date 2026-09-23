import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Store, Mail, Lock, User, ArrowRight, Info } from "lucide-react";
import AuthPageShell from "~/src/components/auth/AuthPageShell";




export default function RegisterMerchant(): React.JSX.Element {
 

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("merchant_status", "ONBOARDING")
    navigate("/merchant/dashboard")
  };

  return (
    <AuthPageShell>
      {/* Header Info */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 mb-3 border border-purple-100 shadow-sm">
          <Store size={24} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Mulai Jualan di LayananPro
        </h1>
        <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
          Buka toko vendor kamu dan jangkau ratusan klien proyek dengan mudah.
        </p>
      </div>

      {/* Form Area */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama Pemilik */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Nama Lengkap Pemilik <span className="text-rose-500">*</span>
          </label>
          <div className="relative group">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition" />
            <input
              type="text"
              required
              placeholder="contoh: M. Fahd"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition bg-slate-50/60 focus:bg-white"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Email Toko / Merchant <span className="text-rose-500">*</span>
          </label>
          <div className="relative group">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition" />
            <input
              type="email"
              required
              placeholder="nama@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition bg-slate-50/60 focus:bg-white"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Kata Sandi <span className="text-rose-500">*</span>
          </label>
          <div className="relative group">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition" />
            <input
              type="password"
              required
              minLength={8}
              placeholder="Minimal 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition bg-slate-50/60 focus:bg-white"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100" />

        {/* Nama Toko */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Nama Toko / Brand <span className="text-rose-500">*</span>
          </label>
          <div className="relative group">
            <Store size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition" />
            <input
              type="text"
              required
              placeholder="contoh: Laskara Tech Studio"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition bg-slate-50/60 focus:bg-white"
            />
          </div>
          {/* Informasi Tambahan / Catatan Permanen */}
          <div className="flex items-start gap-1.5 pt-1 px-1">
            <Info size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 leading-tight">
              Nama toko bersifat <strong className="text-slate-700">permanen</strong> dan tidak dapat diubah setelah toko berhasil dibuat. Pastikan sudah benar.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-bold text-xs transition shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 mt-4 cursor-pointer"
        >
          {isLoading ? (
            <span>Mendaftarkan Toko...</span>
          ) : (
            <>
              <span>Daftar Toko Sekarang</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Footer Navigasi Login */}
      <div className="border-t border-slate-100 mt-6 pt-4 text-center">
        <p className="text-xs text-slate-500">
          Sudah memiliki akun?{" "}
          <Link to="/login" className="font-bold text-purple-600 hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </AuthPageShell>
  );
}