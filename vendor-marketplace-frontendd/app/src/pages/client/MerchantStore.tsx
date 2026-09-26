import { useMemo, useState } from "react";

import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";

import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  Clock3,
  ImageIcon,
  PackageCheck,
  Search,
  Sparkles,
  Star,
  Store,
} from "lucide-react";

import { getMarketplaceMerchantStore } from "~/src/services/marketplace";

import type { GigPlan, MarketplaceGig } from "~/src/types/marketplace";

import type { MarketplaceMerchantStoreData } from "~/src/types/merchantStore";

type StoreTab = "home" | "services";

type SortType = "recommended" | "newest" | "price-low" | "price-high";

export async function loader({
  params,
}: LoaderFunctionArgs): Promise<MarketplaceMerchantStoreData> {
  const merchantId = Number(params.merchantId);

  if (!Number.isFinite(merchantId)) {
    throw new Response("Toko tidak ditemukan.", {
      status: 404,
    });
  }

  const store = await getMarketplaceMerchantStore(merchantId);

  if (!store) {
    throw new Response("Toko tidak ditemukan.", {
      status: 404,
    });
  }

  return store;
}

function formatCurrency(value: string | number): string {
  const amount =
    typeof value === "number"
      ? value
      : Number(
          String(value)
            .replace(/[^\d.,-]/g, "")
            .replace(/\./g, "")
            .replace(",", "."),
        );

  return new Intl.NumberFormat("id-ID", {
    style: "currency",

    currency: "IDR",

    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function getPrice(value: string | number): number {
  if (typeof value === "number") {
    return value;
  }

  const normalized = value
    .replace(/[^\d.,-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const result = Number(normalized);

  return Number.isFinite(result) ? result : 0;
}

function initials(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase() ?? "")
    .join("");
}

function planLabel(value: GigPlan): string {
  switch (value) {
    case "STANDARD":
      return "Standard";

    case "PREMIUM":
      return "Premium";

    default:
      return "Basic";
  }
}

function badgeLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatJoinDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    month: "short",

    year: "numeric",
  }).format(date);
}

function resolveMediaUrl(mediaUrls?: string | null): string | null {
  if (!mediaUrls?.trim()) {
    return null;
  }

  const value = mediaUrls.trim();

  try {
    if (value.startsWith("[")) {
      const parsed: unknown = JSON.parse(value);

      if (Array.isArray(parsed)) {
        const first = parsed.find(
          (item): item is string => typeof item === "string",
        );

        return first ?? null;
      }
    }

    if (value.startsWith("{")) {
      const parsed = JSON.parse(value) as {
        url?: unknown;
        images?: unknown;
      };

      if (typeof parsed.url === "string") {
        return parsed.url;
      }

      if (
        Array.isArray(parsed.images) &&
        typeof parsed.images[0] === "string"
      ) {
        return parsed.images[0];
      }
    }
  } catch {
    // URL biasa.
  }

  return value;
}

export default function MerchantStore() {
  const store = useLoaderData() as MarketplaceMerchantStoreData;

  const { merchant, services, stats } = store;

  const [tab, setTab] = useState<StoreTab>("home");

  const [query, setQuery] = useState("");

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const [sortBy, setSortBy] = useState<SortType>("recommended");

  const categories = useMemo(() => {
    const map = new Map<number, string>();

    services.forEach((service) => {
      map.set(service.category.id, service.category.name);
    });

    return Array.from(map.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [services]);

  const featuredServices = useMemo(
    () => services.filter((service) => service.featuredStatus === "FEATURED"),
    [services],
  );

  const filteredServices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const result = services.filter((service) => {
      const matchQuery =
        !normalizedQuery ||
        service.title.toLowerCase().includes(normalizedQuery) ||
        service.description.toLowerCase().includes(normalizedQuery);

      const matchCategory =
        selectedCategory === null || service.categoryId === selectedCategory;

      return matchQuery && matchCategory;
    });

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

        case "price-low":
          return getPrice(a.price) - getPrice(b.price);

        case "price-high":
          return getPrice(b.price) - getPrice(a.price);

        default: {
          const aFeatured = a.featuredStatus === "FEATURED" ? 1 : 0;

          const bFeatured = b.featuredStatus === "FEATURED" ? 1 : 0;

          if (aFeatured !== bFeatured) {
            return bFeatured - aFeatured;
          }

          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
      }
    });
  }, [query, selectedCategory, services, sortBy]);

  const visibleServices =
    tab === "home" ? filteredServices.slice(0, 8) : filteredServices;

  const isVacation = merchant.status === "VACATION";

  return (
    <main className="min-h-screen bg-[#f6f7f9] pb-16">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 md:px-12">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-xs">
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1.5 font-semibold text-slate-500 transition hover:text-blue-700"
          >
            <ArrowLeft size={15} />
            Marketplace
          </Link>

          <ChevronRight size={14} className="text-slate-300" />

          <span className="truncate font-semibold text-slate-800">
            {merchant.shopName}
          </span>
        </div>

        {/* =====================================================
            STORE HEADER
           ===================================================== */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            {/* Store Hero */}
            <div className="relative min-h-60 overflow-hidden bg-slate-900">
              {merchant.bannerUrl ? (
                <img
                  src={merchant.bannerUrl}
                  alt={`Banner ${merchant.shopName}`}
                  className="absolute inset-0 h-full w-full object-cover opacity-65"
                />
              ) : (
                <>
                  <div className="absolute -left-20 -top-28 h-80 w-80 rounded-full bg-blue-600/40 blur-3xl" />

                  <div className="absolute -bottom-28 right-0 h-80 w-80 rounded-full bg-indigo-500/40 blur-3xl" />
                </>
              )}

              <div className="absolute inset-0 bg-linear-to-r from-slate-950/85 via-slate-950/55 to-slate-950/25" />

              <div className="relative flex min-h-60 flex-col justify-end p-6 sm:p-7">
                <div className="flex items-end gap-4">
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white text-lg font-black text-blue-700 shadow-lg">
                    {initials(merchant.shopName) || <Store size={28} />}

                    {merchant.logoUrl && (
                      <img
                        src={merchant.logoUrl}
                        alt={merchant.shopName}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div className="min-w-0 pb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="truncate text-xl font-black text-white sm:text-2xl">
                        {merchant.shopName}
                      </h1>

                      <BadgeCheck
                        size={18}
                        className="shrink-0 text-blue-300"
                      />
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
                        {badgeLabel(merchant.badge)}
                      </span>

                      <span
                        className={[
                          "rounded-md px-2.5 py-1 text-[10px] font-bold",
                          isVacation
                            ? "bg-amber-400/20 text-amber-200"
                            : "bg-emerald-400/20 text-emerald-200",
                        ].join(" ")}
                      >
                        {isVacation ? "Mode Libur" : "Toko Aktif"}
                      </span>
                    </div>
                  </div>
                </div>

                {merchant.description && (
                  <p className="mt-5 max-w-2xl text-xs leading-6 text-slate-200">
                    {merchant.description}
                  </p>
                )}
              </div>
            </div>

            {/* Store stats */}
            <div className="p-6 sm:p-7">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                Informasi Toko
              </p>

              <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-6">
                <StoreStat
                  icon={<PackageCheck size={16} />}
                  label="Layanan"
                  value={String(services.length)}
                />

                <StoreStat
                  icon={<Star size={16} />}
                  label="Rating"
                  value={stats.rating !== null ? stats.rating.toFixed(1) : "-"}
                  helper={
                    stats.reviewCount > 0
                      ? `${stats.reviewCount} ulasan`
                      : "Belum ada data"
                  }
                />

                <StoreStat
                  icon={<ShoppingStatIcon />}
                  label="Pesanan selesai"
                  value={
                    stats.completedOrders > 0
                      ? String(stats.completedOrders)
                      : "-"
                  }
                />

                <StoreStat
                  icon={<Clock3 size={16} />}
                  label="Hasil pertama"
                  value={
                    stats.avgResponseHours !== null
                      ? `± ${stats.avgResponseHours} jam`
                      : "-"
                  }
                />

                <StoreStat
                  icon={<CalendarDays size={16} />}
                  label="Bergabung"
                  value={formatJoinDate(merchant.createdAt)}
                />

                <StoreStat
                  icon={<BadgeCheck size={16} />}
                  label="Status"
                  value={isVacation ? "Libur" : "Terverifikasi"}
                />
              </div>
            </div>
          </div>
        </section>

        {isVacation && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
            Toko sedang berada dalam mode libur. Beberapa layanan mungkin tidak
            tersedia untuk dipesan sementara.
          </div>
        )}

        {/* =====================================================
            STORE NAVIGATION
           ===================================================== */}
        <section className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex overflow-x-auto px-3">
            <StoreTabButton
              active={tab === "home"}
              onClick={() => setTab("home")}
            >
              Beranda Toko
            </StoreTabButton>

            <StoreTabButton
              active={tab === "services"}
              onClick={() => setTab("services")}
            >
              Semua Layanan
              <span className="ml-1 text-[10px] text-slate-400">
                ({services.length})
              </span>
            </StoreTabButton>
          </div>
        </section>

        {/* =====================================================
            FEATURED
           ===================================================== */}
        {tab === "home" && featuredServices.length > 0 && (
          <section className="mt-7">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-blue-600" />

                  <h2 className="text-lg font-extrabold text-slate-900">
                    Pilihan Toko
                  </h2>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Layanan yang sedang ditampilkan sebagai featured.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setTab("services")}
                className="text-xs font-bold text-blue-700"
              >
                Lihat semua
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {featuredServices.slice(0, 4).map((service) => (
                <StoreServiceCard key={service.id} service={service} />
              ))}
            </div>
          </section>
        )}

        {/* =====================================================
            SERVICES
           ===================================================== */}
        <section className="mt-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-extrabold text-slate-900">
              {tab === "home" ? "Layanan dari toko ini" : "Semua layanan"}
            </h2>

            <p className="text-xs text-slate-500">
              Temukan jasa yang sesuai dengan kebutuhanmu.
            </p>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[210px_minmax(0,1fr)]">
            {/* Category sidebar */}
            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <p className="px-2 py-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                Kategori
              </p>

              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className={[
                  "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-bold transition",
                  selectedCategory === null
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50",
                ].join(" ")}
              >
                Semua Layanan
                <span className="text-[10px] font-semibold opacity-60">
                  {services.length}
                </span>
              </button>

              <div className="mt-1 space-y-1">
                {categories.map((category) => {
                  const count = services.filter(
                    (service) => service.categoryId === category.id,
                  ).length;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(category.id)}
                      className={[
                        "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition",
                        selectedCategory === category.id
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
                      ].join(" ")}
                    >
                      <span className="line-clamp-1">{category.name}</span>

                      <span className="text-[10px] opacity-60">{count}</span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Main content */}
            <div className="min-w-0">
              {/* Search + sorting */}
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Cari layanan di toko ini..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden text-xs text-slate-400 sm:inline">
                    Urutkan:
                  </span>

                  <select
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(event.target.value as SortType)
                    }
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none focus:border-blue-400"
                  >
                    <option value="recommended">Rekomendasi</option>

                    <option value="newest">Terbaru</option>

                    <option value="price-low">Harga terendah</option>

                    <option value="price-high">Harga tertinggi</option>
                  </select>
                </div>
              </div>

              {/* Result count */}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Menampilkan{" "}
                  <strong className="text-slate-800">
                    {visibleServices.length}
                  </strong>{" "}
                  layanan
                </p>

                {(query || selectedCategory !== null) && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");

                      setSelectedCategory(null);
                    }}
                    className="text-xs font-bold text-blue-700"
                  >
                    Reset filter
                  </button>
                )}
              </div>

              {visibleServices.length > 0 ? (
                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                  {visibleServices.map((service) => (
                    <StoreServiceCard key={service.id} service={service} />
                  ))}
                </div>
              ) : (
                <div className="mt-3 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-center shadow-sm">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <Search size={22} />
                  </div>

                  <h3 className="mt-4 text-sm font-extrabold text-slate-800">
                    Layanan tidak ditemukan
                  </h3>

                  <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                    Coba gunakan kata pencarian atau kategori yang berbeda.
                  </p>
                </div>
              )}

              {tab === "home" && filteredServices.length > 8 && (
                <button
                  type="button"
                  onClick={() => setTab("services")}
                  className="mt-5 w-full rounded-xl border border-blue-200 bg-white py-3 text-xs font-bold text-blue-700 transition hover:bg-blue-50"
                >
                  Lihat semua {filteredServices.length} layanan
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StoreTabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;

  onClick: () => void;

  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative min-w-36 px-5 py-4 text-xs font-bold transition",
        active ? "text-blue-700" : "text-slate-500 hover:text-slate-800",
      ].join(" ")}
    >
      {children}

      {active && (
        <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-blue-600" />
      )}
    </button>
  );
}

function StoreStat({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode;

  label: string;

  value: string;

  helper?: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        {icon}
      </div>

      <div>
        <p className="text-[10px] text-slate-400">{label}</p>

        <p className="mt-0.5 text-sm font-extrabold text-slate-800">{value}</p>

        {helper && <p className="mt-0.5 text-[9px] text-slate-400">{helper}</p>}
      </div>
    </div>
  );
}

function ShoppingStatIcon() {
  return <PackageCheck size={16} />;
}

function StoreServiceCard({ service }: { service: MarketplaceGig }) {
  const imageUrl = resolveMediaUrl(service.mediaUrls);

  return (
    <Link
      to={`/marketplace/${service.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={service.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.025]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <ImageIcon size={26} />
          </div>
        )}

        {service.featuredStatus === "FEATURED" && (
          <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-[8px] font-bold uppercase text-white">
            <Sparkles size={9} />
            Featured
          </div>
        )}

        <div className="absolute bottom-2 left-2 rounded-md bg-slate-950/70 px-2 py-1 text-[8px] font-bold uppercase text-white backdrop-blur">
          {planLabel(service.plan)}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <p className="text-[9px] font-bold uppercase tracking-wide text-blue-600">
          {service.category.name}
        </p>

        <h3 className="mt-1 line-clamp-2 min-h-9 text-xs font-bold leading-4.5 text-slate-800 transition group-hover:text-blue-700">
          {service.title}
        </h3>

        <p className="mt-auto pt-4 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
          Mulai dari
        </p>

        <p className="mt-0.5 text-sm font-black text-blue-700">
          {formatCurrency(service.price)}
        </p>
      </div>
    </Link>
  );
}
