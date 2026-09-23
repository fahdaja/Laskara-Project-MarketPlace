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
  ChevronRight,
  ShieldAlert,
  Repeat,
} from "lucide-react";
import Breadcrumb from "../../components/common/BreadCrumb";
import WithdrawalModal from "../../components/merchant/WithdrawlModal"; 
import { formatRupiah } from "~/src/utils/formatRupiah";

export default function Dashboard(): React.JSX.Element {
 
  const [userRole, setUserRole] = useState<"OWNER" | "ASSOCIATE">("ASSOCIATE"); 
  const [availableBalance, setAvailableBalance] = useState<number>(4250000);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);

  const savedBankAccount = {
    bankName: "BCA",
    accountNumber: "8829103912",
    accountHolder: "M. Fahd Al Bantani",
  };

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
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <Breadcrumb />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">
                {userRole === "OWNER" ? "Ringkasan Toko (Owner)" : "Ringkasan Operasional (Associate)"}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {userRole === "OWNER" 
                ? "Pantau performa keuangan, penjualan, dan aktivitas tokomu secara penuh." 
                : "Pantau pesanan masuk dan progres layanan operasional harian."}
            </p>
          </div>

          {/* Tombol Aksi & Testing Switch Role */}
          <div className="flex items-center gap-2">

            <Link
              to="/merchant/gigs/create"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition shadow-sm"
            >
              <Plus size={16} />
              <span>Buat Layanan Baru</span>
            </Link>
          </div>
        </div>
      </div>

      {/* JIKA ASSOCIATE: Tampilkan Banner Info Pembatasan */}
      {userRole === "ASSOCIATE" && (
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Akses Operasional Terbatas</h4>
            <p className="text-[11px] text-slate-500">
              Menu keuangan, pendapatan bersih, dan penarikan saldo disembunyikan khusus untuk akun associate.
            </p>
          </div>
        </div>
      )}

      {/* STAT CARDS (Conditional berdasarkan role) */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${userRole === "OWNER" ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-4`}>
        {/* Card Pendapatan (Hanya muncul jika OWNER) */}
        {userRole === "OWNER" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Pendapatan</span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600"><Wallet size={18} /></div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{formatRupiah(12500000)}</h3>
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                <ArrowUpRight size={12} /><span>+12.5% dari bulan lalu</span>
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pesanan Aktif</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600"><ShoppingBag size={18} /></div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">8 Orderan</h3>
            <p className="text-[11px] text-slate-400 mt-1">2 pesanan butuh konfirmasi</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Layanan Aktif</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600"><LayoutGrid size={18} /></div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">5 Gig</h3>
            <p className="text-[11px] text-slate-400 mt-1">1 dalam peninjauan</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Rating Toko</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500"><Star size={18} /></div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">4.9 / 5.0</h3>
            <p className="text-[11px] text-slate-400 mt-1">Dari 38 ulasan klien</p>
          </div>
        </div>
      </div>

      {/* GRID BAWAH: Tabel Pesanan & Dompet (Dompet disembunyikan jika Associate) */}
      <div className={`grid grid-cols-1 ${userRole === "OWNER" ? "lg:grid-cols-3" : "lg:grid-cols-1"} gap-6`}>
        <div className={`${userRole === "OWNER" ? "lg:col-span-2" : "col-span-1"} bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Pesanan Perlu Diproses</h2>
              <p className="text-xs text-slate-400">Daftar transaksi yang sedang atau siap kamu kerjakan.</p>
            </div>
            <Link to="/merchant/orders" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              <span>Lihat Semua</span><ChevronRight size={14} />
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
                      <div className="font-bold text-slate-800">{order.client}</div>
                      <div className="text-[11px] text-slate-500">
                        {order.service} • <span className="font-mono text-slate-400">{order.id}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 font-bold text-slate-900">{formatRupiah(order.price)}</td>
                    <td className="py-3 px-2 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock size={13} className="text-slate-400" /><span>{order.deadline}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 font-bold text-[10px]">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card Dompet Merchant (Hanya muncul jika OWNER) */}
        {userRole === "OWNER" && (
          <div className="space-y-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 space-y-5 shadow-lg border border-slate-800">
              <div className="flex items-center justify-between relative z-10">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Dompet Merchant
                </span>
              </div>
              <div className="relative z-10 space-y-1">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Saldo Tersedia</p>
                <h3 className="text-2xl font-black font-mono tracking-tight text-white">
                  {formatRupiah(availableBalance)}
                </h3>
              </div>
              <div className="relative z-10 pt-1">
                <button
                  onClick={() => setIsWithdrawModalOpen(true)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Tarik Dana Sekarang</span>
                  <ArrowUpRight size={15} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL PENARIKAN (Dipindahkan keluar card agar merender dengan benar di atas layer utama) */}
      <WithdrawalModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        availableBalance={availableBalance}
        savedBankAccount={savedBankAccount}
        onSuccessWithdraw={(amount) => {
          setAvailableBalance((prev) => prev - amount);
          alert(`Berhasil mengajukan penarikan saldo sebesar ${formatRupiah(amount)}!`);
        }}
      />
    </div>
  );
}