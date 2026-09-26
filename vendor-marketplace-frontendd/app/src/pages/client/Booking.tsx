import { useEffect, useState, type ReactNode } from "react";

import { Link, useNavigate, useParams } from "react-router";

import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleX,
  FileCheck2,
  ImageIcon,
  Info,
  Landmark,
  Loader2,
  MessageCircle,
  PackageCheck,
  QrCode,
  ReceiptText,
  ShieldCheck,
  Store,
  Upload,
} from "lucide-react";

import {
  BOOKING_PAYMENT_METHODS,
  cancelDummyBookingOrder,
  completeDummyMidtransPayment,
  getDummyBookingOrder,
  initiateDummyBookingPayment,
  uploadDummyPaymentProof,
} from "~/src/services/booking";

import {
  createDummyMarketplaceChat,
  getMarketplaceServiceDetail,
} from "~/src/services/marketplace";

import type {
  BookingBankCode,
  BookingOrderDraft,
  BookingPaymentMethodId,
} from "~/src/types/booking";

import type { MarketplaceServiceDetail } from "~/src/types/serviceDetail";

import type { GigPlan } from "~/src/types/marketplace";

const MAX_PROOF_SIZE = 5 * 1024 * 1024;

const ALLOWED_PROOF_TYPES = ["image/jpeg", "image/png", "application/pdf"];

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

    month: "long",

    year: "numeric",

    hour: "2-digit",

    minute: "2-digit",
  }).format(date);
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

function initials(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Booking() {
  const params = useParams();

  const navigate = useNavigate();

  const orderId = Number(params.orderId);

  const [order, setOrder] = useState<BookingOrderDraft | null>(null);

  const [detail, setDetail] = useState<MarketplaceServiceDetail | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [actionError, setActionError] = useState("");

  const [selectedMethod, setSelectedMethod] =
    useState<BookingPaymentMethodId>("va");

  const [selectedBank, setSelectedBank] = useState<BookingBankCode | null>(
    null,
  );

  const [proofFile, setProofFile] = useState<File | null>(null);

  const [processing, setProcessing] = useState(false);

  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!Number.isFinite(orderId)) {
        setError("Nomor pesanan tidak valid.");

        setLoading(false);

        return;
      }

      const storedOrder = getDummyBookingOrder(orderId);

      if (!storedOrder) {
        setError("Pesanan tidak ditemukan.");

        setLoading(false);

        return;
      }

      try {
        const service = await getMarketplaceServiceDetail(storedOrder.gigId);

        if (cancelled) {
          return;
        }

        if (!service) {
          setError("Detail layanan tidak ditemukan.");

          return;
        }

        setOrder(storedOrder);

        setDetail(service);

        if (storedOrder.paymentMethod) {
          setSelectedMethod(storedOrder.paymentMethod);
        }

        if (storedOrder.bank) {
          setSelectedBank(storedOrder.bank);
        }
      } catch {
        if (!cancelled) {
          setError("Pesanan tidak dapat dimuat.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const handleMidtransPayment = async () => {
    if (!order || processing) {
      return;
    }

    if (selectedMethod === "va" && !selectedBank) {
      setActionError("Pilih bank Virtual Account terlebih dahulu.");

      return;
    }

    setProcessing(true);

    setActionError("");

    try {
      await initiateDummyBookingPayment(
        order.id,
        selectedMethod,
        selectedBank ?? undefined,
      );

      /**
       * Slicing:
       *
       * Anggap pembayaran Midtrans
       * berhasil.
       *
       * Integrasi nanti bagian ini
       * diganti window.snap.pay(...)
       * lalu status dibaca ulang
       * dari GET /orders/:id.
       */
      const updated = await completeDummyMidtransPayment(order.id);

      setOrder(updated);
    } catch (paymentError) {
      setActionError(
        paymentError instanceof Error
          ? paymentError.message
          : "Pembayaran gagal diproses.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleProofFile = (file: File | null) => {
    setActionError("");

    if (!file) {
      setProofFile(null);

      return;
    }

    if (file.size > MAX_PROOF_SIZE) {
      setProofFile(null);

      setActionError("Ukuran file maksimal 5 MB.");

      return;
    }

    if (!ALLOWED_PROOF_TYPES.includes(file.type)) {
      setProofFile(null);

      setActionError("Format bukti harus JPG, JPEG, PNG, atau PDF.");

      return;
    }

    setProofFile(file);
  };

  const handleUploadProof = async () => {
    if (!order || !proofFile || processing) {
      return;
    }

    setProcessing(true);

    setActionError("");

    try {
      const updated = await uploadDummyPaymentProof(order.id, proofFile);

      setOrder(updated);
    } catch (uploadError) {
      setActionError(
        uploadError instanceof Error
          ? uploadError.message
          : "Bukti pembayaran gagal dikirim.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!order || processing) {
      return;
    }

    const confirmed = window.confirm("Batalkan pesanan ini?");

    if (!confirmed) {
      return;
    }

    setProcessing(true);

    setActionError("");

    try {
      const updated = await cancelDummyBookingOrder(order.id);

      setOrder(updated);
    } catch (cancelError) {
      setActionError(
        cancelError instanceof Error
          ? cancelError.message
          : "Pesanan gagal dibatalkan.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleChat = async () => {
    if (!detail) {
      return;
    }

    await createDummyMarketplaceChat(detail.gig.id);

    window.alert("Channel chat dummy berhasil dibuat.");
  };

  if (loading) {
    return (
      <PageMessage
        icon={<Loader2 size={22} className="animate-spin" />}
        title="Memuat pesanan"
        description="Menyiapkan informasi pembayaran..."
      />
    );
  }

  if (error || !order || !detail) {
    return (
      <PageMessage
        icon={<AlertCircle size={22} />}
        title="Pesanan tidak dapat dibuka"
        description={error || "Pesanan tidak ditemukan."}
        action={
          <Link
            to="/marketplace"
            className="mt-5 inline-flex rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-bold text-white"
          >
            Kembali ke Marketplace
          </Link>
        }
      />
    );
  }

  const isUnpaid = order.status === "UNPAID";

  const isManualWaiting = order.status === "PAID_PENDING_CONFIRMATION";

  const isPaid = order.status === "IN_PROGRESS";

  const isCancelled = order.status === "CANCELLED";

  return (
    <main className="min-h-screen bg-[#f6f7f9] pb-16">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 md:px-10">
        {/* =====================================
            HEADER
           ===================================== */}
        <div className="flex items-center gap-2 text-xs">
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1.5 font-semibold text-slate-500 transition hover:text-blue-700"
          >
            <ArrowLeft size={15} />
            Marketplace
          </Link>

          <ChevronRight size={14} className="text-slate-300" />

          <span className="font-semibold text-slate-800">
            Pesanan #{order.id}
          </span>
        </div>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <ReceiptText size={20} />
              </div>

              <div>
                <h1 className="text-lg font-black text-slate-950">
                  Pembayaran Pesanan
                </h1>

                <p className="mt-1 text-[11px] text-slate-400">
                  Dibuat {formatDate(order.createdAt)}
                </p>
              </div>
            </div>

            <OrderStatusBadge status={order.status} />
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_350px] lg:items-start">
          {/* ==================================
              PAYMENT CONTENT
             ================================== */}
          <div className="space-y-4">
            {isUnpaid && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">
                    Pilih Metode Pembayaran
                  </h2>

                  <p className="mt-1 text-[11px] leading-5 text-slate-400">
                    Pilih metode pembayaran yang paling nyaman.
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <PaymentMethodButton
                    active={selectedMethod === "va"}
                    icon={<Landmark size={18} />}
                    title="Virtual Account"
                    description="Transfer bank otomatis"
                    onClick={() => {
                      setSelectedMethod("va");

                      setActionError("");
                    }}
                  />

                  <PaymentMethodButton
                    active={selectedMethod === "qris"}
                    icon={<QrCode size={18} />}
                    title="QRIS"
                    description="Bank & e-wallet"
                    onClick={() => {
                      setSelectedMethod("qris");

                      setActionError("");
                    }}
                  />

                  <PaymentMethodButton
                    active={selectedMethod === "manual"}
                    icon={<Building2 size={18} />}
                    title="Transfer Manual"
                    description="Upload bukti transfer"
                    onClick={() => {
                      setSelectedMethod("manual");

                      setActionError("");
                    }}
                  />
                </div>

                {selectedMethod === "va" && (
                  <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-extrabold text-slate-800">
                      Pilih Bank
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      Virtual Account akan dibuat oleh Midtrans.
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {BOOKING_PAYMENT_METHODS.find(
                        (method) => method.id === "va",
                      )?.banks?.map((bank) => (
                        <button
                          key={bank.code}
                          type="button"
                          onClick={() => setSelectedBank(bank.code)}
                          className={[
                            "rounded-xl border px-3 py-3 text-xs font-bold transition",
                            selectedBank === bank.code
                              ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-100"
                              : "border-slate-200 bg-white text-slate-600 hover:border-blue-200",
                          ].join(" ")}
                        >
                          {bank.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMethod === "qris" && (
                  <div className="mt-6 flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                      <QrCode size={20} />
                    </div>

                    <div>
                      <p className="text-xs font-extrabold text-slate-800">
                        QRIS Bank & E-Wallet
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        QR pembayaran akan ditampilkan melalui Midtrans setelah
                        kamu melanjutkan pembayaran.
                      </p>
                    </div>
                  </div>
                )}

                {selectedMethod === "manual" && (
                  <ManualPaymentArea
                    proofFile={proofFile}
                    onFileChange={handleProofFile}
                  />
                )}

                {actionError && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-3 text-[11px] text-rose-700">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />

                    {actionError}
                  </div>
                )}

                {selectedMethod !== "manual" ? (
                  <button
                    type="button"
                    disabled={processing}
                    onClick={handleMidtransPayment}
                    className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 text-sm font-bold text-white shadow-md shadow-blue-700/15 transition hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60"
                  >
                    {processing ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <ShieldCheck size={17} />
                    )}

                    {processing ? "Memproses Pembayaran..." : "Bayar Sekarang"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleUploadProof}
                    disabled={!proofFile || processing}
                    className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {processing ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Upload size={17} />
                    )}

                    {processing
                      ? "Mengirim Bukti..."
                      : "Kirim Bukti Pembayaran"}
                  </button>
                )}
              </section>
            )}

            {isManualWaiting && (
              <PaymentResultCard
                tone="amber"
                icon={<FileCheck2 size={24} />}
                title="Bukti pembayaran sudah dikirim"
                description="Pembayaran manual sedang menunggu verifikasi Finance. Pesanan akan mulai diproses setelah pembayaran disetujui."
                detail={
                  order.proofFileName
                    ? `Bukti: ${order.proofFileName}`
                    : undefined
                }
                onFinish={() => navigate("/marketplace")}
              />
            )}

            {isPaid && (
              <PaymentResultCard
                tone="green"
                icon={<CheckCircle2 size={24} />}
                title="Pembayaran berhasil"
                description="Pembayaran sudah dikonfirmasi dan pesanan masuk ke tahap pengerjaan vendor."
                onFinish={() => navigate("/marketplace")}
              />
            )}

            {isCancelled && (
              <PaymentResultCard
                tone="red"
                icon={<CircleX size={24} />}
                title="Pesanan dibatalkan"
                description="Pesanan ini telah dibatalkan dan tidak akan diproses."
                onFinish={() => navigate("/marketplace")}
              />
            )}

            {/* ORDER INFO */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-sm font-extrabold text-slate-900">
                Detail Pesanan
              </h2>

              <div className="mt-5 flex flex-col gap-4 sm:flex-row">
                <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-32 sm:w-44">
                  {!imageFailed && detail.mediaUrl ? (
                    <img
                      src={detail.mediaUrl}
                      alt={detail.gig.title}
                      className="h-full w-full object-cover"
                      onError={() => setImageFailed(true)}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-300">
                      <ImageIcon size={24} />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <span className="rounded-md bg-blue-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-blue-700">
                    Paket {planLabel(detail.gig.plan)}
                  </span>

                  <h3 className="mt-3 text-sm font-extrabold text-slate-900">
                    {detail.gig.title}
                  </h3>

                  <p className="mt-1 text-[11px] text-slate-400">
                    {detail.gig.category.name}
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-[9px] font-black text-blue-700">
                      {initials(detail.merchant.shopName) || (
                        <Store size={14} />
                      )}

                      {detail.merchant.logoUrl && (
                        <img
                          src={detail.merchant.logoUrl}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-[11px] font-bold text-slate-700">
                          {detail.merchant.shopName}
                        </p>

                        <BadgeCheck size={12} className="text-blue-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ==================================
              SUMMARY
             ================================== */}
          <aside className="space-y-3 lg:sticky lg:top-20">
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <PackageCheck size={17} className="text-blue-700" />

                  <h2 className="text-sm font-extrabold text-slate-900">
                    Ringkasan Pembayaran
                  </h2>
                </div>
              </div>

              <div className="p-5">
                <p className="line-clamp-2 text-xs font-extrabold leading-5 text-slate-800">
                  {detail.gig.title}
                </p>

                <div className="mt-5 space-y-3 border-b border-slate-100 pb-5">
                  <SummaryRow
                    label="Harga jasa"
                    value={formatCurrency(order.totalAmount)}
                  />

                  <SummaryRow
                    label="Biaya layanan"
                    value={formatCurrency(order.serviceFee)}
                  />
                </div>

                <div className="flex items-end justify-between gap-4 py-5">
                  <div>
                    <p className="text-xs font-extrabold text-slate-700">
                      Total Pembayaran
                    </p>

                    <p className="mt-1 text-[9px] text-slate-400">1 layanan</p>
                  </div>

                  <p className="text-xl font-black text-blue-700">
                    {formatCurrency(order.paymentTotal)}
                  </p>
                </div>

                <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-3">
                  <ShieldCheck
                    size={14}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />

                  <p className="text-[10px] leading-4 text-slate-500">
                    Pesanan dan pembayaran tercatat pada akunmu.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <MessageCircle size={16} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-extrabold text-slate-800">
                    {detail.merchant.shopName}
                  </p>

                  <p className="mt-0.5 text-[9px] text-slate-400">
                    Ada yang ingin ditanyakan?
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleChat}
                  className="rounded-lg border border-blue-200 px-3 py-2 text-[10px] font-bold text-blue-700 transition hover:bg-blue-50"
                >
                  Chat
                </button>
              </div>
            </section>

            {isUnpaid && (
              <button
                type="button"
                disabled={processing}
                onClick={handleCancel}
                className="w-full rounded-xl px-4 py-3 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
              >
                Batalkan Pesanan
              </button>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

function PaymentMethodButton({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;

  icon: ReactNode;

  title: string;

  description: string;

  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex min-h-24 items-start gap-3 rounded-2xl border p-4 text-left transition",
        active
          ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
          : "border-slate-200 bg-white hover:border-blue-200",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          active ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-500",
        ].join(" ")}
      >
        {active ? <Check size={17} /> : icon}
      </div>

      <div>
        <p className="text-xs font-extrabold text-slate-800">{title}</p>

        <p className="mt-1 text-[9px] leading-4 text-slate-400">
          {description}
        </p>
      </div>
    </button>
  );
}

function ManualPaymentArea({
  proofFile,
  onFileChange,
}: {
  proofFile: File | null;

  onFileChange: (file: File | null) => void;
}) {
  return (
    <div className="mt-6">
      <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4">
        <Info size={16} className="mt-0.5 shrink-0 text-amber-600" />

        <div>
          <p className="text-xs font-extrabold text-amber-900">
            Transfer Manual
          </p>

          <p className="mt-1 text-[10px] leading-5 text-amber-800">
            Lakukan transfer ke rekening platform sesuai instruksi pembayaran,
            kemudian unggah bukti transfer di bawah.
          </p>
        </div>
      </div>

      <label className="mt-4 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center transition hover:border-blue-300 hover:bg-blue-50/30">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-blue-700 shadow-sm">
          <Upload size={20} />
        </div>

        <p className="mt-3 text-xs font-extrabold text-slate-700">
          {proofFile ? proofFile.name : "Unggah bukti pembayaran"}
        </p>

        <p className="mt-1 text-[9px] text-slate-400">
          JPG, JPEG, PNG, PDF • Maks. 5 MB
        </p>

        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
          className="hidden"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <span className="text-slate-500">{label}</span>

      <span className="font-bold text-slate-800">{value}</span>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: BookingOrderDraft["status"] }) {
  const config =
    status === "UNPAID"
      ? {
          label: "Menunggu Pembayaran",

          className: "bg-amber-50 text-amber-700",
        }
      : status === "PAID_PENDING_CONFIRMATION"
        ? {
            label: "Menunggu Verifikasi",

            className: "bg-blue-50 text-blue-700",
          }
        : status === "IN_PROGRESS"
          ? {
              label: "Dalam Pengerjaan",

              className: "bg-emerald-50 text-emerald-700",
            }
          : status === "CANCELLED"
            ? {
                label: "Dibatalkan",

                className: "bg-rose-50 text-rose-700",
              }
            : {
                label: status.replaceAll("_", " "),

                className: "bg-slate-100 text-slate-600",
              };

  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1.5 text-[10px] font-bold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function PaymentResultCard({
  tone,
  icon,
  title,
  description,
  detail,
  onFinish,
}: {
  tone: "green" | "amber" | "red";

  icon: ReactNode;

  title: string;

  description: string;

  detail?: string;

  onFinish: () => void;
}) {
  const style =
    tone === "green"
      ? {
          icon: "bg-emerald-100 text-emerald-700",

          box: "border-emerald-200 bg-emerald-50/40",
        }
      : tone === "amber"
        ? {
            icon: "bg-amber-100 text-amber-700",

            box: "border-amber-200 bg-amber-50/40",
          }
        : {
            icon: "bg-rose-100 text-rose-700",

            box: "border-rose-200 bg-rose-50/40",
          };

  return (
    <section className={`rounded-2xl border p-6 shadow-sm ${style.box}`}>
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${style.icon}`}
      >
        {icon}
      </div>

      <h2 className="mt-4 text-base font-black text-slate-900">{title}</h2>

      <p className="mt-2 max-w-xl text-xs leading-6 text-slate-600">
        {description}
      </p>

      {detail && (
        <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-[10px] font-semibold text-slate-500">
          {detail}
        </p>
      )}

      <button
        type="button"
        onClick={onFinish}
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-blue-700 px-5 text-xs font-bold text-white transition hover:bg-blue-800"
      >
        Selesai
        <ChevronRight size={15} />
      </button>
    </section>
  );
}

function PageMessage({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;

  title: string;

  description: string;

  action?: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f6f7f9] px-4 py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          {icon}
        </div>

        <h1 className="mt-4 text-base font-black text-slate-900">{title}</h1>

        <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>

        {action}
      </div>
    </main>
  );
}
