import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Store, Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import AuthPageShell from "~/src/components/auth/AuthPageShell";

export default function RegisterMerchant(): React.JSX.Element {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      navigate("/merchant/dashboard");
    }, 1200);
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
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Nama Lengkap Pemilik <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              placeholder="contoh: M. Fahd"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition bg-slate-50/50 focus:bg-white"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Email Toko / Merchant <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              placeholder="nama@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition bg-slate-50/50 focus:bg-white"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Kata Sandi <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              placeholder="Minimal 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition bg-slate-50/50 focus:bg-white"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100" />

        {/* Nama Toko */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Nama Toko / Brand <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Store size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              placeholder="contoh: Laskara Tech Studio"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition bg-slate-50/50 focus:bg-white"
            />
          </div>
        </div>

        {/* Kategori Utama */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Kategori Utama Jasa <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-500 bg-slate-50/50 focus:bg-white text-slate-700 transition"
          >
            <option value="">Pilih Kategori Utama</option>
            <option value="desain">Desain & Grafis</option>
            <option value="web">Web & Aplikasi</option>
            <option value="video">Video & Animasi</option>
            <option value="writing">Penulisan & Penerjemahan</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2 pt-2.5 mt-4"
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