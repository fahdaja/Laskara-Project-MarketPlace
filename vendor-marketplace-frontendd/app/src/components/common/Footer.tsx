import React from "react";
import logo from "../../assets/images/logo.png";

export default function Footer() {
  return (
    <div className="w-full font-sans bg-white border-t border-gray-100">
      {/* =========================================================================
          MULTI-COLUMN FOOTER SECTION (Sudah diselaraskan dengan px-6 md:px-12)
          ========================================================================= */}
      <footer className="w-full py-16">
        {/* max-w-7xl mx-auto px-6 md:px-12 adalah kunci penyelarasan universal halaman */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Kolom 1: Brand / Logo Area */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <img
                src={logo}
                alt="Layanan Pro Logo"
                className="h-8 w-auto object-contain"
              />
              <span className="text-xl font-bold text-gray-950">Layanan</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-500">
              Platform terpercaya untuk menghubungkan klien dengan merchant
              profesional terbaik di bidangnya.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-4 text-gray-400">
              <a href="#" className="hover:text-[#1e56d4] transition">
                <i className="fab fa-facebook"></i> f
              </a>
              <a href="#" className="hover:text-[#1e56d4] transition">
                <i className="fab fa-twitter"></i> y
              </a>
              <a href="#" className="hover:text-[#1e56d4] transition">
                <i className="fab fa-linkedin"></i> in
              </a>
              <a href="#" className="hover:text-[#1e56d4] transition">
                <i className="fab fa-instagram"></i> 📷
              </a>
            </div>
          </div>

          {/* Kolom 2: Kategori */}
          <div>
            <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider mb-4">
              Kategori
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:text-gray-900 transition">
                  Creativ Studio
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition">
                  Event Essentials
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition">
                  Digital Marketing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition">
                  Finance
                </a>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Dukungan */}
          <div>
            <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider mb-4">
              Dukungan
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:text-gray-900 transition">
                  Pusat Bantuan
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition">
                  Keamanan Transaksi
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition">
                  Kebijakan Transaksi
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition">
                  Syarat & Ketentuan
                </a>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Contacts us */}
          <div>
            <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider mb-4">
              Contacts us
            </h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-center space-x-2">
                <span>📧</span>
                <a
                  href="mailto:contact@company.com"
                  className="hover:text-gray-900 transition"
                >
                  contact@company.com
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <span>📞</span>
                <a
                  href="tel:+14146875892"
                  className="hover:text-gray-900 transition"
                >
                  [(414) 687-5892](tel:+14146875892)
                </a>
              </li>
              <li className="flex items-start space-x-2">
                <span className="mt-0.5">📍</span>
                <span>
                  794 Mcalister St
                  <br />
                  San Francisco, 94102
                </span>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
