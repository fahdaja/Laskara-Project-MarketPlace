import { ImageIcon, Sparkles, Star, Store } from "lucide-react";

import type { MarketplaceGig, PublicMerchant } from "~/src/types/marketplace";

interface ServiceCardProps {
  gig: MarketplaceGig;
  merchant?: PublicMerchant;

  rating: number;
  reviewCount: number;

  completedOrders: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function parsePrice(value: string | number): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = value
    .replace(/[^\d.,-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function resolveMediaUrl(mediaUrls?: string | null): string | null {
  if (!mediaUrls) {
    return null;
  }

  const value = mediaUrls.trim();

  if (!value) {
    return null;
  }

  try {
    if (value.startsWith("[")) {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        const first = parsed.find((item) => typeof item === "string");

        return first ?? null;
      }
    }

    if (value.startsWith("{")) {
      const parsed = JSON.parse(value);

      if (typeof parsed?.url === "string") {
        return parsed.url;
      }

      if (
        Array.isArray(parsed?.images) &&
        typeof parsed.images[0] === "string"
      ) {
        return parsed.images[0];
      }
    }
  } catch {
    // mediaUrls adalah URL biasa, lanjut di bawah.
  }

  return value;
}

function initials(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ServiceCard({
  gig,
  merchant,
  rating,
  reviewCount,
  completedOrders,
}: ServiceCardProps) {
  const imageUrl = resolveMediaUrl(gig.mediaUrls);

  const merchantName =
    merchant?.shopName || gig.merchant?.shopName || "Vendor LayananPro";

  const categoryName = gig.category?.name || "Layanan";

  const price = parsePrice(gig.price);

  const featured = gig.featuredStatus === "FEATURED";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-950/5">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-100 bg-white text-blue-400 shadow-sm">
            <ImageIcon size={27} />
          </div>
        </div>

        {imageUrl && (
          <img
            src={imageUrl}
            alt={gig.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        )}

        {featured && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg">
            <Sparkles size={12} />
            Featured
          </div>
        )}

        <div className="absolute bottom-3 left-3 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-blue-700 shadow-sm backdrop-blur">
          {categoryName}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 min-h-[44px] text-base font-extrabold leading-snug text-slate-900 transition group-hover:text-blue-700">
          {gig.title}
        </h3>

        {/* Merchant */}
        <div className="mt-4 flex items-center gap-3">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-[10px] font-bold text-slate-500">
            {initials(merchantName) || <Store size={16} />}

            {merchant?.logoUrl && (
              <img
                src={merchant.logoUrl}
                alt={merchantName}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-slate-700">
              {merchantName}
            </p>

            <p className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-wide text-slate-400">
              {merchant?.badge?.replaceAll("_", " ") || "Vendor"}
            </p>
          </div>
        </div>

        {/* Rating / Vendor Statistics */}
        <div className="mt-4 flex min-h-5 items-center gap-2 text-xs">
          {reviewCount > 0 ? (
            <>
              <div className="flex items-center gap-1 font-bold text-slate-800">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                {rating.toFixed(1)}
              </div>

              <span className="text-slate-300">•</span>

              <span className="text-slate-400">
                {reviewCount} ulasan vendor
              </span>
            </>
          ) : (
            <span className="flex items-center gap-1.5 text-slate-400">
              <Star size={14} />
              Belum ada rating vendor
            </span>
          )}
        </div>

        {completedOrders > 0 && (
          <p className="mt-1 text-[11px] text-slate-400">
            {completedOrders} pesanan selesai pada vendor ini
          </p>
        )}

        {/* Price */}
        <div className="mt-auto border-t border-slate-100 pt-4">
          <div className="mt-1 flex items-end justify-between gap-2">
            <p className="text-lg font-extrabold tracking-tight text-blue-700">
              {formatCurrency(price)}
            </p>

            <span className="text-[10px] font-medium text-slate-400">
              / layanan
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
