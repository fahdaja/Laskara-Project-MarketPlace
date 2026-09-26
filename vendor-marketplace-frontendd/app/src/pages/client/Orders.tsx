import { useEffect, useMemo, useState, type ReactNode } from "react";

import { Link } from "react-router";

import {
  CreditCard,
  ImageIcon,
  MessageCircle,
  Package,
  Search,
  Star,
  Store,
} from "lucide-react";

import {
  cancelDummyClientOrder,
  listDummyClientOrders,
} from "~/src/services/clientOrders";

import { createDummyMarketplaceChat } from "~/src/services/marketplace";

import {
  getClientOrderStatusConfig,
  type ClientOrderTone,
} from "~/src/helper/clientOrderStatus";

import OrderReviewDialog from "~/src/components/client/OrderReviewDialog";

import type { ClientOrderView } from "~/src/types/clientOrder";

type OrderFilter =
  | "all"
  | "unpaid"
  | "processing"
  | "delivered"
  | "dispute"
  | "completed"
  | "cancelled";

interface FilterDefinition {
  id: OrderFilter;

  label: string;
}

const FILTERS: FilterDefinition[] = [
  {
    id: "all",
    label: "Semua",
  },
  {
    id: "unpaid",
    label: "Belum Bayar",
  },
  {
    id: "processing",
    label: "Diproses",
  },
  {
    id: "delivered",
    label: "Hasil Dikirim",
  },
  {
    id: "dispute",
    label: "Sengketa",
  },
  {
    id: "completed",
    label: "Selesai",
  },
  {
    id: "cancelled",
    label: "Dibatalkan",
  },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatPlan(value: string): string {
  return value
    .toLowerCase()
    .replace(/^\w/, (character) => character.toUpperCase());
}

function toneClass(tone: ClientOrderTone): string {
  switch (tone) {
    case "amber":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "blue":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "violet":
      return "border-violet-200 bg-violet-50 text-violet-700";

    case "emerald":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "rose":
      return "border-rose-200 bg-rose-50 text-rose-700";

    default:
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

function matchesFilter(order: ClientOrderView, filter: OrderFilter): boolean {
  switch (filter) {
    case "all":
      return true;

    case "unpaid":
      return order.status === "UNPAID";

    case "processing":
      return [
        "PAID_PENDING_CONFIRMATION",
        "IN_PROGRESS",
        "IN_REVISION",
      ].includes(order.status);

    case "delivered":
      return order.status === "DELIVERED";

    case "dispute":
      return [
        "DISPUTE_IN_PROGRESS",
        "REFUND_APPROVED_WAITING_FINANCE",
        "RELEASE_APPROVED_WAITING_FINANCE",
      ].includes(order.status);

    case "completed":
      return order.status === "COMPLETED";

    case "cancelled":
      return ["CANCELLED", "REFUNDED"].includes(order.status);

    default:
      return true;
  }
}

export default function Orders() {
  const [orders, setOrders] = useState<ClientOrderView[] | null>(null);

  const [filter, setFilter] = useState<OrderFilter>("all");

  const [query, setQuery] = useState("");

  const [error, setError] = useState("");

  const [reviewing, setReviewing] = useState<ClientOrderView | null>(null);

  const [toast, setToast] = useState("");

  const showToast = (message: string) => {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 2400);
  };

  const reload = async () => {
    try {
      const result = await listDummyClientOrders();

      setOrders(result);

      setError("");
    } catch {
      setError("Pesanan tidak dapat dimuat.");
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const counts = useMemo(() => {
    if (!orders) {
      return {} as Record<OrderFilter, number>;
    }

    return FILTERS.reduce(
      (result, item) => {
        result[item.id] = orders.filter((order) =>
          matchesFilter(order, item.id),
        ).length;

        return result;
      },
      {} as Record<OrderFilter, number>,
    );
  }, [orders]);

  const reviewableCount = useMemo(
    () =>
      orders?.filter((order) => order.status === "COMPLETED" && !order.review)
        .length ?? 0,
    [orders],
  );

  const visibleOrders = useMemo(() => {
    if (!orders) {
      return [];
    }

    const normalized = query.trim().toLowerCase();

    return orders
      .filter((order) => matchesFilter(order, filter))
      .filter((order) => {
        if (!normalized) {
          return true;
        }

        return (
          order.gigTitle.toLowerCase().includes(normalized) ||
          order.merchant.shopName.toLowerCase().includes(normalized) ||
          order.categoryName.toLowerCase().includes(normalized) ||
          String(order.id).includes(normalized)
        );
      });
  }, [filter, orders, query]);

  const handleChat = async (order: ClientOrderView) => {
    await createDummyMarketplaceChat(order.gigId);

    showToast("Channel chat dummy berhasil dibuat.");
  };

  const handleCancel = async (order: ClientOrderView) => {
    const confirmed = window.confirm(`Batalkan pesanan #${order.id}?`);

    if (!confirmed) {
      return;
    }

    try {
      await cancelDummyClientOrder(order.id);

      await reload();

      showToast("Pesanan berhasil dibatalkan.");
    } catch (cancelError) {
      showToast(
        cancelError instanceof Error
          ? cancelError.message
          : "Pesanan gagal dibatalkan.",
      );
    }
  };

  if (error) {
    return (
      <main className="min-h-screen bg-[#f6f7f9] px-4 py-12">
        <div className="mx-auto max-w-5xl rounded-2xl border border-rose-200 bg-white p-6 text-sm font-semibold text-rose-700 shadow-sm">
          {error}
        </div>
      </main>
    );
  }

  if (orders === null) {
    return (
      <main className="min-h-screen bg-[#f6f7f9]">
        <div className="mx-auto max-w-6xl space-y-3 px-4 py-8 sm:px-6">
          <div className="h-9 w-52 animate-pulse rounded-xl bg-slate-200" />

          <div className="h-14 animate-pulse rounded-2xl bg-slate-200" />

          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-52 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#f6f7f9] pb-16">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
          {/* ====================================
              HEADER
             ==================================== */}
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950">
              Pesanan Saya
            </h1>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Kelola pesanan jasa, pembayaran, hasil pekerjaan, hingga ulasanmu.
            </p>
          </div>

          {/* ====================================
              FILTER PANEL
             ==================================== */}
          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <div role="tablist" className="flex min-w-max">
                {FILTERS.map((item) => {
                  const active = item.id === filter;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setFilter(item.id)}
                      className={[
                        "relative flex h-14 min-w-30 items-center justify-center gap-1.5 px-5 text-xs font-bold transition",
                        active
                          ? "text-blue-700"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
                      ].join(" ")}
                    >
                      {item.label}

                      {item.id !== "all" && (counts[item.id] ?? 0) > 0 && (
                        <span className="text-[9px] font-semibold text-slate-400">
                          {counts[item.id]}
                        </span>
                      )}

                      {item.id === "completed" && reviewableCount > 0 && (
                        <span
                          title={`${reviewableCount} pesanan belum diulas`}
                          className="h-1.5 w-1.5 rounded-full bg-amber-400"
                        />
                      )}

                      {active && (
                        <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-blue-700" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/60 p-3 sm:p-4">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cari berdasarkan nama jasa, vendor, kategori, atau nomor pesanan"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>
          </section>

          {/* ====================================
              RESULT INFO
             ==================================== */}
          <div className="mt-5 flex items-center justify-between gap-4">
            <p className="text-xs font-semibold text-slate-500">
              Menampilkan{" "}
              <span className="font-extrabold text-slate-800">
                {visibleOrders.length}
              </span>{" "}
              pesanan
            </p>

            {reviewableCount > 0 && (
              <button
                type="button"
                onClick={() => setFilter("completed")}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-600 transition hover:text-amber-700"
              >
                <Star size={13} className="fill-amber-400 text-amber-400" />
                {reviewableCount} belum diulas
              </button>
            )}
          </div>

          {/* ====================================
              ORDERS
             ==================================== */}
          {visibleOrders.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="mt-3 space-y-4">
              {visibleOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onReview={() => setReviewing(order)}
                  onChat={() => void handleChat(order)}
                  onCancel={() => void handleCancel(order)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {reviewing && (
        <OrderReviewDialog
          order={reviewing}
          onClose={() => setReviewing(null)}
          onSubmitted={() => {
            setReviewing(null);

            void reload();

            showToast("Ulasan berhasil dikirim.");
          }}
        />
      )}

      {toast && (
        <div className="fixed left-1/2 top-20 z-[100] -translate-x-1/2 rounded-full bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}
    </>
  );
}

function OrderCard({
  order,

  onReview,

  onChat,

  onCancel,
}: {
  order: ClientOrderView;

  onReview: () => void;

  onChat: () => void;

  onCancel: () => void;
}) {
  const status = getClientOrderStatusConfig(order.status);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md">
      {/* =================================
          MERCHANT HEADER
         ================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <Store size={15} />
          </div>

          <Link
            to={`/marketplace/store/${order.merchant.id}`}
            className="truncate text-xs font-extrabold text-slate-800 transition hover:text-blue-700"
          >
            {order.merchant.shopName}
          </Link>

          <button
            type="button"
            onClick={onChat}
            className="hidden items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[9px] font-bold text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:inline-flex"
          >
            <MessageCircle size={11} />
            Chat
          </button>

          <Link
            to={`/marketplace/store/${order.merchant.id}`}
            className="hidden rounded-lg border border-slate-200 px-2.5 py-1.5 text-[9px] font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 sm:inline-flex"
          >
            Lihat Toko
          </Link>
        </div>

        <div
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold ${toneClass(
            status.tone,
          )}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />

          {status.label}
        </div>
      </div>

      {/* =================================
          SERVICE
         ================================= */}
      <Link
        to={`/pesanan/${order.id}`}
        className="group flex gap-4 px-4 py-4 sm:px-5 sm:py-5"
      >
        <div className="relative flex h-22 w-22 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50 text-slate-300 sm:h-26 sm:w-26">
          {order.imageUrl ? (
            <img
              src={order.imageUrl}
              alt={order.gigTitle}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <ImageIcon size={23} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="line-clamp-2 text-sm font-extrabold leading-5 text-slate-900 transition group-hover:text-blue-700 sm:text-base">
            {order.gigTitle}
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide">
            <span className="text-blue-600">{order.categoryName}</span>

            <span className="text-slate-300">•</span>

            <span className="text-slate-500">
              Paket {formatPlan(order.plan)}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400">
            <span>Pesanan #{order.id}</span>

            <span>{formatDate(order.createdAt)}</span>
          </div>
        </div>

        <div className="hidden shrink-0 self-center text-right sm:block">
          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
            Harga Jasa
          </p>

          <p className="mt-1 text-base font-black text-slate-900">
            {formatCurrency(order.totalAmount)}
          </p>
        </div>
      </Link>

      {/* =================================
          STATUS NOTE
         ================================= */}
      <div className="border-y border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
        <p className="text-[10px] leading-5 text-slate-500 sm:text-[11px]">
          {status.description}
        </p>
      </div>

      {/* =================================
          MOBILE MERCHANT ACTION
         ================================= */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 sm:hidden">
        <button
          type="button"
          onClick={onChat}
          className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500"
        >
          <MessageCircle size={12} />
          Chat Vendor
        </button>

        <Link
          to={`/marketplace/store/${order.merchant.id}`}
          className="text-[10px] font-bold text-slate-500"
        >
          Lihat Toko
        </Link>
      </div>

      {/* =================================
          FOOTER / TOTAL / ACTION
         ================================= */}
      <div className="px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="sm:hidden">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
              Harga Jasa
            </p>

            <p className="mt-1 text-base font-black text-slate-900">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>

          <div className="hidden text-[10px] text-slate-400 sm:block">
            <Link
              to={`/pesanan/${order.id}`}
              className="font-bold text-blue-700 transition hover:text-blue-800"
            >
              Detail Pesanan
            </Link>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <div className="flex items-baseline justify-between gap-4 sm:justify-end">
              <span className="text-[10px] font-semibold text-slate-500">
                Total Pesanan
              </span>

              <span className="text-lg font-black tracking-tight text-slate-950">
                {formatCurrency(order.paymentTotal)}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              {order.status === "UNPAID" && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="h-9 rounded-lg px-3 text-[10px] font-bold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                >
                  Batalkan
                </button>
              )}

              <Link
                to={`/pesanan/${order.id}`}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 text-[10px] font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Detail Pesanan
              </Link>

              <PrimaryAction order={order} onReview={onReview} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function PrimaryAction({
  order,

  onReview,
}: {
  order: ClientOrderView;

  onReview: () => void;
}) {
  switch (order.status) {
    case "UNPAID":
      return (
        <Link
          to={`/booking/${order.id}`}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-blue-700 px-4 text-[10px] font-bold text-white shadow-sm transition hover:bg-blue-800"
        >
          <CreditCard size={12} />
          Bayar Sekarang
        </Link>
      );

    case "PAID_PENDING_CONFIRMATION":
      return (
        <Link
          to={`/booking/${order.id}`}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-4 text-[10px] font-bold text-blue-700 transition hover:bg-blue-100"
        >
          Lihat Pembayaran
        </Link>
      );

    case "DELIVERED":
      return (
        <Link
          to={`/pesanan/${order.id}`}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-violet-600 px-4 text-[10px] font-bold text-white transition hover:bg-violet-700"
        >
          Periksa Hasil
        </Link>
      );

    case "COMPLETED":
      if (!order.review) {
        return (
          <button
            type="button"
            onClick={onReview}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 text-[10px] font-bold text-white transition hover:bg-slate-800"
          >
            <Star size={12} />
            Beri Ulasan
          </button>
        );
      }

      return (
        <Link
          to={`/pesanan/${order.id}`}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-[10px] font-bold text-emerald-700"
        >
          Sudah Diulas
        </Link>
      );

    case "CANCELLED":
    case "REFUNDED":
      return (
        <Link
          to={`/marketplace/${order.gigId}`}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-700 px-4 text-[10px] font-bold text-white transition hover:bg-blue-800"
        >
          Pesan Lagi
        </Link>
      );

    default:
      return null;
  }
}

function EmptyState() {
  return (
    <div className="mt-4 flex min-h-80 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-center shadow-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
        <Package size={25} />
      </div>

      <h2 className="mt-4 text-sm font-extrabold text-slate-800">
        Tidak ada pesanan
      </h2>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
        Belum ada pesanan yang sesuai dengan kategori atau pencarian ini.
      </p>

      <Link
        to="/marketplace"
        className="mt-5 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-800"
      >
        Jelajahi Marketplace
      </Link>
    </div>
  );
}

function TabButton({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
