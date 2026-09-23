import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Rocket,
  Clock,
  MessageSquareWarning,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import Breadcrumb from "~/src/components/common/BreadCrumb";
import { useNavigate } from "react-router";
import type { GigsItem } from "../../types/Gigs";
import { formatRupiah } from "~/src/utils/formatRupiah";
import { initialGigs } from "~/src/data/mockGigs";

export default function Gigs(): React.JSX.Element {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("Semua");

  const [gigs, setGigs] = useState<GigsItem[]>(initialGigs);

  const [selectedGigToDelete, setSelectedGigToDelete] = useState<GigsItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const tabs = ["Semua", "Menunggu", "Disetujui", "Ditolak"];

  
  const filteredGigs = gigs.filter((gig) => {
    if (activeTab === "Menunggu") return gig.status === "MENUNGGU";
    if (activeTab === "Disetujui") return gig.status === "AKTIF";
    if (activeTab === "Ditolak") return gig.status === "DITOLAK";
    return true;
  });

  const confirmDelete = () => {
    if (!selectedGigToDelete) return;
    setIsDeleting(true);

    setTimeout(() => {
      setGigs((prev) => prev.filter((item) => item.id !== selectedGigToDelete.id));
      setIsDeleting(false);
      setSelectedGigToDelete(null);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12">
      <Breadcrumb />

      {/* Header Halaman & Tombol Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Manajemen Layanan</h1>

        <button
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition shadow-sm"
          onClick={() => navigate("/merchant/gigs/create")}
        >
          <Plus size={18} />
          <span>Buat Layanan Baru</span>
        </button>
      </div>

      {/* Tab Navigasi Filter */}
      <div className="border-b border-slate-200">
        <div className="flex gap-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === tab
                  ? "text-blue-600 font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Card Layanan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGigs.map((service) => (
          <div
            key={service.id}
            onClick={() => navigate(`/merchant/gigs/${service.id}`)}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition cursor-pointer group"
          >
            <div>
              {/* Image & Status Badge */}
              <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />

                {/* Badge Status */}
                {service.status === "AKTIF" && (
                  <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md uppercase">
                    AKTIF
                  </span>
                )}
                {service.status === "MENUNGGU" && (
                  <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md uppercase">
                    MENUNGGU PERSETUJUAN
                  </span>
                )}
                {service.status === "DITOLAK" && (
                  <span className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md uppercase">
                    DITOLAK
                  </span>
                )}
              </div>

              {/* Body Content */}
              <div className="p-4 space-y-3">
                <h3 className="font-bold text-slate-900 text-base line-clamp-1">
                  {service.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {service.description}
                </p>

                {/* Price & Action Buttons */}
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-blue-600 text-base">
                    {formatRupiah(service.price)}
                  </span>

                  <div className="flex items-center gap-1">
                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/merchant/gigs/${service.id}`);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                      title="Edit Layanan"
                    >
                      <Edit2 size={16} />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGigToDelete(service);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Hapus Layanan"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Per Status */}
            <div className="p-4 pt-0">
              {service.status === "AKTIF" && (
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="w-full py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
                >
                  <Rocket size={14} />
                  <span>BOOST LAYANAN</span>
                </button>
              )}

              {service.status === "MENUNGGU" && (
                <div className="w-full py-2 px-3 rounded-xl bg-amber-50 text-amber-700 text-xs flex items-center justify-center gap-2 font-medium">
                  <Clock size={14} />
                  <span>Menunggu review</span>
                </div>
              )}

              {service.status === "DITOLAK" && (
                <div className="space-y-2">
                  <button
                    type="button"
                    className="text-xs text-rose-600 font-semibold flex items-center gap-1.5 hover:underline"
                  >
                    <MessageSquareWarning size={14} />
                    <span>LIHAT CATATAN</span>
                  </button>

                  {service.rejectionReason && (
                    <p className="text-[11px] text-rose-500 italic bg-rose-50 p-2.5 rounded-lg leading-snug">
                      "{service.rejectionReason}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

      </div>

      {/* MODAL KONFIRMASI HAPUS GIG */}
      {selectedGigToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Hapus Layanan Ini?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Kamu yakin ingin menghapus <strong>"{selectedGigToDelete.title}"</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedGigToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white text-xs font-semibold shadow-xs transition"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}