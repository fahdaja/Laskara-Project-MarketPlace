import type {
  GigPlan,
  MarketplaceGig,
  PublicMerchant,
} from "~/src/types/marketplace";

export interface MarketplaceMerchantStats {
  rating: number | null;
  reviewCount: number;
  completedOrders: number;
  avgResponseHours: number | null;
}

export interface MarketplaceRelatedService {
  id: number;
  title: string;
  price: number;
  plan: GigPlan;
  mediaUrl: string | null;
  featured: boolean;
}

export interface MarketplaceServiceDetail {
  gig: MarketplaceGig;
  merchant: PublicMerchant;
  mediaUrl: string | null;
  merchantStats: MarketplaceMerchantStats;
  relatedServices: MarketplaceRelatedService[];
}
