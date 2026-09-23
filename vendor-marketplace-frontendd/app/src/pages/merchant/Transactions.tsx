import React, { useState } from "react";
import { Link } from "react-router";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Clock,
  ShieldCheck,
} from "lucide-react";
import Breadcrumb from "../../components/common/BreadCrumb";
import WithdrawalModal from "../../components/merchant/WithdrawlModal"; // <-- Import Modal Terpisah
import { initialTransaction } from "~/src/data/mockTransactions";
import type { TransactionItem } from "~/src/types/Transactions";
import { formatRupiah } from "~/src/utils/formatRupiah";

export default function Transactions(): React.JSX.Element {
  const [availableBalance, setAvailableBalance] = useState<number>(4250000);
  const [pendingBalance] = useState<number>(250000);
  const [totalWithdrawn, setTotalWithdrawn] = useState<number>(3500000);

  // MOCK DATA REKENING TERKUNCI
  const savedBankAccount = {
    bankName: "BCA",
    accountNumber: "8829103912",
    accountHolder: "M. Fahd Al Bantani",
  };

  const [transactions, setTransactions] = useState<TransactionItem[]>(initialTransaction);
  const [activeTab, setActiveTab] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);


  const tabs = ["Semua", "Pemasukan", "Penarikan", "Pending"];

  // Filter Transactions
  const filteredTransactions = transactions.filter((trx) => {
    const matchesSearch =
      trx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trx.orderId && trx.orderId.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeTab === "Pemasukan") return matchesSearch && trx.type === "INCOME";
    if (activeTab === "Penarikan") return matchesSearch && trx.type === "WITHDRAWAL";
    if (activeTab === "Pending") return matchesSearch && trx.status === "PENDING";
    return matchesSearch;
  });

  // HANDLE SUKSES PENARIKAN (Dipanggil dari WithdrawalModal setelah PIN benar)
  const handleSuccessfulWithdrawal = (amountNum: number) => {
    // 1. Potong Saldo Siap Ditarik & Tambah Total Penarikan
    setAvailableBalance((prev) => prev - amountNum);
    setTotalWithdrawn((prev) => prev + amountNum);

    // 2. Tambah Transaksi Penarikan Baru ke Tabel
    const newTrx: TransactionItem = {
      id: `TRX-${Math.floor(10000 + Math.random() * 90000)}`,
      type: "WITHDRAWAL",
      title: `Penarikan Saldo ke Bank ${savedBankAccount.bankName}`,
      bankAccount: `${savedBankAccount.bankName} • **** ${savedBankAccount.accountNumber.slice(-4)}`,
      date: "Baru Saja",
      amount: amountNum,
      status: "PENDING",
    };

    setTransactions([newTrx, ...transactions]);
    alert(`Berhasil mengajukan penarikan saldo sebesar ${formatRupiah(amountNum)}!`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Breadcrumb */}
      <div>
        <Breadcrumb />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Riwayat Transaksi</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau arus kas pendapatan, saldo tertahan escrow, dan riwayat penarikan dana ke rekening bank.
            </p>
          </div>

          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition shadow-sm cursor-pointer"
          >
            <Wallet size={16} />
            <span>Tarik Dana Saldo</span>
          </button>
        </div>
      </div>

      {/* Grid Stat Saldo & Wallet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Saldo Siap Ditarik</span>
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <Wallet size={18} className="text-white" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold">{formatRupiah(availableBalance)}</p>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>Dana aman tersimpan di platform</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Saldo Tertahan (Escrow)</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock size={18} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{formatRupiah(pendingBalance)}</p>
            <p className="text-[11px] text-slate-400 mt-1">Dana pesanan yang sedang berjalan</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Pernah Ditarik</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{formatRupiah(totalWithdrawn)}</p>
            <p className="text-[11px] text-slate-400 mt-1">Total riwayat transaksi penarikan</p>
          </div>
        </div>
      </div>

      {/* Toolbar Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeTab === tab
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari TRX ID, Order ID, atau deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Tabel Transaksi */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Transaksi & ID</th>
                <th className="py-3.5 px-4">Tipe</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Nominal</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filteredTransactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-4 space-y-0.5">
                    <p className="font-bold text-slate-800">{trx.title}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {trx.id} {trx.orderId && `• ${trx.orderId}`} {trx.bankAccount && `(${trx.bankAccount})`}
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    {trx.type === "INCOME" ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px] bg-emerald-50 px-2.5 py-1 rounded-md">
                        <ArrowDownLeft size={13} />
                        <span>PEMASUKAN</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-600 font-bold text-[11px] bg-slate-100 px-2.5 py-1 rounded-md">
                        <ArrowUpRight size={13} />
                        <span>PENARIKAN</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">{trx.date}</td>

                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <span className={trx.type === "INCOME" ? "text-emerald-600" : "text-slate-900"}>
                      {trx.type === "INCOME" ? "+" : "-"}
                      {formatRupiah(trx.amount)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {trx.status === "COMPLETED" && (
                      <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 font-bold text-[10px]">
                        BERHASIL
                      </span>
                    )}
                    {trx.status === "PENDING" && (
                      <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-600 font-bold text-[10px]">
                        PROSES
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PEMANGGILAN KOMPONEN REUSABLE WithdrawalModal */}
      <WithdrawalModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        availableBalance={availableBalance}
        savedBankAccount={savedBankAccount}
        onSuccessWithdraw={handleSuccessfulWithdrawal}
      />
    </div>
  );
}