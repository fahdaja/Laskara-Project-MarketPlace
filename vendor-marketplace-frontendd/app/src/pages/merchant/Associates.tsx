import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Mail,
  ShieldCheck,
  ShieldAlert,
  Search,
  MoreVertical,
  CheckCircle2,
  Clock,
  X,
  Trash2,
  User,
} from "lucide-react";
import Breadcrumb from "../../components/common/BreadCrumb";

interface AssociateMember {
  id: string;
  name: string;
  email: string;
  role: "FULL_ACCESS" | "LIMITED_ACCESS";
  status: "ACTIVE" | "PENDING";
  joinedDate: string;
}

export default function Associates(): React.JSX.Element {
  // Mock Data Anggota Tim / Associate
  const [associates, setAssociates] = useState<AssociateMember[]>([
    {
      id: "ASC-001",
      name: "Gavin Aga",
      email: "gavin.aga@example.com",
      role: "FULL_ACCESS",
      status: "ACTIVE",
      joinedDate: "15 Jan 2026",
    },
    {
      id: "ASC-002",
      name: "Abdullah",
      email: "abdullah@example.com",
      role: "LIMITED_ACCESS",
      status: "ACTIVE",
      joinedDate: "20 Feb 2026",
    },
    {
      id: "ASC-003",
      name: "Siti Alqia",
      email: "alqia.uiux@example.com",
      role: "LIMITED_ACCESS",
      status: "PENDING",
      joinedDate: "Undangan Dikirim",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [inviteRole, setInviteRole] = useState<"FULL_ACCESS" | "LIMITED_ACCESS">(
    "LIMITED_ACCESS"
  );

  // Filter List
  const filteredAssociates = associates.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const newMember: AssociateMember = {
      id: `ASC-00${associates.length + 1}`,
      name: inviteEmail.split("@")[0], // Fallback nama dari email
      email: inviteEmail,
      role: inviteRole,
      status: "PENDING",
      joinedDate: "Undangan Dikirim",
    };

    setAssociates((prev) => [...prev, newMember]);
    setIsInviteModalOpen(false);
    setInviteEmail("");
  };

  const handleDeleteMember = (id: string) => {
    if (confirm("Apakah kamu yakin ingin menghapus associate ini dari toko?")) {
      setAssociates((prev) => prev.filter((m) => m.id !== id));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Breadcrumb */}
      <div>
        <Breadcrumb />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Associate Toko</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola anggota tim atau staf toko untuk membantu operasional pengerjaan pesanan dan pesan.
            </p>
          </div>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition shadow-sm"
          >
            <UserPlus size={16} />
            <span>Undang Associate Baru</span>
          </button>
        </div>
      </div>

      {/* Grid Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Users size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400">Total Tim Toko</p>
            <p className="text-xl font-bold text-slate-900">{associates.length} Orang</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400">Akses Penuh (Full)</p>
            <p className="text-xl font-bold text-slate-900">
              {associates.filter((a) => a.role === "FULL_ACCESS").length} Anggota
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400">Undangan Pending</p>
            <p className="text-xl font-bold text-slate-900">
              {associates.filter((a) => a.status === "PENDING").length} Orang
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau email anggota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Tabel Associate Member */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Nama & Email</th>
                <th className="py-3.5 px-4">Tingkat Hak Akses</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Tanggal Bergabung</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filteredAssociates.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/50 transition">
                  {/* Nama & Email */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        <User size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{member.name}</p>
                        <p className="text-[11px] text-slate-400">{member.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Hak Akses */}
                  <td className="py-3.5 px-4">
                    {member.role === "FULL_ACCESS" ? (
                      <span className="inline-flex items-center gap-1 font-bold text-[10px] text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                        <ShieldCheck size={12} />
                        <span>FULL ACCESS</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-[10px] text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                        <ShieldAlert size={12} />
                        <span>LIMITED (OPERATIONAL)</span>
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {member.status === "ACTIVE" ? (
                      <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 font-bold text-[10px]">
                        AKTIF
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-600 font-bold text-[10px]">
                        MENUNGGU KONFIRMASI
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-slate-500">{member.joinedDate}</td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Hapus Associate"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL UNDANG ASSOCIATE */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Undang Associate Baru</h3>
                  <p className="text-xs text-slate-500">Kirimkan undangan bergabung ke tim toko kamu.</p>
                </div>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
              {/* Input Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Email Anggota Tim <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Pilih Hak Akses */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Tingkat Hak Akses (Role)
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(e.target.value as "FULL_ACCESS" | "LIMITED_ACCESS")
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-500 bg-white transition"
                >
                  <option value="LIMITED_ACCESS">
                    Limited Access (Order, Chat, & Deliverables saja)
                  </option>
                  <option value="FULL_ACCESS">
                    Full Access (Kelola Layanan, Order, & Chat)
                  </option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  *Catatan: Associate tidak memiliki akses ke penarikan saldo/dompet toko.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
                >
                  Kirim Undangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}