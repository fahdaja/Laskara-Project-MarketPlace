import React from "react";
import Navbar from "../components/common/Navbar";
import HeroCreativeStudio from "../assets/images/hero-creative-studio.png";
import VendorCreativeArt from "../assets/images/vendor/creative-art.png";
import VendorVideoMakers from "../assets/images/vendor/videomakers.png";
import VendorEventPro from "../assets/images/vendor/eventpro.png";
import {
  Camera,
  Cpu,
  Calendar,
  Sparkles,
  Shirt,
  UtensilsCrossed,
  Search,
} from "lucide-react";

export default function LandingPage() {
  const categories = [
    {
      name: "Creative Studio",
      icon: Camera,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      name: "Tech Digital",
      icon: Cpu,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      name: "Event Essentials",
      icon: Calendar,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      name: "Talent & Performers",
      icon: Sparkles,
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
    {
      name: "Merch & Apparel",
      icon: Shirt,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      name: "Consumptions",
      icon: UtensilsCrossed,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];
  return (
    <div className="w-full">
      {/* 1. Hero Section */}
      <section className="w-full bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 items-center gap-12">
          {/* Kolom Kiri: Teks & Search Bar */}
          <div className="w-full flex flex-col items-start text-left space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Temukan <br />
              <span className="text-blue-600">Keahlian Terbaik</span> <br />
              Untuk Bisnis Anda.
            </h1>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-xl">
              LayananPro menghubungkan Anda dengan puluhan vendor profesional
              terverifikasi untuk setiap kebutuhan proyek Anda.
            </p>
            {/* Search Bar */}
            <div className="bg-white rounded-full flex gap-4 items-center pl-5 pr-2 py-2 shadow-sm border border-gray-100 w-full max-w-md">
              <Search size={20} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Cari vendor..."
                className="bg-transparent border-none focus:outline-none w-full text-gray-700 placeholder-gray-400 text-sm"
              />
              <button className="bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 transition font-medium text-sm whitespace-nowrap">
                Cari Sekarang
              </button>
            </div>
          </div>

          {/* Kolom Kanan: Gambar */}
          <div className="w-full max-w-lg md:max-w-xl justify-self-center md:justify-self-end overflow-hidden rounded-3xl shadow-xl">
            <img
              src={HeroCreativeStudio}
              alt="Hero Creative Studio"
              className="w-full h-[300px] sm:h-[400px] md:h-[450px] object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* =========================================================================
             2. Kategori Section (Gunakan max-w-7xl mx-auto agar sejajar dengan Hero)
             ========================================================================= */}
      <section className="max-w-7xl mx-auto py-20 px-6 md:px-12  ">
        <div className="mb-10 text-center md:text-left">
          <h2 className="text-3xl md:text-3xl font-semibold text-gray-900 tracking-tight">
            Jelajahi Berdasarkan Kategori
          </h2>
          <p className="text-gray-500 mt-2 text-sm md:text-base">
            Temukan spesialisasi yang tepat sesuai kebutuhan proyek bisnis Anda.
          </p>
        </div>

        {/* Responsive Grid: 2 kolom di HP, 3 di tablet, 6 di desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((cat, index) => {
            const IconComponent = cat.icon;
            return (
              <div
                key={index}
                className="group flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-2xl text-center cursor-pointer shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Lingkaran pembungkus ikon dengan warna dinamis sesuai kategori */}
                <div
                  className={`w-14 h-14 ${cat.bg} ${cat.color} flex items-center justify-center rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComponent size={26} strokeWidth={2} />
                </div>

                {/* Nama Kategori */}
                <span className="text-sm font-semibold text-gray-800 group-hover:text-[#1e56d4] transition-colors duration-200">
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
             3. Preview Jasa Section
             ========================================================================= */}
      <section className="w-full py-5 bg-gray-30 ">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Header Section */}
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight max-w-md">
              Merchant Terpilih Minggu ini
            </h2>
            <a
              href="#"
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition flex items-center gap-1 whitespace-nowrap"
            >
              Lihat Semua <span className="text-xs">→</span>
            </a>
          </div>

          {/* Grid Cards (3 Kolom Responsif) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition duration-300">
              <div className="h-48 bg-gray-200 overflow-hidden">
                {/* Ganti src dengan variabel gambar Anda, misal: {HeroCreativeStudio} */}
                <img
                  src={VendorCreativeArt}
                  alt="Creative Studio"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 flex flex-col space-y-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    Creative Studio tel-u
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-amber-500 mt-1">
                    <span>★</span>{" "}
                    <span className="text-gray-600 font-medium">4.9</span>{" "}
                    <span className="text-gray-400">(127 reviews)</span>
                  </div>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-gray-50">
                  <span className="text-xs text-gray-400">Starting from</span>
                  <span className="text-base font-bold text-gray-900">
                    Rp 50.000
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition duration-300">
              <div className="h-48 bg-gray-200 overflow-hidden">
                <img
                  src={VendorVideoMakers}
                  alt="VideoMakers ITB"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 flex flex-col space-y-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    VideoMakers ITB
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-amber-500 mt-1">
                    <span>★</span>{" "}
                    <span className="text-gray-600 font-medium">4.8</span>{" "}
                    <span className="text-gray-400">(89 reviews)</span>
                  </div>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-gray-50">
                  <span className="text-xs text-gray-400">Starting from</span>
                  <span className="text-base font-bold text-gray-900">
                    Rp 50.000
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition duration-300">
              <div className="h-48 bg-gray-200 overflow-hidden">
                <img
                  src={VendorEventPro}
                  alt="EventPro UI"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 flex flex-col space-y-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    EventPro UI
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-amber-500 mt-1">
                    <span>★</span>{" "}
                    <span className="text-gray-600 font-medium">5.0</span>{" "}
                    <span className="text-gray-400">(45 reviews)</span>
                  </div>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-gray-50">
                  <span className="text-xs text-gray-400">Starting from</span>
                  <span className="text-base font-bold text-gray-900">
                    Rp 50.000
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
             4. Metrik Section
             ========================================================================= */}
      <section className="w-full py-20 bg-white border-t border-gray-50 mb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {/* Fitur 1: Transaksi Aman */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-sm">
              {/* Ikon Perisai / Transaksi Aman */}
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Transaksi Aman</h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
              Sistem pembayaran escrow kami menjamin keamanan dana Anda hingga
              pekerjaan selesai sesuai standar.
            </p>
          </div>

          {/* Fitur 2: Kualitas Terjamin */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-sm">
              {/* Ikon Terverifikasi / Kualitas */}
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Kualitas Terjamin
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
              Setiap merchant melalui proses verifikasi ketat untuk memastikan
              portofolio dan keahlian yang nyata.
            </p>
          </div>

          {/* Fitur 3: Dukungan 24/7 */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-sm">
              {/* Ikon Headset / CS */}
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Dukungan 24/7</h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
              Tim bantuan kami siap mendampingi Anda dari proses pemilihan
              merchant hingga penyelesaian proyek.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
             5. Call to Action Section (Latar belakang biru muda melar penuh, konten di tengah)
             ========================================================================= */}
      <section className="bg-[#f0f5ff] py-16 px-6">
        <div className="max-w-7xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Apakah Anda Seorang Profesional?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6 text-sm md:text-base">
            Bergabunglah dengan komunitas LayananPro dan mulailah melayani
            ribuan klien potensial di seluruh Indonesia.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-md transition duration-200 text-sm">
            Daftar Sebagai Merchant
          </button>
        </div>
      </section>
    </div>
  );
}
