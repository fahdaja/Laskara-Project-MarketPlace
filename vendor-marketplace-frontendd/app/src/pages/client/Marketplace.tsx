import { useEffect, useMemo, useState } from "react";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import type { Route } from "./+types/Marketplace";

import MarketplaceHeader from "~/src/components/client/MarketplaceHeader";
import ServiceCard from "~/src/components/client/ServiceCard";

import { getMarketplaceData } from "~/src/services/marketplace";

import type { MarketplaceGig, PublicMerchant } from "~/src/types/marketplace";

const PAGE_SIZE = 24;

type SortKey =
  | "recommended"
  | "price-low"
  | "price-high"
  | "name-az"
  | "popular"
  | "most-rented";

interface MarketplaceItem {
  gig: MarketplaceGig;
  merchant?: PublicMerchant;

  rating: number;
  reviewCount: number;
  completedOrders: number;
}

const SORT_OPTIONS: Array<{
  value: SortKey;
  label: string;
}> = [
  {
    value: "recommended",
    label: "Rekomendasi",
  },
  {
    value: "price-low",
    label: "Harga terendah",
  },
  {
    value: "price-high",
    label: "Harga tertinggi",
  },
  {
    value: "name-az",
    label: "Nama A-Z",
  },
  {
    value: "popular",
    label: "Populer",
  },
  {
    value: "most-rented",
    label: "Paling banyak disewa",
  },
];

export function meta() {
  return [
    {
      title: "Marketplace | LayananPro",
    },
    {
      name: "description",
      content: "Temukan layanan dan vendor profesional terbaik di LayananPro.",
    },
  ];
}

export async function loader() {
  return getMarketplaceData();
}

function parseMoney(value: string | number): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const plain = String(value).replace(/[^0-9.-]/g, "");

  const parsed = Number(plain);

  return Number.isFinite(parsed) ? parsed : 0;
}

function timestamp(value?: string): number {
  if (!value) {
    return 0;
  }

  const time = new Date(value).getTime();

  return Number.isFinite(time) ? time : 0;
}

function getPaginationNumbers(
  currentPage: number,
  totalPages: number,
): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, start + 4);

  if (end - start < 4) {
    start = Math.max(1, end - 4);
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export default function Marketplace({ loaderData }: Route.ComponentProps) {
  const { gigs, categories, merchants, leaderboard } = loaderData;

  const [query, setQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [sortBy, setSortBy] = useState<SortKey>("recommended");

  const [page, setPage] = useState(1);

  /**
   * Merchant endpoint memiliki logo/badge,
   * sedangkan GET /gigs cukup membawa merchantId +
   * merchant mini.
   */
  const merchantMap = useMemo(() => {
    return new Map(merchants.map((merchant) => [merchant.id, merchant]));
  }, [merchants]);

  /**
   * Backend saat ini menyediakan statistik leaderboard
   * pada level merchant.
   *
   * Kita manfaatkan sebagai sinyal Popular dan
   * Most Rented tanpa menambah request per-card.
   */
  const leaderboardMaps = useMemo(() => {
    const rating = new Map<
      number,
      {
        rating: number;
        reviewCount: number;
      }
    >();

    const rented = new Map<number, number>();

    for (const item of leaderboard.bestRating ?? []) {
      const merchantId = item.merchant?.id;

      if (!merchantId) {
        continue;
      }

      rating.set(merchantId, {
        rating: Number(item.avgRating) || 0,
        reviewCount: Number(item.reviewCount) || 0,
      });
    }

    for (const item of leaderboard.mostBooked ?? []) {
      const merchantId = item.merchant?.id;

      if (!merchantId) {
        continue;
      }

      rented.set(merchantId, Number(item.completedOrders) || 0);
    }

    return {
      rating,
      rented,
    };
  }, [leaderboard]);

  const items = useMemo<MarketplaceItem[]>(() => {
    return gigs.map((gig) => {
      const rating = leaderboardMaps.rating.get(gig.merchantId);

      return {
        gig,
        merchant: merchantMap.get(gig.merchantId),

        rating: rating?.rating ?? 0,

        reviewCount: rating?.reviewCount ?? 0,

        completedOrders: leaderboardMaps.rented.get(gig.merchantId) ?? 0,
      };
    });
  }, [gigs, merchantMap, leaderboardMaps]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const minimum =
      minPrice.trim() === "" ? 0 : Math.max(0, Number(minPrice) || 0);

    const maximum =
      maxPrice.trim() === ""
        ? Number.POSITIVE_INFINITY
        : Math.max(0, Number(maxPrice) || 0);

    const result = items.filter((item) => {
      const { gig, merchant } = item;

      if (
        selectedCategoryId !== null &&
        gig.categoryId !== selectedCategoryId
      ) {
        return false;
      }

      const price = parseMoney(gig.price);

      if (price < minimum || price > maximum) {
        return false;
      }

      if (normalizedQuery) {
        const merchantName = merchant?.shopName || gig.merchant?.shopName || "";

        const categoryName = gig.category?.name || "";

        const searchableText = [
          gig.title,
          gig.description,
          merchantName,
          categoryName,
        ]
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(normalizedQuery)) {
          return false;
        }
      }

      return true;
    });

    result.sort((a, b) => {
      const priceA = parseMoney(a.gig.price);
      const priceB = parseMoney(b.gig.price);

      switch (sortBy) {
        case "price-low":
          return (
            priceA - priceB || a.gig.title.localeCompare(b.gig.title, "id")
          );

        case "price-high":
          return (
            priceB - priceA || a.gig.title.localeCompare(b.gig.title, "id")
          );

        case "name-az":
          return a.gig.title.localeCompare(b.gig.title, "id", {
            sensitivity: "base",
          });

        case "popular":
          return (
            b.rating - a.rating ||
            b.reviewCount - a.reviewCount ||
            b.completedOrders - a.completedOrders ||
            timestamp(b.gig.createdAt) - timestamp(a.gig.createdAt)
          );

        case "most-rented":
          return (
            b.completedOrders - a.completedOrders ||
            b.rating - a.rating ||
            b.reviewCount - a.reviewCount ||
            timestamp(b.gig.createdAt) - timestamp(a.gig.createdAt)
          );

        case "recommended":
        default: {
          const featuredA = a.gig.featuredStatus === "FEATURED" ? 1 : 0;

          const featuredB = b.gig.featuredStatus === "FEATURED" ? 1 : 0;

          return (
            featuredB - featuredA ||
            b.rating - a.rating ||
            b.reviewCount - a.reviewCount ||
            b.completedOrders - a.completedOrders ||
            timestamp(b.gig.createdAt) - timestamp(a.gig.createdAt)
          );
        }
      }
    });

    return result;
  }, [items, query, selectedCategoryId, minPrice, maxPrice, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [query, selectedCategoryId, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const currentItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;

    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page]);

  const pageNumbers = useMemo(
    () => getPaginationNumbers(page, totalPages),
    [page, totalPages],
  );

  const activeCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId),
    [categories, selectedCategoryId],
  );

  function resetMarketplace() {
    setQuery("");
    setSelectedCategoryId(null);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("recommended");
    setPage(1);
  }

  function changePage(nextPage: number) {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages);

    setPage(safePage);

    requestAnimationFrame(() => {
      document.getElementById("marketplace-results")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <>
      <MarketplaceHeader
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        query={query}
        onQueryChange={setQuery}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onMinPriceChange={setMinPrice}
        onMaxPriceChange={setMaxPrice}
        onReset={resetMarketplace}
      />

      <section id="marketplace-results" className="scroll-mt-24">
        <div className="mx-auto max-w-7xl px-6 py-9 md:px-12 md:py-12">
          {/* Result Header */}
          <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                {activeCategory
                  ? activeCategory.name
                  : "Pilihan layanan untukmu"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filteredItems.length.toLocaleString("id-ID")} layanan ditemukan
              </p>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3">
              <span className="hidden text-xs font-semibold text-slate-400 sm:block">
                Urutkan
              </span>

              <div className="relative">
                <Sparkles
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"
                />

                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortKey)}
                  className="h-12 min-w-[220px] appearance-none rounded-2xl border border-slate-200 bg-white pl-11 pr-11 text-sm font-bold text-slate-700 outline-none transition hover:border-blue-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Active filter indicator */}
          {(selectedCategoryId !== null || query || minPrice || maxPrice) && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">
                Filter aktif:
              </span>

              {activeCategory && (
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                  {activeCategory.name}
                </span>
              )}

              {query && (
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                  “{query}”
                </span>
              )}

              {(minPrice || maxPrice) && (
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                  Harga{" "}
                  {minPrice
                    ? `Rp${Number(minPrice).toLocaleString("id-ID")}`
                    : "Rp0"}
                  {" – "}
                  {maxPrice
                    ? `Rp${Number(maxPrice).toLocaleString("id-ID")}`
                    : "∞"}
                </span>
              )}
            </div>
          )}

          {/* Result Grid */}
          {currentItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {currentItems.map((item) => (
                <ServiceCard
                  key={item.gig.id}
                  gig={item.gig}
                  merchant={item.merchant}
                  rating={item.rating}
                  reviewCount={item.reviewCount}
                  completedOrders={item.completedOrders}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[380px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                <PackageSearch size={30} />
              </div>

              <h3 className="mt-5 text-lg font-extrabold text-slate-900">
                Layanan tidak ditemukan
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Coba gunakan kata kunci lain, pilih kategori berbeda, atau
                longgarkan rentang harga.
              </p>

              <button
                type="button"
                onClick={resetMarketplace}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                <RotateCcw size={16} />
                Reset pencarian
              </button>
            </div>
          )}

          {/* Pagination */}
          {filteredItems.length > PAGE_SIZE && (
            <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-7 sm:flex-row">
              <p className="text-xs text-slate-500">
                Halaman <strong className="text-slate-800">{page}</strong> dari{" "}
                <strong className="text-slate-800">{totalPages}</strong>
                {" • "}
                {filteredItems.length.toLocaleString("id-ID")} layanan
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => changePage(page - 1)}
                  className="flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Sebelumnya
                </button>

                <div className="hidden items-center gap-1 sm:flex">
                  {pageNumbers.map((number) => (
                    <button
                      key={number}
                      type="button"
                      onClick={() => changePage(number)}
                      className={[
                        "h-10 min-w-10 rounded-xl px-3 text-xs font-bold transition",
                        number === page
                          ? "bg-blue-600 text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700",
                      ].join(" ")}
                    >
                      {number}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => changePage(page + 1)}
                  className="flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Berikutnya
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
