import React from "react";
import { Link, useLocation } from "react-router";

// Mapping kata dari URL path ke Bahasa Indonesia yang rapi
const pathNameMap: Record<string, string> = {
  merchant: "Merchant",
  dashboard: "Ringkasan Toko",
  services: "Manajemen Layanan",
  gigs: "Manajemen Layanan", // fallback jika route masih pakai 'gigs'
  create: "Buat Baru",
  new: "Buat Baru",
  orders: "Order",
  detail: "Detail Order",
  transactions: "Transaksi",
  associates: "Associate Toko",
  store: "Toko Saya",
};

export default function Breadcrumb(): React.JSX.Element {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav className="flex items-center gap-1.5 text-xs font-medium">
      {pathnames.map((value, index) => {
        const isLast = index === pathnames.length - 1;
        const isMerchantPrefix = value === "merchant";
        const displayName = pathNameMap[value] || value;
        const targetUrl = `/${pathnames.slice(0, index + 1).join("/")}`;

        return (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-slate-300 font-normal">&gt;</span>}

            {isLast ? (
              // Halaman Aktif saat ini: Warna lebih gelap, font tebal
              <span className="font-semibold text-slate-700">
                {displayName}
              </span>
            ) : isMerchantPrefix ? (
              // Prefix Context: Murni teks biasa warna abu murni
              <span className="text-slate-400 font-normal">
                {displayName}
              </span>
            ) : (
              // Parent Link: Abu-abu netral, berubah biru lembut HANYA saat di-hover
              <Link
                to={targetUrl}
                className="text-slate-500 hover:text-blue-600 hover:underline transition"
              >
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}