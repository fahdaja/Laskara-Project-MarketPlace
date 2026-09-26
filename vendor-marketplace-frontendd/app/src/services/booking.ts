import type {
  BookingBankCode,
  BookingOrderDraft,
  BookingPaymentMethod,
  BookingPaymentMethodId,
} from "~/src/types/booking";

export const BOOKING_SERVICE_FEE = 25_000;

export const BOOKING_PAYMENT_METHODS: BookingPaymentMethod[] = [
  {
    id: "va",

    name: "Virtual Account",

    type: "midtrans",

    description: "Pembayaran otomatis melalui Virtual Account bank.",

    banks: [
      {
        code: "bca",
        name: "BCA",
      },

      {
        code: "bri",
        name: "BRI",
      },

      {
        code: "bni",
        name: "BNI",
      },

      {
        code: "mandiri",
        name: "Mandiri",
      },
    ],
  },

  {
    id: "qris",

    name: "QRIS",

    type: "midtrans",

    description:
      "Bayar menggunakan QRIS melalui mobile banking atau e-wallet yang didukung.",
  },

  {
    id: "manual",

    name: "Transfer Manual",

    type: "manual",

    description: "Transfer ke rekening platform lalu unggah bukti pembayaran.",
  },
];

function orderStorageKey(orderId: number): string {
  return `layananpro_order_${orderId}`;
}

function wait(duration = 650): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

function normalizeOrder(
  value: Partial<BookingOrderDraft>,
): BookingOrderDraft | null {
  if (typeof value.id !== "number" || typeof value.gigId !== "number") {
    return null;
  }

  const totalAmount = Number(value.totalAmount) || 0;

  const serviceFee = Number(value.serviceFee) || BOOKING_SERVICE_FEE;

  return {
    id: value.id,

    gigId: value.gigId,

    merchantId: Number(value.merchantId) || 0,

    totalAmount,

    serviceFee,

    paymentTotal: Number(value.paymentTotal) || totalAmount + serviceFee,

    status: value.status ?? "UNPAID",

    createdAt: value.createdAt ?? new Date().toISOString(),

    paymentMethod: value.paymentMethod ?? null,

    bank: value.bank ?? null,

    proofFileName: value.proofFileName ?? null,
  };
}

export function persistDummyBookingOrder(order: BookingOrderDraft): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(orderStorageKey(order.id), JSON.stringify(order));

  localStorage.setItem(
    "layananpro_pending_payment_order",
    JSON.stringify(order),
  );
}

export function getDummyBookingOrder(
  orderId: number,
): BookingOrderDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  const keys = [
    orderStorageKey(orderId),

    "layananpro_pending_payment_order",

    "layananpro_dummy_order",
  ];

  for (const key of keys) {
    const raw = localStorage.getItem(key);

    if (!raw) {
      continue;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<BookingOrderDraft>;

      const normalized = normalizeOrder(parsed);

      if (normalized && normalized.id === orderId) {
        persistDummyBookingOrder(normalized);

        return normalized;
      }
    } catch {
      // Abaikan storage rusak.
    }
  }

  return null;
}

function updateOrder(
  orderId: number,
  changes: Partial<BookingOrderDraft>,
): BookingOrderDraft | null {
  const current = getDummyBookingOrder(orderId);

  if (!current) {
    return null;
  }

  const updated: BookingOrderDraft = {
    ...current,

    ...changes,
  };

  persistDummyBookingOrder(updated);

  return updated;
}

/**
 * Dummy dari:
 *
 * POST /orders/:id/initiate-payment
 *
 * Integrasi nanti:
 *
 * {
 *   paymentMethod: "qris"
 * }
 *
 * atau
 *
 * {
 *   paymentMethod: "va",
 *   bank: "bca"
 * }
 */
export async function initiateDummyBookingPayment(
  orderId: number,
  method: BookingPaymentMethodId,
  bank?: BookingBankCode,
) {
  await wait();

  const order = updateOrder(orderId, {
    paymentMethod: method,

    bank: bank ?? null,
  });

  if (!order) {
    throw new Error("Pesanan tidak ditemukan.");
  }

  return {
    order,

    snapToken: `dummy-snap-${orderId}`,

    clientKey: "dummy-midtrans-client-key",

    midtransOrderId: `order-${orderId}-${Date.now()}`,
  };
}

/**
 * Hanya untuk membuat slicing Midtrans
 * bisa melalui seluruh flow.
 *
 * Pada integrasi sebenarnya status order
 * tidak diubah frontend.
 *
 * Webhook Midtrans-lah yang akan
 * mengubah order menjadi IN_PROGRESS.
 */
export async function completeDummyMidtransPayment(
  orderId: number,
): Promise<BookingOrderDraft> {
  await wait(850);

  const order = updateOrder(orderId, {
    status: "IN_PROGRESS",
  });

  if (!order) {
    throw new Error("Pesanan tidak ditemukan.");
  }

  return order;
}

/**
 * Dummy dari:
 *
 * POST /orders/:id/upload-payment-proof
 */
export async function uploadDummyPaymentProof(
  orderId: number,
  file: File,
): Promise<BookingOrderDraft> {
  await wait(850);

  const order = updateOrder(orderId, {
    paymentMethod: "manual",

    proofFileName: file.name,

    status: "PAID_PENDING_CONFIRMATION",
  });

  if (!order) {
    throw new Error("Pesanan tidak ditemukan.");
  }

  return order;
}

/**
 * Dummy dari:
 *
 * PATCH /orders/:id/cancel
 */
export async function cancelDummyBookingOrder(
  orderId: number,
): Promise<BookingOrderDraft> {
  await wait(450);

  const current = getDummyBookingOrder(orderId);

  if (!current) {
    throw new Error("Pesanan tidak ditemukan.");
  }

  if (current.status !== "UNPAID") {
    throw new Error("Hanya pesanan yang belum dibayar yang dapat dibatalkan.");
  }

  const updated = updateOrder(orderId, {
    status: "CANCELLED",
  });

  if (!updated) {
    throw new Error("Pesanan tidak ditemukan.");
  }

  return updated;
}
