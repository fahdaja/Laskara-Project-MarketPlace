import { useState, type ReactNode } from "react";

import {
  Link,
  useLoaderData,
  useNavigate,
  type LoaderFunctionArgs,
} from "react-router";

import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  CircleCheck,
  ImageIcon,
  MessageCircle,
  PackageCheck,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
} from "lucide-react";

import {
  createDummyMarketplaceChat,
  getMarketplaceServiceDetail,
} from "~/src/services/marketplace";

import type {
  MarketplaceRelatedService,
  MarketplaceServiceDetail,
} from "~/src/types/serviceDetail";

import type { GigPlan } from "~/src/types/marketplace";

export async function loader({
  params,
}: LoaderFunctionArgs): Promise<MarketplaceServiceDetail> {
  const id = Number(params.id);

  if (!Number.isFinite(id)) {
    throw new Response("Jasa tidak ditemukan.", {
      status: 404,
    });
  }

  const detail = await getMarketplaceServiceDetail(id);

  if (detail === null) {
    throw new Response("Jasa tidak ditemukan.", {
      status: 404,
    });
  }

  return detail;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",

    currency: "IDR",

    maximumFractionDigits: 0,
  }).format(value);
}

function parseMoney(value: string | number): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = String(value)
    .replace(/[^\d.,-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function initials(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase() ?? "")
    .join("");
}

function planLabel(plan: GigPlan): string {
  switch (plan) {
    case "STANDARD":
      return "Standard";

    case "PREMIUM":
      return "Premium";

    default:
      return "Basic";
  }
}

function merchantBadgeLabel(value: string): string {
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
    month: "long",

    year: "numeric",
  }).format(date);
}

function formatCreatedDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",

    month: "long",

    year: "numeric",
  }).format(date);
}

export default function ServiceDetail() {
  const navigate = useNavigate();

  const detail = useLoaderData() as MarketplaceServiceDetail;

  const [imageFailed, setImageFailed] = useState(false);

  const [busyAction, setBusyAction] = useState<"order" | "chat" | null>(null);

  const [toast, setToast] = useState("");

  const price = parseMoney(detail.gig.price);

  const showToast = (message: string) => {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 2500);
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: detail.gig.title,

          text: `Lihat jasa ${detail.gig.title} di LayananPro.`,

          url,
        });

        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);

      showToast("Tautan berhasil disalin.");
    } catch {
      showToast("Tautan belum bisa disalin.");
    }
  };

  const handleOrder = () => {
    navigate(`/checkout/${detail.gig.id}`);
  };

  const handleChat = async () => {
    if (busyAction) {
      return;
    }

    setBusyAction("chat");

    try {
      await createDummyMarketplaceChat(detail.gig.id);

      showToast("Channel chat dummy berhasil dibuat.");
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-[#f6f7f9] pb-16">
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 md:px-12">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2 text-xs">
              <Link
                to="/marketplace"
                className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-slate-500 transition hover:text-blue-700"
              >
                <ArrowLeft size={15} />
                Marketplace
              </Link>

              <ChevronRight size={14} className="shrink-0 text-slate-300" />

              <span className="hidden text-slate-400 sm:inline">
                {detail.gig.category.name}
              </span>

              <ChevronRight
                size={14}
                className="hidden shrink-0 text-slate-300 sm:block"
              />

              <span className="truncate font-semibold text-slate-800">
                {detail.gig.title}
              </span>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
            >
              <Share2 size={14} />

              <span className="hidden sm:inline">Bagikan</span>
            </button>
          </div>

          {/* Main Detail */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(390px,0.95fr)]">
              {/* Media */}
              <div className="border-b border-slate-100 p-4 sm:p-5 lg:border-b-0 lg:border-r">
                <div className="relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                  {!imageFailed && detail.mediaUrl ? (
                    <img
                      src={detail.mediaUrl}
                      alt={detail.gig.title}
                      className="h-full w-full object-cover"
                      onError={() => setImageFailed(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                        <ImageIcon size={28} />
                      </div>

                      <p className="text-xs font-semibold">
                        Media jasa belum tersedia
                      </p>
                    </div>
                  )}

                  {detail.gig.featuredStatus === "FEATURED" && (
                    <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wide text-white shadow">
                      <Sparkles size={12} />
                      Featured
                    </div>
                  )}
                </div>
              </div>

              {/* Detail kanan */}
              <div className="p-5 sm:p-6 lg:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-blue-700">
                    {detail.gig.category.name}
                  </span>

                  <span className="rounded-md border border-slate-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    {planLabel(detail.gig.plan)}
                  </span>
                </div>

                <h1 className="mt-4 text-xl font-black leading-snug tracking-tight text-slate-950 sm:text-2xl">
                  {detail.gig.title}
                </h1>

                {/* Stats */}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                  {detail.merchantStats.rating !== null &&
                    detail.merchantStats.reviewCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-blue-700">
                          {detail.merchantStats.rating.toFixed(1)}
                        </span>

                        <Star
                          size={14}
                          className="fill-amber-400 text-amber-400"
                        />

                        <span className="text-slate-400">
                          {detail.merchantStats.reviewCount} ulasan vendor
                        </span>
                      </div>
                    )}

                  {detail.merchantStats.completedOrders > 0 && (
                    <div className="border-l border-slate-200 pl-4">
                      <span className="font-bold text-slate-700">
                        {detail.merchantStats.completedOrders}
                      </span>{" "}
                      <span className="text-slate-400">pesanan selesai</span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="mt-6 bg-linear-to-r from-blue-50 to-indigo-50 px-5 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Harga Jasa
                  </p>

                  <div className="mt-1 flex flex-wrap items-end gap-3">
                    <p className="text-3xl font-black tracking-tight text-blue-700">
                      {formatCurrency(price)}
                    </p>

                    <span className="mb-1 rounded bg-white/80 px-2 py-1 text-[10px] font-bold text-slate-500">
                      Paket {planLabel(detail.gig.plan)}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="mt-6 space-y-4">
                  <InfoRow
                    label="Paket jasa"
                    value={
                      <span className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
                        <PackageCheck size={15} />

                        {planLabel(detail.gig.plan)}
                      </span>
                    }
                  />

                  <InfoRow
                    label="Kategori"
                    value={
                      <span className="text-xs font-semibold text-slate-700">
                        {detail.gig.category.name}
                      </span>
                    }
                  />

                  <InfoRow
                    label="Ketersediaan"
                    value={
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                        <CircleCheck size={15} />
                        Bisa dipesan
                      </span>
                    }
                  />
                </div>

                {/* Actions */}
                <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleChat}
                    disabled={busyAction !== null}
                    className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-60"
                  >
                    <MessageCircle size={17} />

                    {busyAction === "chat" ? "Membuka..." : "Chat Penjual"}
                  </button>

                  <button
                    type="button"
                    onClick={handleOrder}
                    className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-bold text-white shadow-md shadow-blue-700/15 transition hover:bg-blue-800"
                  >
                    <ShoppingBag size={17} />
                    Pesan Sekarang
                  </button>
                </div>

                {/* Custom offer hint */}
                <div className="mt-4 flex items-start gap-2.5 border-t border-slate-100 pt-4">
                  <MessageCircle
                    size={15}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  <p className="text-[11px] leading-relaxed text-slate-500">
                    Butuh cakupan atau harga yang berbeda? Chat vendor terlebih
                    dahulu. Vendor dapat mengirim penawaran khusus melalui chat.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Merchant */}
          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-blue-50 text-sm font-black text-blue-700">
                  {initials(detail.merchant.shopName) || <Store size={22} />}

                  {detail.merchant.logoUrl && (
                    <img
                      src={detail.merchant.logoUrl}
                      alt={detail.merchant.shopName}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-sm font-extrabold text-slate-900 sm:text-base">
                      {detail.merchant.shopName}
                    </h2>

                    <BadgeCheck size={16} className="shrink-0 text-blue-600" />

                    <span className="rounded bg-slate-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                      {merchantBadgeLabel(detail.merchant.badge)}
                    </span>
                  </div>

                  <p className="mt-1 max-w-xl line-clamp-2 text-xs leading-5 text-slate-500">
                    {detail.merchant.description ||
                      "Vendor jasa di LayananPro."}
                  </p>

                  <Link
                    to={`/marketplace/store/${detail.merchant.id}`}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-700 transition hover:bg-blue-100"
                  >
                    Lihat Toko
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:min-w-107.5">
                <MerchantStat
                  label="Rating"
                  value={
                    detail.merchantStats.rating !== null
                      ? detail.merchantStats.rating.toFixed(1)
                      : "-"
                  }
                />

                <MerchantStat
                  label="Pesanan selesai"
                  value={
                    detail.merchantStats.completedOrders > 0
                      ? String(detail.merchantStats.completedOrders)
                      : "-"
                  }
                />

                <MerchantStat
                  label="Hasil pertama"
                  value={
                    detail.merchantStats.avgResponseHours !== null
                      ? `± ${detail.merchantStats.avgResponseHours} jam`
                      : "-"
                  }
                />
              </div>
            </div>
          </section>

          {/* Informasi */}
          <section className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="p-5 sm:p-6">
              <h2 className="text-base font-extrabold text-slate-900">
                Informasi Layanan
              </h2>

              <div className="mt-4 bg-slate-50 px-4 py-1">
                <SpecRow label="Kategori" value={detail.gig.category.name} />

                <SpecRow label="Paket" value={planLabel(detail.gig.plan)} />

                <SpecRow label="Harga" value={formatCurrency(price)} />

                <SpecRow
                  label="Status jasa"
                  value={
                    detail.gig.status === "FEATURED" ||
                    detail.gig.featuredStatus === "FEATURED"
                      ? "Aktif • Featured"
                      : "Aktif"
                  }
                />

                <SpecRow
                  label="Dipublikasikan"
                  value={formatCreatedDate(detail.gig.createdAt)}
                />
              </div>
            </div>

            <div className="border-t border-slate-100 p-5 sm:p-6">
              <h2 className="text-base font-extrabold text-slate-900">
                Deskripsi Layanan
              </h2>

              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                {detail.gig.description}
              </p>
            </div>
          </section>

          {/* Flow */}
          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-extrabold text-slate-900">
              Cara Memesan
            </h2>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <FlowItem
                number="1"
                title="Buat pesanan"
                description="Pesan jasa dengan harga yang tertera."
              />

              <FlowItem
                number="2"
                title="Lakukan pembayaran"
                description="Pembayaran diproses setelah pesanan dibuat."
              />

              <FlowItem
                number="3"
                title="Vendor mengerjakan"
                description="Pantau proses hingga hasil pekerjaan dikirim."
              />
            </div>

            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-emerald-50 px-4 py-3">
              <ShieldCheck
                size={16}
                className="mt-0.5 shrink-0 text-emerald-700"
              />

              <p className="text-xs leading-5 text-emerald-800">
                LayananPro mendukung alur order, pembayaran, pengiriman hasil,
                revisi, penyelesaian pesanan, dan review setelah transaksi
                selesai.
              </p>
            </div>
          </section>

          {/* Related */}
          {detail.relatedServices.length > 0 && (
            <section className="mt-8">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Jasa lain dari vendor ini
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Layanan aktif lain dari {detail.merchant.shopName}.
                  </p>
                </div>

                <Link
                  to="/marketplace"
                  className="shrink-0 text-xs font-bold text-blue-700 transition hover:text-blue-800"
                >
                  Lihat marketplace
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {detail.relatedServices.map((service) => (
                  <RelatedServiceCard key={service.id} service={service} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {toast && (
        <div className="fixed left-1/2 top-20 z-100 -translate-x-1/2 rounded-full bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}
    </>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;

  value: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[105px_minmax(0,1fr)] items-center gap-4 sm:grid-cols-[125px_minmax(0,1fr)]">
      <span className="text-xs text-slate-400">{label}</span>

      <div>{value}</div>
    </div>
  );
}

function MerchantStat({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="border-l border-slate-100 px-4 first:border-l-0">
      <p className="text-[10px] text-slate-400">{label}</p>

      <p className="mt-1 text-sm font-extrabold text-slate-800">{value}</p>
    </div>
  );
}

function SpecRow({
  label,
  value,
}: {
  label: string;

  value: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] border-b border-slate-100 py-3 last:border-b-0 sm:grid-cols-[180px_minmax(0,1fr)]">
      <span className="text-xs font-medium text-slate-400">{label}</span>

      <span className="text-xs font-semibold text-slate-700">{value}</span>
    </div>
  );
}

function FlowItem({
  number,
  title,
  description,
}: {
  number: string;

  title: string;

  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-slate-200 p-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-black text-white">
        {number}
      </div>

      <div>
        <p className="text-xs font-extrabold text-slate-800">{title}</p>

        <p className="mt-1 text-[11px] leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function RelatedServiceCard({
  service,
}: {
  service: MarketplaceRelatedService;
}) {
  return (
    <Link
      to={`/marketplace/${service.id}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {service.mediaUrl ? (
          <img
            src={service.mediaUrl}
            alt={service.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            <ImageIcon size={24} />
          </div>
        )}

        {service.featured && (
          <span className="absolute left-2 top-2 rounded bg-blue-600 px-2 py-1 text-[8px] font-bold uppercase text-white">
            Featured
          </span>
        )}
      </div>

      <div className="p-3">
        <p className="text-[9px] font-bold uppercase tracking-wide text-blue-600">
          {planLabel(service.plan)}
        </p>

        <h3 className="mt-1 line-clamp-2 min-h-9 text-xs font-bold leading-4.5 text-slate-800 transition group-hover:text-blue-700">
          {service.title}
        </h3>

        <p className="mt-3 text-sm font-black text-blue-700">
          {formatCurrency(service.price)}
        </p>
      </div>
    </Link>
  );
}
