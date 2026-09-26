export type MoneyValue = number | string;

export type MerchantStatus =
  | "INCOMPLETE"
  | "PENDING_VERIFICATION"
  | "ACTIVE"
  | "REJECTED"
  | "VACATION"
  | "SUSPENDED"
  | "CLOSED";

export type MerchantBadge =
  | "NEWCOMER"
  | "RISING_STAR"
  | "STAR_VENDOR"
  | "SIGNATURE_PARTNER";

export type GigPlan = "BASIC" | "STANDARD" | "PREMIUM";

export type GigStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "PAUSED"
  | "REJECTED"
  | "REMOVED"
  | "FEATURED";

export type FeaturedStatus = "NONE" | "FEATURED";

export interface MarketplaceCategory {
  id: number;

  name: string;

  commissionRate: MoneyValue;
}

export interface GigMerchantMini {
  shopName: string;

  user: {
    fullName: string;
  };
}

export interface GigCategoryMini {
  id: number;

  name: string;

  commissionRate: MoneyValue;
}

export interface MarketplaceGig {
  id: number;

  merchantId: number;

  categoryId: number;

  title: string;

  description: string;

  price: MoneyValue;

  plan: GigPlan;

  mediaUrls?: string | null;

  status: GigStatus;

  rejectionReason?: string | null;

  createdAt: string;

  featuredStatus: FeaturedStatus;

  featuredUntil?: string | null;

  merchant: GigMerchantMini;

  category: GigCategoryMini;
}

export interface PublicMerchant {
  id: number;

  userId: number;

  shopName: string;

  description?: string | null;

  logoUrl?: string | null;

  bannerUrl?: string | null;

  status: MerchantStatus;

  badge: MerchantBadge;

  createdAt: string;
}

export interface LeaderboardMerchant {
  id: number;

  shopName: string;

  logoUrl?: string | null;

  badge: MerchantBadge;
}

export interface MostBookedMerchant {
  merchant?: LeaderboardMerchant;

  completedOrders: number;
}

export interface BestRatingMerchant {
  merchant?: LeaderboardMerchant;

  avgRating: string;

  reviewCount: number;
}

export interface FastestResponseMerchant {
  merchant?: LeaderboardMerchant;

  avgResponseHours: string;
}

export interface MerchantLeaderboard {
  mostBooked: MostBookedMerchant[];

  bestRating: BestRatingMerchant[];

  fastestResponse: FastestResponseMerchant[];
}

export interface MarketplaceData {
  categories: MarketplaceCategory[];

  merchants: PublicMerchant[];

  gigs: MarketplaceGig[];

  leaderboard: MerchantLeaderboard;
}
