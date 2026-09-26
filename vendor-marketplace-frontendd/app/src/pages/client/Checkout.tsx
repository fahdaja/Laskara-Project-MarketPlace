import { useState } from "react";

import {
  Link,
  useLoaderData,
  type LoaderFunctionArgs,
  useNavigate,
} from "react-router";

import {
  ArrowLeft,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  ImageIcon,
  Info,
  Mail,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Store,
  UserRound,
} from "lucide-react";

import {
  createDummyMarketplaceOrder,
  getMarketplaceServiceDetail,
} from "~/src/services/marketplace";

import { getCurrentClient } from "~/src/services/auth";

import type { MarketplaceServiceDetail } from "~/src/types/serviceDetail";

import type { GigPlan } from "~/src/types/marketplace";

import {
  BOOKING_SERVICE_FEE,
  persistDummyBookingOrder,
} from "~/src/services/booking";

export async function loader({
  params,
}: LoaderFunctionArgs): Promise<MarketplaceServiceDetail> {
  const gigId = Number(params.gigId);

  if (!Number.isFinite(gigId)) {
    throw new Response("Layanan tidak ditemukan.", {
      status: 404,
    });
  }

  const detail = await getMarketplaceServiceDetail(gigId);

  if (!detail) {
    throw new Response("Layanan tidak ditemukan.", {
      status: 404,
    });
  }

  return detail;
}

function parseMoney(value: string | number): number {
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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
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

function initials(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Checkout() {
  const navigate = useNavigate();

  const detail = useLoaderData() as MarketplaceServiceDetail;

  const client = getCurrentClient();

  const [imageFailed, setImageFailed] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const price = parseMoney(detail.gig.price);

  const paymentTotal = price + BOOKING_SERVICE_FEE;

  const canOrder =
    (detail.gig.status === "ACTIVE" || detail.gig.status === "FEATURED") &&
    detail.merchant.status === "ACTIVE";

  const handleCreateOrder = async () => {
    if (submitting || !canOrder) {
      return;
    }

    setSubmitting(true);

    try {
      const result = await createDummyMarketplaceOrder({
        gigId: detail.gig.id,

        price,
      });

      persistDummyBookingOrder({
        id: result.id,

        gigId: detail.gig.id,

        merchantId: detail.merchant.id,

        totalAmount: price,

        serviceFee: BOOKING_SERVICE_FEE,

        paymentTotal: price + BOOKING_SERVICE_FEE,

        status: "UNPAID",

        createdAt: result.createdAt,

        paymentMethod: null,

        bank: null,

        proofFileName: null,
      });

      navigate(`/booking/${result.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f7f9] pb-16">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:px-12">
        {/* ============================================
            BREADCRUMB
           ============================================ */}
        <div className="mb-5 flex items-center gap-2 text-xs">
          <Link
            to={`/marketplace/${detail.gig.id}`}
            className="inline-flex items-center gap-1.5 font-semibold text-slate-500 transition hover:text-blue-700"
          >
            <ArrowLeft size={15} />
            Detail Jasa
          </Link>

          <ChevronRight size={14} className="text-slate-300" />

          <span className="font-semibold text-slate-800">Checkout</span>
        </div>

        {/* ============================================
            HEADING + STEPPER
           ============================================ */}
        <section className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-600">
              Konfirmasi Pesanan
            </p>

            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Checkout
            </h1>

            <p className="mt-2 max-w-xl text-xs leading-5 text-slate-500">
              Periksa kembali layanan yang akan dipesan sebelum membuat pesanan
              dan melanjutkan ke pembayaran.
            </p>
          </div>

          <CheckoutSteps />
        </section>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_370px] lg:items-start">
          {/* ==========================================
              LEFT CONTENT
             ========================================== */}
          <div className="space-y-4">
            {/* SERVICE */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">
                    Layanan yang dipesan
                  </h2>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Pastikan jasa dan harga sudah sesuai.
                  </p>
                </div>

                <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                  1 Layanan
                </span>
              </div>

              <div className="p-5 sm:p-6">
                {/* MERCHANT */}
                <div className="mb-5 flex items-center gap-3">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-blue-50 text-[10px] font-black text-blue-700">
                    {initials(detail.merchant.shopName) || <Store size={16} />}

                    {detail.merchant.logoUrl && (
                      <img
                        src={detail.merchant.logoUrl}
                        alt={detail.merchant.shopName}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-extrabold text-slate-800">
                        {detail.merchant.shopName}
                      </p>

                      <BadgeCheck size={14} className="text-blue-600" />
                    </div>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Vendor LayananPro
                    </p>
                  </div>
                </div>

                {/* PRODUCT ROW */}
                <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-3 sm:flex-row sm:items-center">
                  <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-slate-200 sm:h-32 sm:w-44">
                    {!imageFailed && detail.mediaUrl ? (
                      <img
                        src={detail.mediaUrl}
                        alt={detail.gig.title}
                        className="h-full w-full object-cover"
                        onError={() => setImageFailed(true)}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        <ImageIcon size={24} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-md bg-blue-100 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-blue-700">
                        {detail.gig.category.name}
                      </span>

                      <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                        Paket {planLabel(detail.gig.plan)}
                      </span>
                    </div>

                    <h3 className="mt-3 text-sm font-extrabold leading-5 text-slate-900 sm:text-base">
                      {detail.gig.title}
                    </h3>

                    <p className="mt-1 line-clamp-2 max-w-xl text-[11px] leading-5 text-slate-500">
                      {detail.gig.description}
                    </p>
                  </div>

                  <div className="border-t border-slate-200 pt-3 text-left sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0 sm:text-right">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      Harga jasa
                    </p>

                    <p className="mt-1 whitespace-nowrap text-base font-black text-blue-700">
                      {formatCurrency(price)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* CLIENT DATA */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">
                    Data Pemesan
                  </h2>

                  <p className="mt-1 text-[11px] leading-5 text-slate-400">
                    Data akun ini akan digunakan pada pesanan dan proses
                    pembayaran.
                  </p>
                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <UserRound size={17} />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    Nama
                  </p>

                  <div className="mt-1.5 flex items-center gap-2">
                    <UserRound size={14} className="text-slate-400" />

                    <p className="truncate text-xs font-bold text-slate-800">
                      {client.fullName}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    Email
                  </p>

                  <div className="mt-1.5 flex items-center gap-2">
                    <Mail size={14} className="text-slate-400" />

                    <p className="truncate text-xs font-bold text-slate-800">
                      {client.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-blue-50 px-4 py-3">
                <Info size={15} className="mt-0.5 shrink-0 text-blue-600" />

                <p className="text-[11px] leading-5 text-blue-800">
                  Data pemesan mengikuti akun yang sedang masuk. Tidak perlu
                  mengisi kembali informasi kontak pada checkout.
                </p>
              </div>
            </section>

            {/* FLOW */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-sm font-extrabold text-slate-900">
                Setelah Checkout
              </h2>

              <p className="mt-1 text-[11px] text-slate-400">
                Pesanan belum langsung dibayar pada halaman ini.
              </p>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <FlowCard
                  number="1"
                  title="Pesanan Dibuat"
                  description="Pesanan dibuat dengan status belum dibayar."
                />

                <FlowCard
                  number="2"
                  title="Pilih Pembayaran"
                  description="Pilih metode pembayaran pada tahap berikutnya."
                />

                <FlowCard
                  number="3"
                  title="Mulai Diproses"
                  description="Setelah pembayaran dikonfirmasi, pesanan mulai diproses."
                />
              </div>
            </section>
          </div>

          {/* ==========================================
              ORDER SUMMARY
             ========================================== */}
          <aside className="lg:sticky lg:top-20">
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={17} className="text-blue-700" />

                  <h2 className="text-sm font-extrabold text-slate-900">
                    Ringkasan Pesanan
                  </h2>
                </div>
              </div>

              <div className="p-5">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-[10px] font-semibold text-slate-400">
                    Layanan
                  </p>

                  <p className="mt-1 line-clamp-2 text-xs font-extrabold leading-5 text-slate-800">
                    {detail.gig.title}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500">
                    <PackageCheck size={13} />
                    Paket {planLabel(detail.gig.plan)}
                  </div>
                </div>

                {/* COST */}
                <div className="mt-5 space-y-3 border-b border-slate-100 pb-5">
                  <PriceRow label="Harga jasa" value={price} />

                  <PriceRow label="Biaya layanan" value={BOOKING_SERVICE_FEE} />
                </div>

                <div className="flex items-end justify-between gap-4 py-5">
                  <div>
                    <p className="text-xs font-bold text-slate-700">
                      Total Pembayaran
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Dibayar pada tahap berikutnya
                    </p>
                  </div>

                  <p className="text-xl font-black tracking-tight text-blue-700">
                    {formatCurrency(paymentTotal)}
                  </p>
                </div>

                {/* SERVICE FEE INFO */}
                <div className="mb-4 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-3">
                  <Info size={14} className="mt-0.5 shrink-0 text-amber-600" />

                  <p className="text-[10px] leading-4 text-amber-800">
                    Biaya layanan akan ditambahkan ketika pembayaran diproses.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCreateOrder}
                  disabled={submitting || !canOrder}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-bold text-white shadow-md shadow-blue-700/15 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  {submitting ? "Membuat Pesanan..." : "Buat Pesanan"}
                </button>
              </div>
            </section>

            {!canOrder && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[11px] leading-5 text-amber-800">
                Layanan tidak dapat dipesan pada kondisi toko atau layanan saat
                ini.
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

function CheckoutSteps() {
  return (
    <div className="flex items-center gap-2">
      <StepItem number="1" label="Checkout" active />

      <div className="h-px w-6 bg-slate-200 sm:w-10" />

      <StepItem number="2" label="Pembayaran" />

      <div className="h-px w-6 bg-slate-200 sm:w-10" />

      <StepItem number="3" label="Selesai" />
    </div>
  );
}

function StepItem({
  number,
  label,
  active = false,
}: {
  number: string;

  label: string;

  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={[
          "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black",
          active ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-500",
        ].join(" ")}
      >
        {active ? <Check size={13} /> : number}
      </div>

      <span
        className={[
          "hidden text-[10px] font-bold sm:inline",
          active ? "text-blue-700" : "text-slate-400",
        ].join(" ")}
      >
        {label}
      </span>
    </div>
  );
}

function PriceRow({
  label,
  value,
}: {
  label: string;

  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <span className="text-slate-500">{label}</span>

      <span className="font-bold text-slate-800">{formatCurrency(value)}</span>
    </div>
  );
}

function FlowCard({
  number,
  title,
  description,
}: {
  number: string;

  title: string;

  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 text-[10px] font-black text-white">
        {number}
      </div>

      <div>
        <p className="text-xs font-extrabold text-slate-800">{title}</p>

        <p className="mt-1 text-[10px] leading-4 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}
