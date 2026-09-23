import React, { useState } from "react";
import {
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  MessageSquare,
  ChevronRight,
  User,
  X,
  XCircle,
} from "lucide-react";
import Breadcrumb from "../../components/common/BreadCrumb";
import { Link } from "react-router";
import type { OrderItem } from "~/src/types/Order";
import { initialOrderList } from "~/src/data/mockOrders";
import { formatRupiah } from "~/src/utils/formatRupiah";
import { mapTabToOrderStatus } from "~/src/helper/orderHelper";

export default function Orders(): React.JSX.Element {
  // Mock Data Order
  const [orders, setOrders] = useState<OrderItem[]>(initialOrderList);

  const [selectedOrderForDecline, setSelectedOrderForDecline] = useState<OrderItem | null>(null);
  const [declineReason, setDeclineReason] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<OrderItem | null>(null);
  const [deliveryFile, setDeliveryFile] = useState<File | null>(null);

  const tabs = ["Semua", "Baru", "Diproses", "Menunggu Review", "Selesai", "Ditolak"];
  const targetStatus = mapTabToOrderStatus(activeTab)
  const filteredOrders = orders.filter((orders) => {
    const matchesSearch =
    orders.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    orders.id.toLowerCase().includes(searchQuery.toLocaleLowerCase()) ||
    orders.serviceTitle.toLowerCase().includes(searchQuery.toLocaleLowerCase())
    if(!targetStatus) return matchesSearch
    return matchesSearch && orders.status === targetStatus
  })

  // Action Handlers Decline Order
  const handleConfirmDecline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForDecline || !declineReason) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrderForDecline.id
          ? { ...o, status: "REJECTED" }
          : o
      )
    );

    setSelectedOrderForDecline(null);
    setDeclineReason("");
  };

  // Action Handlers Accept Order
  const handleAcceptOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "IN_PROGRESS" } : o))
    );
  };

  // Action Handlers Submit Delivery
  const handleSubmitDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForDelivery) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrderForDelivery.id
          ? {
              ...o,
              status: "IN_REVIEW",
              deliveredFiles: [deliveryFile?.name || "hasil_pekerjaan_final.zip"],
            }
          : o
      )
    );

    setSelectedOrderForDelivery(null);
    setDeliveryFile(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Breadcrumb */}
      <div>
        <Breadcrumb />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Pesanan Masuk</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola instruksi proyek, pantau tenggat waktu, dan kirimkan hasil pekerjaan ke klien.
            </p>
          </div>
        </div>
      </div>

      {/* Ringkasan Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <AlertCircle size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400">Butuh Konfirmasi</p>
            <p className="text-lg font-bold text-slate-900">
              {orders.filter((o) => o.status === "PENDING").length} Order
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400">Sedang Dikerjakan</p>
            <p className="text-lg font-bold text-slate-900">
              {orders.filter((o) => o.status === "IN_PROGRESS").length} Order
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <FileText size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400">Menunggu Review</p>
            <p className="text-lg font-bold text-slate-900">
              {orders.filter((o) => o.status === "IN_REVIEW").length} Order
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400">Selesai</p>
            <p className="text-lg font-bold text-slate-900">
              {orders.filter((o) => o.status === "COMPLETED").length} Order
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
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

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Cari ID order, nama, atau jasa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Daftar Order Cards */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
            <FileText size={32} className="mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">Tidak ada pesanan ditemukan</p>
            <p className="text-xs">Coba ubah kata kunci pencarian atau tab filter status kamu.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm hover:border-slate-300 transition"
            >
              {/* Header Card Order */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                    {order.id}
                  </span>
                  <span className="text-xs text-slate-400">• Dipesan tanggal {order.orderDate}</span>
                </div>

                {/* Status Badges */}
                <div>
                  {order.status === "PENDING" && (
                    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 font-bold text-[10px] uppercase">
                      Menunggu Konfirmasi
                    </span>
                  )}
                  {order.status === "IN_PROGRESS" && (
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-bold text-[10px] uppercase">
                      Dalam Pengerjaan
                    </span>
                  )}
                  {order.status === "IN_REVIEW" && (
                    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 font-bold text-[10px] uppercase">
                      Menunggu Review Klien
                    </span>
                  )}
                  {order.status === "COMPLETED" && (
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[10px] uppercase">
                      Selesai
                    </span>
                  )}
                  {/* Badge untuk Batal/Ditolak */}
                  {order.status === "REJECTED" && (
                    <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 font-bold text-[10px] uppercase">
                      Ditolak
                    </span>
                  )}
                </div>
              </div>

              {/* Main Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Info Klien & Layanan */}
                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                      <User size={12} />
                    </div>
                    <span className="text-xs font-bold text-slate-800">{order.clientName}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{order.serviceTitle}</h3>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold text-[10px]">
                      Paket {order.packageTier}
                    </span>
                    <span className="font-bold text-blue-600">{formatRupiah(order.price)}</span>
                  </div>

                  {order.notes && (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                      <span className="font-semibold text-slate-700">Catatan Klien:</span> "{order.notes}"
                    </p>
                  )}
                </div>

                {/* Info Deadline & Action Buttons */}
                <div className="flex flex-col justify-between items-start md:items-end gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                  <div className="text-left md:text-right space-y-0.5">
                    <span className="text-[11px] font-medium text-slate-400 block">Tenggat Waktu</span>
                    <span className="text-xs font-bold text-slate-800 flex items-center md:justify-end gap-1">
                      <Clock size={13} className="text-slate-400" />
                      {order.deadline}
                    </span>
                  </div>

                  {/* Actions per Status */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end pt-2">
                    {/* 3. Integration Direct Link WhatsApp ke Client */}
                    {order.clientPhone && (
                      <a
                        href={`https://wa.me/${order.clientPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `Halo ${order.clientName}, saya terkait pesanan${order.id}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <MessageSquare size={14} className="text-emerald-600" />
                        <span className="hidden sm:inline">Chat WA</span>
                      </a>
                    )}

                    {/* Tombol Lihat Detail */}
                    <Link
                      to={`/merchant/orders/${order.id}`}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition shadow-sm"
                    >
                      <span>Lihat Detail</span>
                      <ChevronRight size={14} />
                    </Link>

                    {/* Tombol Aksi Dinamis Berdasarkan Status */}
                    {order.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => setSelectedOrderForDecline(order)}
                          className="px-3.5 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition"
                        >
                          Tolak
                        </button>

                        <button
                          onClick={() => handleAcceptOrder(order.id)}
                          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-sm"
                        >
                          Terima & Kerjakan
                        </button>
                      </>
                    )}

                    {order.status === "IN_PROGRESS" && (
                      <button
                        onClick={() => setSelectedOrderForDelivery(order)}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                      >
                        <Upload size={14} />
                        <span>Kirim Hasil Kerja</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL UNGGAH HASIL PEKERJAAN */}
      {selectedOrderForDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Kirim Hasil Pekerjaan</h3>
                <p className="text-xs text-slate-500">
                  {selectedOrderForDelivery.id} • {selectedOrderForDelivery.clientName}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForDelivery(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitDelivery} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Unggah File Final (ZIP, RAR, PDF, MP4)
                </label>
                <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 bg-slate-50/50 rounded-2xl p-6 text-center cursor-pointer relative transition">
                  <input
                    type="file"
                    required
                    onChange={(e) => setDeliveryFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload size={24} className="mx-auto text-blue-600 mb-2" />
                  <p className="text-xs font-semibold text-slate-700">
                    {deliveryFile ? deliveryFile.name : "Klik atau seret file hasil ke sini"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Maksimal ukuran file: 100MB</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Pesan Penyelesaian untuk Klien
                </label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan catatan penyelesaian pekerjaan atau instruksi cara menggunakan hasil proyek..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-500 transition resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForDelivery(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
                >
                  Kirim & Minta Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TOLAK ORDER */}
      {selectedOrderForDecline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <AlertCircle size={18} />
                <span>Tolak Pesanan Masuk</span>
              </div>
              <button
                onClick={() => setSelectedOrderForDecline(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmDecline} className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah kamu yakin ingin menolak pesanan <span className="font-bold text-slate-900">{selectedOrderForDecline.id}</span> dari <span className="font-bold text-slate-900">{selectedOrderForDecline.clientName}</span>?
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Alasan Penolakan <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-500 bg-white transition"
                >
                  <option value="">-- Pilih Alasan --</option>
                  <option value="Jadwal / Kuota pengerjaan penuh">Jadwal / Kuota pengerjaan penuh</option>
                  <option value="Brief / Requirement tidak sesuai spesifikasi">Brief / Requirement tidak sesuai spesifikasi</option>
                  <option value="Kebutuhan waktu terlalu mendesak">Kebutuhan waktu terlalu mendesak</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForDecline(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition"
                >
                  Ya, Tolak Pesanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}