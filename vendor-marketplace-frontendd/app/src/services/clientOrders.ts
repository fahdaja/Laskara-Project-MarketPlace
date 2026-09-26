import {
  BOOKING_SERVICE_FEE,
  cancelDummyBookingOrder,
  getDummyBookingOrder,
  persistDummyBookingOrder,
} from "~/src/services/booking";

import {
  getMarketplaceData,
  getMarketplaceServiceDetail,
} from "~/src/services/marketplace";

import type {
  BookingOrderDraft,
  BookingOrderStatus,
  BookingPaymentMethodId,
} from "~/src/types/booking";

import type {
  ClientOrderExtras,
  ClientOrderReview,
  ClientOrderView,
} from "~/src/types/clientOrder";

const ORDER_PREFIX = "layananpro_order_";

const EXTRA_PREFIX = "layananpro_client_order_extra_";

function extraKey(orderId: number): string {
  return `${EXTRA_PREFIX}${orderId}`;
}

function orderKey(orderId: number): string {
  return `${ORDER_PREFIX}${orderId}`;
}

function readExtra(orderId: number): ClientOrderExtras {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = localStorage.getItem(extraKey(orderId));

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as ClientOrderExtras;
  } catch {
    return {};
  }
}

function writeExtra(orderId: number, extra: ClientOrderExtras): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(extraKey(orderId), JSON.stringify(extra));
}

function parseMoney(value: string | number): number {
  if (typeof value === "number") {
    return value;
  }

  const normalized = value
    .replace(/[^\d.,-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const amount = Number(normalized);

  return Number.isFinite(amount) ? amount : 0;
}

function paymentMethodForStatus(
  status: BookingOrderStatus,
): BookingPaymentMethodId | null {
  switch (status) {
    case "PAID_PENDING_CONFIRMATION":
      return "manual";

    case "IN_PROGRESS":
    case "DELIVERED":
    case "IN_REVISION":
    case "DISPUTE_IN_PROGRESS":
    case "REFUND_APPROVED_WAITING_FINANCE":
    case "COMPLETED":
    case "REFUNDED":
      return "qris";

    case "RELEASE_APPROVED_WAITING_FINANCE":
      return "va";

    default:
      return null;
  }
}

async function ensureDummyOrders(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  const marketplace = await getMarketplaceData();

  const gigs = marketplace.gigs.filter(
    (gig) => gig.status === "ACTIVE" || gig.status === "FEATURED",
  );

  if (gigs.length === 0) {
    return;
  }

  const statuses: BookingOrderStatus[] = [
    "UNPAID",

    "PAID_PENDING_CONFIRMATION",

    "IN_PROGRESS",

    "DELIVERED",

    "IN_REVISION",

    "DISPUTE_IN_PROGRESS",

    "REFUND_APPROVED_WAITING_FINANCE",

    "RELEASE_APPROVED_WAITING_FINANCE",

    "COMPLETED",

    "COMPLETED",

    "REFUNDED",

    "CANCELLED",
  ];

  const now = Date.now();

  statuses.forEach((status, index) => {
    const id = 910001 + index;

    if (localStorage.getItem(orderKey(id))) {
      return;
    }

    const gig = gigs[index % gigs.length];

    const price = parseMoney(gig.price);

    const paymentMethod = paymentMethodForStatus(status);

    /**
     * Saat ini service fee Rp25.000
     * hanya benar-benar ditambahkan
     * pada jalur Midtrans.
     */
    const serviceFee =
      paymentMethod && paymentMethod !== "manual" ? BOOKING_SERVICE_FEE : 0;

    const createdAt = new Date(now - index * 86_400_000).toISOString();

    const draft: BookingOrderDraft = {
      id,

      gigId: gig.id,

      merchantId: gig.merchantId,

      totalAmount: price,

      serviceFee,

      paymentTotal: price + serviceFee,

      status,

      createdAt,

      paymentMethod,

      bank: paymentMethod === "va" ? "bca" : null,

      proofFileName:
        status === "PAID_PENDING_CONFIRMATION" ? "bukti-transfer.png" : null,
    };

    localStorage.setItem(orderKey(id), JSON.stringify(draft));

    const delivered = ["DELIVERED", "IN_REVISION", "COMPLETED"].includes(
      status,
    );

    const extra: ClientOrderExtras = {};

    if (status === "IN_PROGRESS" || status === "IN_REVISION") {
      extra.deadline = new Date(now + 3 * 86_400_000).toISOString();
    }

    if (delivered) {
      extra.deliveredAt = new Date(now - 5 * 60 * 60 * 1000).toISOString();

      extra.deliverables = [
        {
          id: id * 10 + 1,

          fileUrl: "https://drive.google.com/",

          message:
            status === "IN_REVISION"
              ? "Berikut hasil pengerjaan versi sebelumnya sebelum revisi."
              : "Halo, hasil pekerjaan sudah selesai. Silakan diperiksa.",

          createdAt: extra.deliveredAt,
        },
      ];
    }

    if (status === "IN_REVISION") {
      extra.revisionNote =
        "Mohon sesuaikan warna utama dan rapikan kembali bagian header.";
    }

    if (status === "DISPUTE_IN_PROGRESS") {
      extra.dispute = {
        id: id * 10 + 2,

        reason: "Hasil pekerjaan belum sesuai dengan kesepakatan awal.",

        evidenceFileName: "bukti-sengketa.pdf",

        status: "OPEN",
      };
    }

    /**
     * Dari dua order COMPLETED,
     * satu belum review,
     * satu sudah review.
     */
    if (status === "COMPLETED" && index === 9) {
      extra.review = {
        id: id * 10 + 3,

        rating: 5,

        comment: "Hasil bagus dan komunikasi dengan vendor sangat lancar.",

        createdAt: new Date(now - 2 * 86_400_000).toISOString(),
      };
    }

    writeExtra(id, extra);
  });
}

function getStoredOrderIds(): number[] {
  if (typeof window === "undefined") {
    return [];
  }

  const ids: number[] = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);

    if (!key || !key.startsWith(ORDER_PREFIX)) {
      continue;
    }

    const rawId = key.slice(ORDER_PREFIX.length);

    const id = Number(rawId);

    if (Number.isFinite(id)) {
      ids.push(id);
    }
  }

  return ids;
}

async function hydrateOrder(
  draft: BookingOrderDraft,
): Promise<ClientOrderView | null> {
  const service = await getMarketplaceServiceDetail(draft.gigId);

  if (!service) {
    return null;
  }

  const extra = readExtra(draft.id);

  const serviceFee =
    draft.paymentMethod && draft.paymentMethod !== "manual"
      ? BOOKING_SERVICE_FEE
      : 0;

  return {
    ...draft,

    serviceFee,

    paymentTotal: draft.totalAmount + serviceFee,

    gigTitle: service.gig.title,

    gigDescription: service.gig.description,

    categoryName: service.gig.category.name,

    plan: service.gig.plan,

    imageUrl: service.mediaUrl,

    merchant: {
      id: service.merchant.id,

      shopName: service.merchant.shopName,

      logoUrl: service.merchant.logoUrl,
    },

    deadline: extra.deadline ?? null,

    frozenDeadline: extra.frozenDeadline ?? null,

    deliveredAt: extra.deliveredAt ?? null,

    revisionNote: extra.revisionNote ?? null,

    deliverables: extra.deliverables ?? [],

    review: extra.review ?? null,

    dispute: extra.dispute ?? null,
  };
}

export async function listDummyClientOrders(): Promise<ClientOrderView[]> {
  await ensureDummyOrders();

  const ids = getStoredOrderIds();

  const hydrated = await Promise.all(
    ids.map(async (id) => {
      const draft = getDummyBookingOrder(id);

      if (!draft) {
        return null;
      }

      return hydrateOrder(draft);
    }),
  );

  return hydrated
    .filter((order): order is ClientOrderView => order !== null)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export async function getDummyClientOrderDetail(
  orderId: number,
): Promise<ClientOrderView | null> {
  await ensureDummyOrders();

  const draft = getDummyBookingOrder(orderId);

  if (!draft) {
    return null;
  }

  return hydrateOrder(draft);
}

async function updateStatus(
  orderId: number,
  status: BookingOrderStatus,
): Promise<ClientOrderView> {
  const current = getDummyBookingOrder(orderId);

  if (!current) {
    throw new Error("Pesanan tidak ditemukan.");
  }

  persistDummyBookingOrder({
    ...current,

    status,
  });

  const updated = await getDummyClientOrderDetail(orderId);

  if (!updated) {
    throw new Error("Pesanan tidak ditemukan.");
  }

  return updated;
}

export async function cancelDummyClientOrder(
  orderId: number,
): Promise<ClientOrderView> {
  await cancelDummyBookingOrder(orderId);

  const updated = await getDummyClientOrderDetail(orderId);

  if (!updated) {
    throw new Error("Pesanan tidak ditemukan.");
  }

  return updated;
}

export async function completeDummyClientOrder(
  orderId: number,
): Promise<ClientOrderView> {
  const current = await getDummyClientOrderDetail(orderId);

  if (!current || current.status !== "DELIVERED") {
    throw new Error("Pesanan belum berada pada status hasil dikirim.");
  }

  return updateStatus(orderId, "COMPLETED");
}

export async function requestDummyClientRevision(
  orderId: number,
  revisionNote: string,
): Promise<ClientOrderView> {
  const note = revisionNote.trim();

  if (!note) {
    throw new Error("Catatan revisi wajib diisi.");
  }

  if (note.length > 1000) {
    throw new Error("Catatan revisi maksimal 1000 karakter.");
  }

  const current = await getDummyClientOrderDetail(orderId);

  if (!current || current.status !== "DELIVERED") {
    throw new Error("Revisi hanya bisa diajukan setelah hasil dikirim.");
  }

  const extra = readExtra(orderId);

  writeExtra(orderId, {
    ...extra,

    revisionNote: note,
  });

  return updateStatus(orderId, "IN_REVISION");
}

export async function submitDummyClientReview(
  orderId: number,
  rating: number,
  comment?: string,
): Promise<ClientOrderReview> {
  if (rating < 1 || rating > 5) {
    throw new Error("Rating harus antara 1 sampai 5.");
  }

  const order = await getDummyClientOrderDetail(orderId);

  if (!order || order.status !== "COMPLETED") {
    throw new Error("Hanya pesanan selesai yang dapat diberi ulasan.");
  }

  const extra = readExtra(orderId);

  if (extra.review) {
    throw new Error("Pesanan ini sudah diberi ulasan.");
  }

  const review: ClientOrderReview = {
    id: Date.now(),

    rating,

    comment: comment?.trim() || null,

    createdAt: new Date().toISOString(),
  };

  writeExtra(orderId, {
    ...extra,

    review,
  });

  return review;
}

export async function openDummyClientDispute(
  orderId: number,
  reason: string,
  file: File,
): Promise<ClientOrderView> {
  const order = await getDummyClientOrderDetail(orderId);

  if (!order) {
    throw new Error("Pesanan tidak ditemukan.");
  }

  const allowed = ["IN_PROGRESS", "DELIVERED", "IN_REVISION"];

  if (!allowed.includes(order.status)) {
    throw new Error("Status pesanan ini tidak dapat disengketakan.");
  }

  if (!reason.trim()) {
    throw new Error("Alasan sengketa wajib diisi.");
  }

  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error("Bukti sengketa maksimal 5 MB.");
  }

  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Bukti harus JPG, JPEG, PNG, atau PDF.");
  }

  const extra = readExtra(orderId);

  writeExtra(orderId, {
    ...extra,

    frozenDeadline: order.deadline,

    deadline: null,

    dispute: {
      id: Date.now(),

      reason: reason.trim(),

      evidenceFileName: file.name,

      status: "OPEN",
    },
  });

  return updateStatus(orderId, "DISPUTE_IN_PROGRESS");
}
