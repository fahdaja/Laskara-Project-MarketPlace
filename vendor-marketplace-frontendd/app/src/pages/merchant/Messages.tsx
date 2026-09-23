import React, { useState } from "react";
import {
  Search,
  Send,
  Paperclip,
  CheckCheck,
  Tag,
  Clock,
  User,
  MoreVertical,
  PlusCircle,
} from "lucide-react";
import Breadcrumb from "../../components/common/BreadCrumb";
import CreateOfferModal from "~/src/components/merchant/CreateOfferModal";
import { initialChat } from "~/src/data/mockChats";
import type { Chat } from "../../types/Messages"
import { initialMessage } from "~/src/data/mockChats";
import type { Message } from "../../types/Messages";

export default function Messages(): React.JSX.Element {
  // Mock Data Chat
  const [chats] = useState<Chat[]>(initialChat);

  const handleSendOffer = (offerData: {
  serviceTitle: string;
  description: string;
  price: number;
  format: string;
}) => {
  const newOfferMessage: Message = {
    id: `msg-${Date.now()}`,
    sender: "merchant",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    offer: {
      serviceTitle: offerData.serviceTitle,
      price: offerData.price,
      format: offerData.format,
      status: "PENDING",
    },
  };

  activeChat.messages.push(newOfferMessage);
};

  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string>("1");
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "offers">("all");
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  // Helper Format Rupiah
  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  };

  // Filter Chat List
  const filteredChats = chats.filter((chat) => {
    const matchesSearch = chat.clientName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (activeFilter === "unread") return matchesSearch && chat.unreadCount > 0;
    if (activeFilter === "offers") return matchesSearch && chat.hasOffer;
    return matchesSearch;
  });

  return (
    <div className="space-y-4 h-[calc(100vh-6rem)] flex flex-col">
      {/* Breadcrumb & Title */}
      <div>
        <Breadcrumb />
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Pesan & Penawaran</h1>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* KOLOM KIRI: Daftar Percakapan */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50">
          {/* Search Bar & Filter Tabs */}
          <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Cari pesan atau nama klien..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeFilter === "all"
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setActiveFilter("unread")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeFilter === "unread"
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Belum Dibaca
              </button>
              <button
                onClick={() => setActiveFilter("offers")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeFilter === "offers"
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Penawaran
              </button>
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`p-4 flex items-start gap-3 cursor-pointer transition ${
                  activeChatId === chat.id
                    ? "bg-blue-50/60 border-l-4 border-blue-600"
                    : "hover:bg-slate-100/60 bg-white"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  <User size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {chat.clientName}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {chat.lastTime}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {chat.lastMessage}
                  </p>

                  {/* Badges */}
                  <div className="flex items-center gap-1.5 mt-2">
                    {chat.unreadCount > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {chat.unreadCount}
                      </span>
                    )}
                    {chat.hasOffer && (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Tag size={10} />
                        <span>Penawaran</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KOLOM KANAN: Ruang Percakapan Utama */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Header Chat */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                <User size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {activeChat.clientName}
                </h3>
                <span className="text-[11px] text-emerald-600 font-medium">
                  • Online
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setIsOfferModalOpen(true)} className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold flex items-center gap-1.5 transition">
                <PlusCircle size={14} />
                <span>Buat Penawaran</span>
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                <MoreVertical size={18} />
              </button>
              <CreateOfferModal
  isOpen={isOfferModalOpen}
  onClose={() => setIsOfferModalOpen(false)}
  onSubmitOffer={handleSendOffer}
/>
            </div>
          </div>

          {/* Bubble Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/30">
            {activeChat.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "merchant" ? "items-end" : "items-start"
                }`}
              >
                {/* Text Message */}
                {msg.text && (
                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      msg.sender === "merchant"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <div
                      className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${
                        msg.sender === "merchant"
                          ? "text-blue-200"
                          : "text-slate-400"
                      }`}
                    >
                      <span>{msg.time}</span>
                      {msg.sender === "merchant" && <CheckCheck size={12} />}
                    </div>
                  </div>
                )}

                {/* Offer Card (Jika ada penawaran khusus) */}
                {msg.offer && (
                  <div className="w-full max-w-sm bg-white rounded-2xl border-2 border-blue-500 p-4 space-y-3 shadow-md my-1">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-[10px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Penawaran Khusus
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        {msg.offer.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {msg.offer.serviceTitle}
                      </h4>
                      <p className="text-lg font-bold text-blue-600 mt-1">
                        {formatRupiah(msg.offer.price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                      <Clock size={14} className="text-slate-400" />
                      <span>Estimasi Waktu: <b>{msg.offer.format}</b></span>
                    </div>

                    <button
                      disabled
                      className="w-full py-2 bg-slate-100 text-slate-500 font-semibold text-xs rounded-xl cursor-not-allowed"
                    >
                      Menunggu Tanggapan Klien
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input Chat Bottom */}
          <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition">
              <Paperclip size={18} />
            </button>

            <input
              type="text"
              placeholder="Tulis pesan untuk klien..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 rounded-xl text-xs outline-none border border-slate-200 focus:border-blue-500 focus:bg-white transition"
            />

            <button className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-sm">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}