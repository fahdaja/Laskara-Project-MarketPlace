import type { MarketplaceData, MarketplaceGig } from "~/src/types/marketplace";

import type {
  MarketplaceRelatedService,
  MarketplaceServiceDetail,
} from "~/src/types/serviceDetail";

import {
  MOCK_GIGS,
  MOCK_LEADERBOARD,
  MOCK_MARKETPLACE_DATA,
  MOCK_MERCHANTS,
} from "~/src/mocks/marketplace.mock";

import type { MarketplaceMerchantStoreData } from "~/src/types/merchantStore";

export async function getMarketplaceData(): Promise<MarketplaceData> {
  return MOCK_MARKETPLACE_DATA;
}

function parseMoney(value: string | number): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = value
    .replace(/[^\d.,-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function resolveMediaUrl(mediaUrls?: string | null): string | null {
  if (!mediaUrls?.trim()) {
    return "/assets/images/hero-creative-studio.png";
  }

  const value = mediaUrls.trim();

  try {
    if (value.startsWith("[")) {
      const parsed: unknown = JSON.parse(value);

      if (Array.isArray(parsed)) {
        const first = parsed.find(
          (item): item is string =>
            typeof item === "string" && item.trim().length > 0,
        );

        return first ?? null;
      }
    }

    if (value.startsWith("{")) {
      const parsed = JSON.parse(value) as {
        url?: unknown;
        images?: unknown;
      };

      if (typeof parsed.url === "string") {
        return parsed.url;
      }

      if (
        Array.isArray(parsed.images) &&
        typeof parsed.images[0] === "string"
      ) {
        return parsed.images[0];
      }
    }
  } catch {
    // mediaUrls berupa URL biasa.
  }

  return value;
}

function buildRelatedService(gig: MarketplaceGig): MarketplaceRelatedService {
  return {
    id: gig.id,
    title: gig.title,
    price: parseMoney(gig.price),
    plan: gig.plan,
    mediaUrl: resolveMediaUrl(gig.mediaUrls),
    featured: gig.featuredStatus === "FEATURED",
  };
}

export async function getMarketplaceServiceDetail(
  id: number,
): Promise<MarketplaceServiceDetail | null> {
  const gig = MOCK_GIGS.find((item) => item.id === id);

  if (!gig) {
    return null;
  }

  const merchant = MOCK_MERCHANTS.find((item) => item.id === gig.merchantId);

  if (!merchant) {
    return null;
  }

  const ratingEntry = MOCK_LEADERBOARD.bestRating.find(
    (item) => item.merchant?.id === merchant.id,
  );

  const completedEntry = MOCK_LEADERBOARD.mostBooked.find(
    (item) => item.merchant?.id === merchant.id,
  );

  const responseEntry = MOCK_LEADERBOARD.fastestResponse.find(
    (item) => item.merchant?.id === merchant.id,
  );

  const relatedServices: MarketplaceRelatedService[] = MOCK_GIGS.filter(
    (item) =>
      item.merchantId === merchant.id &&
      item.id !== gig.id &&
      (item.status === "ACTIVE" || item.status === "FEATURED"),
  )
    .slice(0, 5)
    .map(buildRelatedService);

  return {
    gig,
    merchant,
    mediaUrl: resolveMediaUrl(gig.mediaUrls),

    merchantStats: {
      rating: ratingEntry ? Number(ratingEntry.avgRating) || null : null,

      reviewCount: ratingEntry?.reviewCount ?? 0,

      completedOrders: completedEntry?.completedOrders ?? 0,

      avgResponseHours: responseEntry
        ? Number(responseEntry.avgResponseHours) || null
        : null,
    },

    relatedServices,
  };
}

export async function createDummyMarketplaceOrder(input: {
  gigId: number;
  price: number;
}) {
  const result = {
    id: Date.now(),
    gigId: input.gigId,
    status: "UNPAID" as const,
    totalAmount: input.price,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    localStorage.setItem("layananpro_dummy_order", JSON.stringify(result));
  }

  return result;
}

export async function createDummyMarketplaceChat(gigId: number) {
  const result = {
    channelId: `chat-gig-${gigId}-dummy-client`,
    token: "dummy-stream-token",
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(
      "layananpro_dummy_chat",
      JSON.stringify({
        gigId,
        ...result,
        createdAt: new Date().toISOString(),
      }),
    );
  }

  return result;
}

export async function getMarketplaceMerchantStore(
  merchantId: number,
): Promise<MarketplaceMerchantStoreData | null> {
  const merchant = MOCK_MERCHANTS.find((item) => item.id === merchantId);

  if (!merchant) {
    return null;
  }

  const services = MOCK_GIGS.filter(
    (item) =>
      item.merchantId === merchantId &&
      (item.status === "ACTIVE" || item.status === "FEATURED"),
  );

  const ratingEntry = MOCK_LEADERBOARD.bestRating.find(
    (item) => item.merchant?.id === merchantId,
  );

  const completedEntry = MOCK_LEADERBOARD.mostBooked.find(
    (item) => item.merchant?.id === merchantId,
  );

  const responseEntry = MOCK_LEADERBOARD.fastestResponse.find(
    (item) => item.merchant?.id === merchantId,
  );

  return {
    merchant,

    services,

    stats: {
      rating: ratingEntry ? Number(ratingEntry.avgRating) || null : null,

      reviewCount: ratingEntry?.reviewCount ?? 0,

      completedOrders: completedEntry?.completedOrders ?? 0,

      avgResponseHours: responseEntry
        ? Number(responseEntry.avgResponseHours) || null
        : null,
    },
  };
}
