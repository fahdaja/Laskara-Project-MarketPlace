import type {
  BookingOrderDraft,
  BookingOrderStatus,
} from "~/src/types/booking";

import type { GigPlan } from "~/src/types/marketplace";

export type ClientOrderStatus = BookingOrderStatus;

export type ClientDisputeStatus =
  | "OPEN"
  | "UNDER_REVIEW"
  | "RESOLVED"
  | "CLOSED";

export interface ClientOrderDeliverable {
  id: number;

  fileUrl: string;

  message?: string | null;

  createdAt: string;
}

export interface ClientOrderReview {
  id: number;

  rating: number;

  comment?: string | null;

  createdAt: string;
}

export interface ClientOrderDispute {
  id: number;

  reason: string;

  evidenceFileName?: string | null;

  status: ClientDisputeStatus;

  verdictNote?: string | null;
}

export interface ClientOrderExtras {
  deadline?: string | null;

  frozenDeadline?: string | null;

  deliveredAt?: string | null;

  revisionNote?: string | null;

  deliverables?: ClientOrderDeliverable[];

  review?: ClientOrderReview | null;

  dispute?: ClientOrderDispute | null;
}

export interface ClientOrderView extends BookingOrderDraft {
  gigTitle: string;

  gigDescription: string;

  categoryName: string;

  plan: GigPlan;

  imageUrl: string | null;

  merchant: {
    id: number;

    shopName: string;

    logoUrl?: string | null;
  };

  deadline: string | null;

  frozenDeadline: string | null;

  deliveredAt: string | null;

  revisionNote: string | null;

  deliverables: ClientOrderDeliverable[];

  review: ClientOrderReview | null;

  dispute: ClientOrderDispute | null;
}

export type { BookingOrderStatus };
