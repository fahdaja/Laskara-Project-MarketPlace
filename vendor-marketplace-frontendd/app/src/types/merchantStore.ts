import type { MarketplaceGig, PublicMerchant } from "~/src/types/marketplace";

import type { MarketplaceMerchantStats } from "~/src/types/serviceDetail";

export interface MarketplaceMerchantStoreData {
  merchant: PublicMerchant;

  services: MarketplaceGig[];

  stats: MarketplaceMerchantStats;
}
