import { useEffect, useState, type ReactNode } from "react";

import { Link, useParams } from "react-router";

import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleX,
  Clock3,
  Download,
  FileText,
  ImageIcon,
  Loader2,
  MessageCircle,
  PackageCheck,
  ReceiptText,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Star,
  Store,
  Upload,
  X,
} from "lucide-react";

import {
  cancelDummyClientOrder,
  completeDummyClientOrder,
  getDummyClientOrderDetail,
  openDummyClientDispute,
  requestDummyClientRevision,
} from "~/src/services/clientOrders";

import { createDummyMarketplaceChat } from "~/src/services/marketplace";

import {
  clientOrderStep,
  getClientOrderStatusConfig,
  type ClientOrderTone,
} from "~/src/helper/clientOrderStatus";

import OrderReviewDialog from "~/src/components/client/OrderReviewDialog";

import type { ClientOrderView } from "~/src/types/clientOrder";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",

    currency: "IDR",

    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value?: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",

    month: "short",

    year: "numeric",

    hour: "2-digit",

    minute: "2-digit",
  }).format(date);
}

function toneClass(tone: ClientOrderTone): string {
  switch (tone) {
    case "amber":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "blue":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "violet":
      return "bg-violet-50 text-violet-700 border-violet-200";

    case "emerald":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "rose":
      return "bg-rose-50 text-rose-700 border-rose-200";

    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function paymentMethodLabel(order: ClientOrderView): string {
  if (order.paymentMethod === "qris") {
    return "QRIS";
  }

  if (order.paymentMethod === "manual") {
    return "Transfer Manual";
  }

  if (order.paymentMethod === "va") {
    return order.bank
      ? `Virtual Account ${order.bank.toUpperCase()}`
      : "Virtual Account";
  }

  return "Belum dipilih";
}

export default function OrderDetail() {
  const params = useParams();

  const orderId = Number(params.orderId);

  const [order, setOrder] = useState<ClientOrderView | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [busy, setBusy] = useState(false);

  const [reviewOpen, setReviewOpen] = useState(false);

  const [revisionOpen, setRevisionOpen] = useState(false);

  const [disputeOpen, setDisputeOpen] = useState(false);

  const [toast, setToast] = useState("");

  const showToast = (message: string) => {
    setToast(message);

    window.setTimeout(() => setToast(""), 2400);
  };

  const reload = async () => {
    if (!Number.isFinite(orderId)) {
      setError("Nomor pesanan tidak valid.");

      setLoading(false);

      return;
    }

    const result = await getDummyClientOrderDetail(orderId);

    if (!result) {
      setError("Pesanan tidak ditemukan.");
    } else {
      setOrder(result);

      setError("");
    }

    setLoading(false);
  };

  useEffect(() => {
    void reload();
  }, [orderId]);

  const handleChat = async () => {
    if (!order) {
      return;
    }

    await createDummyMarketplaceChat(order.gigId);

    showToast("Channel chat dummy berhasil dibuat.");
  };

  const handleComplete = async () => {
    if (!order || busy) {
      return;
    }

    const confirmed = window.confirm(
      "Terima hasil dan selesaikan pesanan ini?",
    );

    if (!confirmed) {
      return;
    }

    setBusy(true);

    try {
      const updated = await completeDummyClientOrder(order.id);

      setOrder(updated);

      showToast("Pesanan berhasil diselesaikan.");
    } catch (completeError) {
      showToast(
        completeError instanceof Error
          ? completeError.message
          : "Pesanan gagal diselesaikan.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    if (!order) {
      return;
    }

    const confirmed = window.confirm("Batalkan pesanan ini?");

    if (!confirmed) {
      return;
    }

    setBusy(true);

    try {
      const updated = await cancelDummyClientOrder(order.id);

      setOrder(updated);

      showToast("Pesanan dibatalkan.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <PageState
        icon={<Loader2 size={22} className="animate-spin" />}
        title="Memuat Pesanan"
        description="Menyiapkan detail pesanan..."
      />
    );
  }

  if (error || !order) {
    return (
      <PageState
        icon={<AlertCircle size={22} />}
        title="Pesanan Tidak Ditemukan"
        description={error || "Pesanan tidak tersedia."}
      />
    );
  }

  const status = getClientOrderStatusConfig(order.status);

  const canDispute =
    ["IN_PROGRESS", "DELIVERED", "IN_REVISION"].includes(order.status) &&
    !order.dispute;

  return (
    <>
      <main className="min-h-screen bg-[#f6f7f9] pb-16">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 md:px-10">
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/pesanan"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-blue-700"
            >
              <ArrowLeft size={15} />
              Pesanan Saya
            </Link>

            <span
              className={`rounded-full border px-3 py-1.5 text-[10px] font-bold ${toneClass(
                status.tone,
              )}`}
            >
              {status.label}
            </span>
          </div>

          {/* ORDER TITLE */}
          <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Pesanan #{order.id}
                </p>

                <h1 className="mt-2 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                  {order.gigTitle}
                </h1>

                <p className="mt-1 text-xs text-slate-400">
                  Dibuat {formatDateTime(order.createdAt)}
                </p>
              </div>

              <Link
                to={`/marketplace/${order.gigId}`}
                className="inline-flex w-fit items-center gap-1 text-xs font-bold text-blue-700"
              >
                Lihat Jasa
                <ChevronRight size={14} />
              </Link>
            </div>

            <OrderProgress order={order} />
          </section>

          {/* STATUS HERO */}
          <section
            className={`mt-4 rounded-2xl border p-5 ${toneClass(status.tone)}`}
          >
            <div className="flex items-start gap-3">
              <StatusIcon status={order.status} />

              <div>
                <p className="text-sm font-black">{status.label}</p>

                <p className="mt-1 text-[11px] leading-5 opacity-80">
                  {status.description}
                </p>

                {order.status === "DELIVERED" && (
                  <p className="mt-2 text-[10px] font-semibold opacity-70">
                    Jika tidak ada tindakan selama 72 jam setelah hasil dikirim,
                    sistem dapat menyelesaikan pesanan secara otomatis.
                  </p>
                )}
              </div>
            </div>
          </section>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
            {/* =====================================
                LEFT
               ===================================== */}
            <div className="space-y-4">
              {/* SERVICE */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex gap-4">
                  <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-slate-300">
                    {order.imageUrl ? (
                      <img
                        src={order.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon size={24} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="rounded-md bg-blue-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-blue-700">
                      {order.categoryName}
                    </span>

                    <h2 className="mt-2 line-clamp-2 text-sm font-extrabold text-slate-900 sm:text-base">
                      {order.gigTitle}
                    </h2>

                    <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-500">
                      {order.gigDescription}
                    </p>
                  </div>
                </div>
              </section>

              {/* WORK STATE */}
              {(order.status === "IN_PROGRESS" ||
                order.status === "IN_REVISION") && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <Clock3 size={18} />
                    </div>

                    <div>
                      <h2 className="text-sm font-extrabold text-slate-900">
                        {order.status === "IN_REVISION"
                          ? "Revisi Sedang Dikerjakan"
                          : "Vendor Sedang Mengerjakan Pesanan"}
                      </h2>

                      {order.deadline && (
                        <p className="mt-1 text-[11px] text-slate-500">
                          Deadline: {formatDateTime(order.deadline)}
                        </p>
                      )}

                      {order.revisionNote && (
                        <div className="mt-4 rounded-xl bg-slate-50 p-3">
                          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                            Catatan Revisi
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-600">
                            {order.revisionNote}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* DELIVERABLES */}
              {order.deliverables.length > 0 && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900">
                      Hasil Pekerjaan
                    </h2>

                    <p className="mt-1 text-[11px] text-slate-400">
                      File dan pesan yang dikirim oleh vendor.
                    </p>
                  </div>

                  <div className="mt-4 space-y-3">
                    {order.deliverables.map((item, index) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                            <FileText size={17} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-extrabold text-slate-800">
                              Hasil Pekerjaan #{index + 1}
                            </p>

                            <p className="mt-0.5 text-[9px] text-slate-400">
                              {formatDateTime(item.createdAt)}
                            </p>
                          </div>

                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:text-blue-700"
                          >
                            <Download size={15} />
                          </a>
                        </div>

                        {item.message && (
                          <p className="mt-3 text-xs leading-5 text-slate-600">
                            {item.message}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {order.status === "DELIVERED" && (
                    <div className="mt-5 grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setRevisionOpen(true)}
                        className="flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700"
                      >
                        <RotateCcw size={15} />
                        Minta Revisi
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleComplete()}
                        disabled={busy}
                        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 text-xs font-bold text-white transition hover:bg-blue-800 disabled:opacity-60"
                      >
                        <CheckCircle2 size={15} />
                        Terima Pesanan
                      </button>
                    </div>
                  )}
                </section>
              )}

              {/* DISPUTE */}
              {order.dispute && (
                <section className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5">
                  <div className="flex items-start gap-3">
                    <ShieldAlert
                      size={19}
                      className="mt-0.5 shrink-0 text-rose-600"
                    />

                    <div>
                      <h2 className="text-sm font-extrabold text-rose-900">
                        Detail Sengketa
                      </h2>

                      <p className="mt-2 text-xs leading-5 text-rose-800">
                        {order.dispute.reason}
                      </p>

                      {order.dispute.evidenceFileName && (
                        <p className="mt-2 text-[10px] text-rose-600">
                          Bukti: {order.dispute.evidenceFileName}
                        </p>
                      )}

                      <span className="mt-3 inline-flex rounded-full bg-white px-2.5 py-1 text-[9px] font-bold text-rose-700">
                        {order.dispute.status}
                      </span>
                    </div>
                  </div>
                </section>
              )}

              {/* REVIEW */}
              {order.review && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-extrabold text-slate-900">
                    Ulasan Kamu
                  </h2>

                  <div className="mt-3 flex gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star
                        key={value}
                        size={17}
                        className={
                          value <= order.review!.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }
                      />
                    ))}
                  </div>

                  {order.review.comment && (
                    <p className="mt-3 text-xs leading-6 text-slate-600">
                      {order.review.comment}
                    </p>
                  )}
                </section>
              )}
            </div>

            {/* =====================================
                RIGHT
               ===================================== */}
            <aside className="space-y-3 lg:sticky lg:top-20">
              {/* SUMMARY */}
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <ReceiptText size={16} className="text-blue-700" />

                    <h2 className="text-sm font-extrabold text-slate-900">
                      Ringkasan Pesanan
                    </h2>
                  </div>
                </div>

                <div className="p-5">
                  <div className="space-y-3">
                    <SummaryRow
                      label="Harga jasa"
                      value={formatCurrency(order.totalAmount)}
                    />

                    {order.serviceFee > 0 && (
                      <SummaryRow
                        label="Biaya layanan"
                        value={formatCurrency(order.serviceFee)}
                      />
                    )}
                  </div>

                  <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-5">
                    <span className="text-xs font-bold text-slate-700">
                      Total
                    </span>

                    <span className="text-lg font-black text-blue-700">
                      {formatCurrency(order.paymentTotal)}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                    <InfoLine
                      label="Metode"
                      value={paymentMethodLabel(order)}
                    />

                    <InfoLine
                      label="Dibuat"
                      value={formatDateTime(order.createdAt)}
                    />

                    {order.deadline && (
                      <InfoLine
                        label="Deadline"
                        value={formatDateTime(order.deadline)}
                      />
                    )}

                    {order.deliveredAt && (
                      <InfoLine
                        label="Hasil dikirim"
                        value={formatDateTime(order.deliveredAt)}
                      />
                    )}
                  </div>
                </div>
              </section>

              {/* MERCHANT */}
              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-blue-50 text-blue-700">
                    <Store size={17} />

                    {order.merchant.logoUrl && (
                      <img
                        src={order.merchant.logoUrl}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="truncate text-xs font-extrabold text-slate-800">
                        {order.merchant.shopName}
                      </p>

                      <BadgeCheck size={13} className="text-blue-600" />
                    </div>

                    <p className="mt-0.5 text-[9px] text-slate-400">
                      Vendor LayananPro
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => void handleChat()}
                    className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-blue-200 text-[10px] font-bold text-blue-700 transition hover:bg-blue-50"
                  >
                    <MessageCircle size={13} />
                    Chat
                  </button>

                  <Link
                    to={`/marketplace/store/${order.merchant.id}`}
                    className="flex h-10 items-center justify-center rounded-xl border border-slate-200 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50"
                  >
                    Lihat Toko
                  </Link>
                </div>
              </section>

              {/* ACTIONS */}
              <OrderActions
                order={order}
                busy={busy}
                onCancel={() => void handleCancel()}
                onReview={() => setReviewOpen(true)}
              />

              {canDispute && (
                <button
                  type="button"
                  onClick={() => setDisputeOpen(true)}
                  className="w-full rounded-xl px-4 py-3 text-[10px] font-bold text-rose-600 transition hover:bg-rose-50"
                >
                  Ajukan Sengketa
                </button>
              )}
            </aside>
          </div>
        </div>
      </main>

      {reviewOpen && (
        <OrderReviewDialog
          order={order}
          onClose={() => setReviewOpen(false)}
          onSubmitted={() => {
            setReviewOpen(false);

            void reload();

            showToast("Ulasan berhasil dikirim.");
          }}
        />
      )}

      {revisionOpen && (
        <RevisionDialog
          onClose={() => setRevisionOpen(false)}
          onSubmit={async (note) => {
            setBusy(true);

            try {
              const updated = await requestDummyClientRevision(order.id, note);

              setOrder(updated);

              setRevisionOpen(false);

              showToast("Permintaan revisi dikirim.");
            } finally {
              setBusy(false);
            }
          }}
        />
      )}

      {disputeOpen && (
        <DisputeDialog
          onClose={() => setDisputeOpen(false)}
          onSubmit={async (reason, file) => {
            setBusy(true);

            try {
              const updated = await openDummyClientDispute(
                order.id,
                reason,
                file,
              );

              setOrder(updated);

              setDisputeOpen(false);

              showToast("Sengketa berhasil diajukan.");
            } finally {
              setBusy(false);
            }
          }}
        />
      )}

      {toast && (
        <div className="fixed left-1/2 top-20 z-100 -translate-x-1/2 rounded-full bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}
    </>
  );
}

function OrderProgress({ order }: { order: ClientOrderView }) {
  const current = clientOrderStep(order.status);

  const steps = [
    "Dibuat",
    "Pembayaran",
    "Dikerjakan",
    "Hasil Dikirim",
    "Selesai",
  ];

  return (
    <div className="mt-7 overflow-x-auto">
      <div className="flex min-w-[620px] items-start">
        {steps.map((step, index) => {
          const completed = index < current;

          const active = index === current;

          return (
            <div key={step} className="flex flex-1 items-start">
              <div className="flex flex-col items-center text-center">
                <div
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-black",
                    completed
                      ? "border-blue-700 bg-blue-700 text-white"
                      : active
                        ? "border-blue-700 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-300",
                  ].join(" ")}
                >
                  {completed ? <Check size={15} /> : index + 1}
                </div>

                <p
                  className={[
                    "mt-2 text-[10px] font-bold",
                    completed || active ? "text-slate-700" : "text-slate-300",
                  ].join(" ")}
                >
                  {step}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={[
                    "mt-[17px] h-0.5 flex-1",
                    index < current ? "bg-blue-700" : "bg-slate-200",
                  ].join(" ")}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: ClientOrderView["status"] }) {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle2 size={20} />;

    case "CANCELLED":
    case "REFUNDED":
      return <CircleX size={20} />;

    case "DISPUTE_IN_PROGRESS":
      return <ShieldAlert size={20} />;

    default:
      return <Clock3 size={20} />;
  }
}

function OrderActions({
  order,

  busy,

  onCancel,

  onReview,
}: {
  order: ClientOrderView;

  busy: boolean;

  onCancel: () => void;

  onReview: () => void;
}) {
  if (order.status === "UNPAID") {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Link
          to={`/booking/${order.id}`}
          className="flex h-11 items-center justify-center rounded-xl bg-blue-700 text-xs font-bold text-white"
        >
          Lanjutkan Pembayaran
        </Link>

        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="mt-2 w-full rounded-xl py-2.5 text-[10px] font-bold text-rose-600 hover:bg-rose-50"
        >
          Batalkan Pesanan
        </button>
      </section>
    );
  }

  if (order.status === "PAID_PENDING_CONFIRMATION") {
    return (
      <Link
        to={`/booking/${order.id}`}
        className="flex h-11 items-center justify-center rounded-xl border border-blue-200 bg-white text-xs font-bold text-blue-700 shadow-sm"
      >
        Lihat Pembayaran
      </Link>
    );
  }

  if (order.status === "COMPLETED" && !order.review) {
    return (
      <button
        type="button"
        onClick={onReview}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-xs font-bold text-white"
      >
        <Star size={14} />
        Beri Ulasan
      </button>
    );
  }

  return null;
}

function SummaryRow({
  label,

  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="flex justify-between gap-4 text-xs">
      <span className="text-slate-500">{label}</span>

      <span className="font-bold text-slate-800">{value}</span>
    </div>
  );
}

function InfoLine({
  label,

  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-[10px]">
      <span className="text-slate-400">{label}</span>

      <span className="max-w-[190px] text-right font-semibold text-slate-600">
        {value}
      </span>
    </div>
  );
}

function RevisionDialog({
  onClose,

  onSubmit,
}: {
  onClose: () => void;

  onSubmit: (note: string) => Promise<void>;
}) {
  const [note, setNote] = useState("");

  const [error, setError] = useState("");

  const submit = async () => {
    if (!note.trim()) {
      setError("Catatan revisi wajib diisi.");

      return;
    }

    try {
      await onSubmit(note);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Revisi gagal dikirim.",
      );
    }
  };

  return (
    <ModalShell title="Minta Revisi" onClose={onClose}>
      <p className="text-xs leading-5 text-slate-500">
        Jelaskan bagian yang perlu diperbaiki oleh vendor.
      </p>

      <textarea
        value={note}
        maxLength={1000}
        onChange={(event) => setNote(event.target.value)}
        rows={5}
        placeholder="Contoh: Mohon ubah warna utama dan rapikan bagian header..."
        className="mt-4 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />

      <p className="mt-1 text-right text-[9px] text-slate-400">
        {note.length}/1000
      </p>

      {error && (
        <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>
      )}

      <button
        type="button"
        onClick={() => void submit()}
        className="mt-4 h-11 w-full rounded-xl bg-blue-700 text-xs font-bold text-white"
      >
        Kirim Permintaan Revisi
      </button>
    </ModalShell>
  );
}

function DisputeDialog({
  onClose,

  onSubmit,
}: {
  onClose: () => void;

  onSubmit: (reason: string, file: File) => Promise<void>;
}) {
  const [reason, setReason] = useState("");

  const [file, setFile] = useState<File | null>(null);

  const [error, setError] = useState("");

  const submit = async () => {
    if (!reason.trim()) {
      setError("Alasan sengketa wajib diisi.");

      return;
    }

    if (!file) {
      setError("Bukti sengketa wajib diunggah.");

      return;
    }

    try {
      await onSubmit(reason, file);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Sengketa gagal diajukan.",
      );
    }
  };

  return (
    <ModalShell title="Ajukan Sengketa" onClose={onClose}>
      <div className="flex items-start gap-2 rounded-xl bg-rose-50 p-3">
        <ShieldAlert size={15} className="mt-0.5 shrink-0 text-rose-600" />

        <p className="text-[10px] leading-5 text-rose-700">
          Gunakan sengketa bila terdapat masalah serius pada pengerjaan dan
          sertakan bukti pendukung.
        </p>
      </div>

      <label className="mt-4 block">
        <span className="text-xs font-bold text-slate-700">
          Alasan Sengketa
        </span>

        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={4}
          className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <Upload size={20} className="text-blue-700" />

        <p className="mt-2 text-xs font-bold text-slate-700">
          {file ? file.name : "Unggah Bukti"}
        </p>

        <p className="mt-1 text-[9px] text-slate-400">
          JPG, PNG, PDF · Maks. 5 MB
        </p>

        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
          className="hidden"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </label>

      {error && (
        <p className="mt-3 text-xs font-semibold text-rose-600">{error}</p>
      )}

      <button
        type="button"
        onClick={() => void submit()}
        className="mt-5 h-11 w-full rounded-xl bg-rose-600 text-xs font-bold text-white"
      >
        Ajukan Sengketa
      </button>
    </ModalShell>
  );
}

function ModalShell({
  title,

  children,

  onClose,
}: {
  title: string;

  children: ReactNode;

  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-100 flex items-end justify-center bg-slate-950/40 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={17} />
          </button>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function PageState({
  icon,

  title,

  description,
}: {
  icon: ReactNode;

  title: string;

  description: string;
}) {
  return (
    <main className="min-h-screen bg-[#f6f7f9] p-6">
      <div className="mx-auto mt-16 max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          {icon}
        </div>

        <h1 className="mt-4 text-base font-black text-slate-900">{title}</h1>

        <p className="mt-2 text-xs text-slate-500">{description}</p>

        <Link
          to="/pesanan"
          className="mt-5 inline-flex text-xs font-bold text-blue-700"
        >
          Kembali ke Pesanan
        </Link>
      </div>
    </main>
  );
}
