import type { ClientOrderStatus } from "~/src/types/clientOrder";

export type ClientOrderTone =
  | "amber"
  | "blue"
  | "violet"
  | "emerald"
  | "rose"
  | "slate";

interface OrderStatusConfig {
  label: string;

  tone: ClientOrderTone;

  description: string;
}

const STATUS_CONFIG: Record<ClientOrderStatus, OrderStatusConfig> = {
  UNPAID: {
    label: "Belum Dibayar",

    tone: "amber",

    description: "Pesanan sudah dibuat dan masih menunggu pembayaran.",
  },

  PAID_PENDING_CONFIRMATION: {
    label: "Menunggu Verifikasi",

    tone: "blue",

    description: "Bukti pembayaran sudah dikirim dan sedang diperiksa Finance.",
  },

  IN_PROGRESS: {
    label: "Dalam Pengerjaan",

    tone: "blue",

    description:
      "Pembayaran sudah dikonfirmasi dan vendor sedang mengerjakan pesanan.",
  },

  DELIVERED: {
    label: "Hasil Dikirim",

    tone: "violet",

    description:
      "Vendor sudah mengirim hasil pekerjaan. Periksa sebelum menerima pesanan.",
  },

  IN_REVISION: {
    label: "Dalam Revisi",

    tone: "violet",

    description:
      "Permintaan revisi sudah diterima dan vendor sedang mengerjakan perbaikan.",
  },

  DISPUTE_IN_PROGRESS: {
    label: "Sengketa Diproses",

    tone: "rose",

    description: "Pesanan sedang berada dalam proses penyelesaian sengketa.",
  },

  REFUND_APPROVED_WAITING_FINANCE: {
    label: "Menunggu Refund",

    tone: "amber",

    description: "Refund telah disetujui dan sedang menunggu proses Finance.",
  },

  RELEASE_APPROVED_WAITING_FINANCE: {
    label: "Menunggu Pencairan",

    tone: "blue",

    description:
      "Keputusan sengketa telah selesai dan pencairan dana sedang diproses.",
  },

  COMPLETED: {
    label: "Selesai",

    tone: "emerald",

    description: "Pesanan sudah selesai.",
  },

  REFUNDED: {
    label: "Dana Dikembalikan",

    tone: "slate",

    description: "Pesanan telah dihentikan dan dana telah dikembalikan.",
  },

  CANCELLED: {
    label: "Dibatalkan",

    tone: "rose",

    description: "Pesanan telah dibatalkan.",
  },
};

const TERMINAL_STATUSES = new Set<ClientOrderStatus>([
  "COMPLETED",
  "REFUNDED",
  "CANCELLED",
]);

export function getClientOrderStatusConfig(
  status: ClientOrderStatus,
): OrderStatusConfig {
  return STATUS_CONFIG[status];
}

export function isTerminalClientOrder(status: ClientOrderStatus): boolean {
  return TERMINAL_STATUSES.has(status);
}

export function needsClientPayment(status: ClientOrderStatus): boolean {
  return status === "UNPAID";
}

export function canReviewClientOrder(status: ClientOrderStatus): boolean {
  return status === "COMPLETED";
}

export function clientOrderStep(status: ClientOrderStatus): number {
  switch (status) {
    case "UNPAID":
    case "CANCELLED":
      return 0;

    case "PAID_PENDING_CONFIRMATION":
      return 1;

    case "IN_PROGRESS":
    case "DISPUTE_IN_PROGRESS":
    case "REFUND_APPROVED_WAITING_FINANCE":
    case "RELEASE_APPROVED_WAITING_FINANCE":
    case "REFUNDED":
      return 2;

    case "DELIVERED":
    case "IN_REVISION":
      return 3;

    case "COMPLETED":
      return 4;

    default:
      return 0;
  }
}
