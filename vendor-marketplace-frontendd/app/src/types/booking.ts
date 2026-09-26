export type BookingPaymentMethodId = "va" | "qris" | "manual";

export type BookingBankCode = "bca" | "bri" | "bni" | "mandiri";

export type BookingOrderStatus =
  | "UNPAID"
  | "PAID_PENDING_CONFIRMATION"
  | "IN_PROGRESS"
  | "DELIVERED"
  | "IN_REVISION"
  | "DISPUTE_IN_PROGRESS"
  | "REFUND_APPROVED_WAITING_FINANCE"
  | "RELEASE_APPROVED_WAITING_FINANCE"
  | "COMPLETED"
  | "REFUNDED"
  | "CANCELLED";

export interface BookingBankOption {
  code: BookingBankCode;
  name: string;
}

export interface BookingPaymentMethod {
  id: BookingPaymentMethodId;

  name: string;

  type: "midtrans" | "manual";

  description: string;

  banks?: BookingBankOption[];
}

export interface BookingOrderDraft {
  id: number;

  gigId: number;

  merchantId: number;

  totalAmount: number;

  serviceFee: number;

  paymentTotal: number;

  status: BookingOrderStatus;

  createdAt: string;

  paymentMethod?: BookingPaymentMethodId | null;

  bank?: BookingBankCode | null;

  proofFileName?: string | null;
}
