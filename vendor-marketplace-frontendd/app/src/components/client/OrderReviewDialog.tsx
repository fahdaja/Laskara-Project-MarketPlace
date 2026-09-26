import { useState } from "react";

import { ImageIcon, Loader2, Star, X } from "lucide-react";

import { submitDummyClientReview } from "~/src/services/clientOrders";

import type { ClientOrderView } from "~/src/types/clientOrder";

interface OrderReviewDialogProps {
  order: ClientOrderView;

  onClose: () => void;

  onSubmitted: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: "Sangat Kurang",
  2: "Kurang",
  3: "Cukup",
  4: "Baik",
  5: "Sangat Baik",
};

export default function OrderReviewDialog({
  order,

  onClose,

  onSubmitted,
}: OrderReviewDialogProps) {
  const [rating, setRating] = useState(0);

  const [hover, setHover] = useState(0);

  const [comment, setComment] = useState("");

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState("");

  const activeRating = hover || rating;

  const submit = async () => {
    if (rating < 1) {
      setError("Pilih rating terlebih dahulu.");

      return;
    }

    setBusy(true);

    setError("");

    try {
      await submitDummyClientReview(order.id, rating, comment);

      onSubmitted();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Ulasan gagal dikirim.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-dialog-title"
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* ===================================
            HEADER
           =================================== */}
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <h2
              id="review-dialog-title"
              className="text-lg font-black tracking-tight text-slate-950"
            >
              Nilai Jasa
            </h2>

            <p className="mt-1 text-[11px] text-slate-400">
              Bagikan pengalamanmu setelah pesanan selesai.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-5 py-5 sm:px-6">
          {/* =================================
              ORDER ID
             ================================= */}
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-semibold text-slate-400">
              Pesanan #{order.id}
            </span>

            <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-bold text-emerald-700">
              Pesanan Selesai
            </span>
          </div>

          {/* =================================
              SERVICE
             ================================= */}
          <div className="mt-4 flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white text-slate-300">
              {order.imageUrl ? (
                <img
                  src={order.imageUrl}
                  alt={order.gigTitle}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <ImageIcon size={21} />
              )}
            </div>

            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-extrabold leading-5 text-slate-900">
                {order.gigTitle}
              </p>

              <p className="mt-1 truncate text-[10px] font-semibold text-slate-400">
                {order.merchant.shopName}
              </p>

              <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-blue-600">
                {order.categoryName}
              </p>
            </div>
          </div>

          {/* =================================
              RATING
             ================================= */}
          <section className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-extrabold text-slate-800">
                  Kualitas Jasa
                </h3>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  Berikan penilaian keseluruhan untuk jasa ini.
                </p>
              </div>

              {activeRating > 0 && (
                <span className="rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-700">
                  {RATING_LABELS[activeRating]}
                </span>
              )}
            </div>

            <div
              className="mt-5 flex items-center justify-center gap-2 sm:gap-3"
              onMouseLeave={() => setHover(0)}
            >
              {[1, 2, 3, 4, 5].map((value) => {
                const selected = value <= activeRating;

                return (
                  <button
                    key={value}
                    type="button"
                    aria-label={`${value} bintang`}
                    onClick={() => {
                      setRating(value);

                      setError("");
                    }}
                    onMouseEnter={() => setHover(value)}
                    className="rounded-xl p-1 transition hover:scale-110 active:scale-95"
                  >
                    <Star
                      size={35}
                      strokeWidth={1.8}
                      className={
                        selected
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200"
                      }
                    />
                  </button>
                );
              })}
            </div>

            {rating === 0 && (
              <p className="mt-2 text-center text-[10px] text-slate-400">
                Ketuk bintang untuk memberikan rating.
              </p>
            )}
          </section>

          {/* =================================
              COMMENT
             ================================= */}
          <section className="mt-6 rounded-2xl bg-slate-50 p-4">
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-xs font-extrabold text-slate-800">
                Ceritakan Pengalamanmu
              </h3>

              <span className="text-[9px] font-medium text-slate-400">
                opsional
              </span>
            </div>

            <p className="mt-1 text-[10px] leading-5 text-slate-400">
              Kamu bisa membahas kualitas hasil, komunikasi vendor, atau proses
              pengerjaan.
            </p>

            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={5}
              placeholder="Bagaimana pengalamanmu menggunakan jasa ini?"
              className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />
          </section>

          {error && (
            <div className="mt-4 rounded-xl bg-rose-50 px-3.5 py-3 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          <p className="mt-4 text-center text-[9px] leading-4 text-slate-400">
            Setiap pesanan hanya dapat diberikan satu ulasan.
          </p>
        </div>

        {/* ===================================
            FOOTER
           =================================== */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-white px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="h-11 rounded-xl px-5 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
          >
            Nanti Saja
          </button>

          <button
            type="button"
            onClick={() => void submit()}
            disabled={busy || rating === 0}
            className="inline-flex h-11 min-w-36 items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 text-xs font-bold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            {busy && <Loader2 size={15} className="animate-spin" />}

            {busy ? "Mengirim..." : "Kirim Ulasan"}
          </button>
        </div>
      </div>
    </div>
  );
}
