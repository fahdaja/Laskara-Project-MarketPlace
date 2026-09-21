import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import AuthPageShell from "~/src/components/auth/AuthPageShell";

export default function RegisterClient(): React.JSX.Element {
  const navigate = useNavigate();

  // State Form Registration Client
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulasi registrasi client ke backend
    setTimeout(() => {
      setIsLoading(false);
      // Redirect ke katalog/explore marketplace setelah berhasil
      navigate("/catalog");
    }, 1200);
  };

  return (
    <AuthPageShell>
      {/* Header Info */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mb-3 border border-blue-100 shadow-sm">
          <User size={24} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Buat Akun Client
        </h1>
        <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
          Temukan vendor profesional dan pesan jasa untuk kebutuhan proyek kamu.
        </p>
      </div>

      {/* Form Area */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama Lengkap */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Nama Lengkap <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              placeholder="contoh: Budi Santoso"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition bg-slate-50/50 focus:bg-white"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Alamat Email <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition bg-slate-50/50 focus:bg-white"
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
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition bg-slate-50/50 focus:bg-white"
            />
          </div>
        </div>

        {/* Info Persetujuan */}
        <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
          Dengan mendaftar, kamu menyetujui{" "}
          <span className="text-blue-600 font-semibold underline cursor-pointer">
            Syarat & Ketentuan
          </span>{" "}
          serta{" "}
          <span className="text-blue-600 font-semibold underline cursor-pointer">
            Kebijakan Privasi
          </span>{" "}
          LayananPro.
        </p>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2 pt-2.5 mt-2"
        >
          {isLoading ? (
            <span>Mendaftarkan Akun...</span>
          ) : (
            <>
              <span>Daftar Akun Client</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Trust Badges */}
      <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-[11px] text-slate-500 font-medium">
        <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
          <ShieldCheck size={14} className="text-blue-600" />
          <span>Garansi Uang Kembali</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
          <CheckCircle2 size={14} className="text-emerald-600" />
          <span>Vendor Terverifikasi</span>
        </div>
      </div>

      {/* Footer Navigasi Login */}
      <div className="mt-6 text-center">
        <p className="text-xs text-slate-500">
          Sudah memiliki akun?{" "}
          <Link to="/login" className="font-bold text-blue-600 hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </AuthPageShell>
  );
}