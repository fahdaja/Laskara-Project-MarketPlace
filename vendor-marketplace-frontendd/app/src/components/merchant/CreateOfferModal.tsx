import React, { useState } from "react";
import { X, Tag, Clock, DollarSign, FileText } from "lucide-react";

interface ServiceOption {
  id: string;
  title: string;
  defaultPrice: number;
}

interface CreateOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitOffer: (offerData: {
    serviceTitle: string;
    description: string;
    price: number;
    format: string;
  }) => void;
}

export default function CreateOfferModal({
  isOpen,
  onClose,
  onSubmitOffer,
}: CreateOfferModalProps): React.JSX.Element | null {
  if (!isOpen) return null;

  // Mock Daftar Layanan Merchant
  const myServices: ServiceOption[] = [
    { id: "1", title: "Desain Logo Minimalis & Brand Guidelines", defaultPrice: 150000 },
    { id: "2", title: "UI/UX Redesign Landing Page Mobile", defaultPrice: 450000 },
    { id: "3", title: "Video Motion Graphic 30 Detik", defaultPrice: 750000 },
  ];

  const [deliveryValue, setDeliveryValue] = useState<number>(3);
  const [deliveryUnit, setDeliveryUnit] = useState<"Hari" | "Jam">("Hari");
  const [selectedServiceId, setSelectedServiceId] = useState<string>(myServices[0].id);
  const [customTitle, setCustomTitle] = useState<string>(myServices[0].title);
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<number | "">(myServices[0].defaultPrice);
  const formattedDeliveryTime = `${deliveryValue} ${deliveryUnit} Kerja`;

  // Handler Ganti Pilih Layanan
  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const service = myServices.find((s) => s.id === serviceId);
    if (service) {
      setCustomTitle(service.title);
      setPrice(service.defaultPrice);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !customTitle) return;

    onSubmitOffer({
      serviceTitle: customTitle,
      description,
      price: Number(price),
      format: formattedDeliveryTime,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Tag size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Buat Penawaran Khusus</h3>
              <p className="text-xs text-slate-500">Kirimkan penawaran harga khusus langsung ke klien.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Pilih Layanan */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Pilih Layanan / Gig
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => handleServiceSelect(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-500 bg-white transition"
            >
              {myServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
            </select>
          </div>

          {/* Judul Penawaran (Bisa Kustom) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Judul Penawaran
            </label>
            <input
              type="text"
              required
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Judul paket/layanan penawaran..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Deskripsi Singkat Penawaran */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Cakupan Pekerjaan / Catatan
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan apa saja yang didapatkan klien dalam penawaran ini..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-500 transition resize-none"
            />
          </div>

          {/* Grid Harga & Estimasi Waktu */}
          <div className="grid grid-cols-2 gap-4">
            {/* Input Harga */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Total Harga (IDR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                  Rp
                </span>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Input Durasi Pengerjaan */}
            <div className="space-y-1.5">
  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
    Waktu Pengerjaan
  </label>
  <div className="flex gap-2">
    {/* Input Angka (Custom) */}
    <input
      type="number"
      min={1}
      required
      value={deliveryValue}
      onChange={(e) => setDeliveryValue(Math.max(1, Number(e.target.value)))}
      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-blue-500 transition"
      placeholder="Durasi"
    />

    {/* Satuan Waktu (Hari / Jam) */}
    <select
      value={deliveryUnit}
      onChange={(e) => setDeliveryUnit(e.target.value as "Hari" | "Jam")}
      className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-blue-500 bg-white transition"
    >
      <option value="Hari">Hari</option>
      <option value="Jam">Jam</option>
    </select>
  </div>
</div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
            >
              Kirim Penawaran
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}