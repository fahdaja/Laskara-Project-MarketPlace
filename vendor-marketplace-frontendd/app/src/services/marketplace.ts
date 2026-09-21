import type { MarketplaceData } from "~/src/types/marketplace";

import { MOCK_MARKETPLACE_DATA } from "~/src/mocks/marketplace.mock";

/**
 * Untuk sekarang seluruh marketplace
 * menggunakan fixture frontend.
 *
 * Fungsi sengaja async agar nantinya
 * implementasi API bisa diganti tanpa
 * mengubah Marketplace.tsx.
 */
export async function getMarketplaceData(): Promise<MarketplaceData> {
  return MOCK_MARKETPLACE_DATA;
}
