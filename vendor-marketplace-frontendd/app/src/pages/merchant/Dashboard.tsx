import React, { useState } from "react";
import { Link } from "react-router";
import {
  Wallet,
  ShoppingBag,
  LayoutGrid,
  Star,
  ArrowUpRight,
  Clock,
  Plus,
  MessageSquare,
  ChevronRight,
  Building2,
  X,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import Breadcrumb from "../../components/common/BreadCrumb";

export default function Dashboard(): React.JSX.Element {
  // STATE SALDO & MODAL PENARIKAN DANA
  const [availableBalance, setAvailableBalance] = useState<number>(4250000);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number | "">("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Mock Rekening Terkunci (Sesuai Settings Toko)
  const savedBankAccount = {
    bankName: "BCA",
    accountNumber: "8829103912",
    accountHolder: "M. Fahd Al Bantani",
  };

  // Mock Data Pesanan Terbaru
  const recentOrders = [
    {
      id: "ORD-9482",
      client: "Budi Santoso",
      service: "Desain Logo Minimalis",
      price: 150000,
      deadline: "2 Hari lagi",
      status: "DIPROSES",
    },
    {
      id: "ORD-9481",
      client: "Siti Rahma",
      service: "UI/UX Landing Page",
      price: 450000,
      deadline: "Esok Hari",
      status: "MENUNGGU",
    },
    {
      id: "ORD-9479",
      client: "PT Digital Nusantara",
      service: "Video Motion Graphic 30s",
      price: 750000,
      deadline: "Selesai",
      status: "SELESAI",
    },
  ];

  // Helper Format Rupiah
  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  };

  // SUBMIT HANDLER PENARIKAN DANA
  const handleWithdrawSubmit = (e: React.FormEvent) => {
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

    setIsLoading(true);

    setTimeout(() => {
      setAvailableBalance((prev) => prev - amountNum);
      setIsLoading(false);
      setIsWithdrawModalOpen(false);
      setWithdrawAmount("");
      alert(`Berhasil mengajukan penarikan saldo sebesar ${formatRupiah(amountNum)}!`);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman & Breadcrumb */}
      <div>
        <Breadcrumb />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ringkasan Toko</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau performa penjualan, pesanan masuk, dan aktivitas tokomu hari ini.
            </p>
          </div>

          <Link
            to="/merchant/gigs/create"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition shadow-sm"
          >
            <Plus size={16} />
            <span>Buat Layanan Baru</span>
          </Link>
        </div>
      </div>

      {/* Grid 4 Stat Cards Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pendapatan */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Total Pendapatan
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Wallet size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {formatRupiah(12500000)}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <ArrowUpRight size={12} />
              <span>+12.5% dari bulan lalu</span>
            </p>
          </div>
        </div>

        {/* Card 2: Pesanan Aktif */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Pesanan Aktif
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">8 Orderan</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              2 pesanan butuh konfirmasi
            </p>
          </div>
        </div>

        {/* Card 3: Layanan Tayang */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Layanan Aktif
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <LayoutGrid size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">5 Gig</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              1 dalam peninjauan
            </p>
          </div>
        </div>

        {/* Card 4: Rating Toko */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Rating Toko
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500">
              <Star size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">4.9 / 5.0</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Dari 38 ulasan klien
            </p>
          </div>
        </div>
      </div>

      {/* Grid 2 Kolom: Tabel Pesanan & Widget Samping */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Pesanan Masuk Terbaru (2 Span) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Pesanan Perlu Diproses
              </h2>
              <p className="text-xs text-slate-400">
                Daftar transaksi yang sedang atau siap kamu kerjakan.
              </p>
            </div>
            <Link
              to="/merchant/orders"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-2">Klien & Layanan</th>
                  <th className="pb-3 px-2">Harga</th>
                  <th className="pb-3 px-2">Deadline</th>
                  <th className="pb-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-2 space-y-0.5">
                      <div className="font-bold text-slate-800">
                        {order.client}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {order.service} • <span className="font-mono text-slate-400">{order.id}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 font-bold text-slate-900">
                      {formatRupiah(order.price)}
                    </td>
                    <td className="py-3 px-2 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock size={13} className="text-slate-400" />
                        <span>{order.deadline}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      {order.status === "DIPROSES" && (
                        <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 font-bold text-[10px]">
                          DIPROSES
                        </span>
                      )}
                      {order.status === "MENUNGGU" && (
                        <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-600 font-bold text-[10px]">
                          MENUNGGU
                        </span>
                      )}
                      {order.status === "SELESAI" && (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 font-bold text-[10px]">
                          SELESAI
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kolom Kanan: Quick Action & Chat (1 Span) */}
        <div className="space-y-6">
          {/* Card Penarikan Saldo */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">
                Dompet Merchant
              </span>
              <Wallet size={18} className="text-slate-300" />
            </div>

            <div>
              <p className="text-2xl font-bold">{formatRupiah(availableBalance)}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Saldo siap ditarik ke rekening bank
              </p>
            </div>

            <button
              onClick={() => {
                setErrorMessage("");
                setIsWithdrawModalOpen(true);
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs transition shadow"
            >
              Tarik Dana Sekarang
            </button>
          </div>

          {/* Card Pesan Terbaru */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-slate-500" />
                <h3 className="text-xs font-bold text-slate-900">
                  Pesan Belum Dibaca
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px]">
                2
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition cursor-pointer">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Andi Setiawan</span>
                  <span className="text-[10px] font-normal text-slate-400">10m</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  Halo mas, apakah bisa pengerjaan logo dipercepat?
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL TARIK DANA */}
      {isWithdrawModalOpen && (
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
                onClick={() => setIsWithdrawModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                  {errorMessage}
                </div>
              )}

              {/* INFO REKENING BANK TERKUNCI */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Rekening Bank Tujuan
                  </label>
                  <Link
                    to="/merchant/store"
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

              {/* Input Nominal Penarikan */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Nominal Penarikan (IDR)
                  </label>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(availableBalance)}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
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
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  {isLoading ? "Memproses..." : "Konfirmasi Penarikan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}