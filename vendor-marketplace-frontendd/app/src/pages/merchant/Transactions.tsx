import React, { useState } from "react";
import { Link } from "react-router";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Search,
  Clock,
  Building2,
  X,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import Breadcrumb from "../../components/common/BreadCrumb";

interface TransactionItem {
  id: string;
  type: "INCOME" | "WITHDRAWAL";
  title: string;
  orderId?: string;
  date: string;
  amount: number;
  status: "COMPLETED" | "PENDING" | "FAILED";
  bankAccount?: string;
}

export default function Transactions(): React.JSX.Element {
  // 1. STATE SALDO INTERAKTIF
  const [availableBalance, setAvailableBalance] = useState<number>(4250000);
  const [pendingBalance] = useState<number>(250000);
  const [totalWithdrawn, setTotalWithdrawn] = useState<number>(3500000);

  // MOCK DATA REKENING TERKUNCI (Diambil dari Settings/Pengaturan Toko)
  const savedBankAccount = {
    bankName: "BCA",
    accountNumber: "8829103912",
    accountHolder: "M. Fahd Al Bantani",
    isVerified: true,
  };

  // 2. MOCK DATA TRANSAKSI (STATEFUL)
  const [transactions, setTransactions] = useState<TransactionItem[]>([
    {
      id: "TRX-88291",
      type: "INCOME",
      title: "Pembayaran Order - UI/UX Landing Page",
      orderId: "ORD-9481",
      date: "21 Sep 2026, 14:20 WIB",
      amount: 450000,
      status: "COMPLETED",
    },
    {
      id: "TRX-88200",
      type: "WITHDRAWAL",
      title: "Penarikan Saldo ke Bank BCA",
      bankAccount: "BCA • **** 3912",
      date: "19 Sep 2026, 09:15 WIB",
      amount: 2000000,
      status: "COMPLETED",
    },
    {
      id: "TRX-88150",
      type: "INCOME",
      title: "Pembayaran Order - Desain Logo Minimalis",
      orderId: "ORD-9482",
      date: "18 Sep 2026, 16:45 WIB",
      amount: 150000,
      status: "COMPLETED",
    },
    {
      id: "TRX-88112",
      type: "INCOME",
      title: "Pembayaran Order - Motion Graphic 30s",
      orderId: "ORD-9475",
      date: "17 Sep 2026, 11:30 WIB",
      amount: 250000,
      status: "PENDING",
    },
    {
      id: "TRX-88090",
      type: "WITHDRAWAL",
      title: "Penarikan Saldo ke Bank Mandiri",
      bankAccount: "Mandiri • **** 4102",
      date: "10 Sep 2026, 10:00 WIB",
      amount: 1500000,
      status: "COMPLETED",
    },
  ]);

  // STATES FILTER & MODAL
  const [activeTab, setActiveTab] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);
  
  // STATE MODAL TARIK DANA
  const [withdrawAmount, setWithdrawAmount] = useState<number | "">("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Format Rupiah Helper
  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  };

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

      setIsLoading(false);
      setIsWithdrawModalOpen(false);
      setWithdrawAmount("");
    }, 1000);
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
            onClick={() => {
              setErrorMessage("");
              setIsWithdrawModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition shadow-sm"
          >
            <Wallet size={16} />
            <span>Tarik Dana Saldo</span>
          </button>
        </div>
      </div>

      {/* Grid Stat Saldo & Wallet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card Saldo Siap Ditarik */}
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

        {/* Card Saldo Pending (Escrow) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Saldo Tertahan (Escrow)</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock size={18} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{formatRupiah(pendingBalance)}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Dana pesanan yang sedang berjalan
            </p>
          </div>
        </div>

        {/* Card Total Penarikan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Pernah Ditarik</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{formatRupiah(totalWithdrawn)}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Total riwayat transaksi penarikan
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Tabs Filter */}
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === tab
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Input */}
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
                <th className="py-3.5 px-4 text-right">Aksi</th>
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

                  <td className="py-3.5 px-4 text-right">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition" title="Unduh Bukti">
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TARIK DANA - LOCKED REKENING */}
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
              {/* Alert Error Validation */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                  {errorMessage}
                </div>
              )}

              {/* CARD INFO REKENING BANK TERKUNCI */}
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
                  <span></span>
                  <ShieldCheck size={18} className="text-emerald-500 flex-shrink-0"/>
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