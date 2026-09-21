import type {
  MarketplaceCategory,
  MarketplaceData,
  MarketplaceGig,
  MerchantLeaderboard,
  PublicMerchant,
} from "~/src/types/marketplace";

export const MOCK_CATEGORIES: MarketplaceCategory[] = [
  {
    id: 1,
    name: "Creative Studio",
    commissionRate: 5,
  },
  {
    id: 2,
    name: "Tech and Digital",
    commissionRate: 5,
  },
  {
    id: 3,
    name: "Event Essentials",
    commissionRate: 3,
  },
  {
    id: 4,
    name: "Consumptions",
    commissionRate: 3,
  },
  {
    id: 5,
    name: "Merchandise and Apparels",
    commissionRate: 4,
  },
  {
    id: 6,
    name: "Talents and Performers",
    commissionRate: 5,
  },
];

export const MOCK_MERCHANTS: PublicMerchant[] = [
  /**
   * Merchant canonical dari
   * seed backend.
   */
  {
    id: 1,
    userId: 5,

    shopName: "Toko Test CCI",

    description: "Toko untuk keperluan testing sistem vendor marketplace CCI",

    logoUrl: null,
    bannerUrl: null,

    status: "ACTIVE",

    badge: "NEWCOMER",

    createdAt: "2026-05-18T08:00:00.000Z",
  },

  {
    id: 2,
    userId: 20,

    shopName: "Kreasi Kampus Studio",

    description:
      "Studio kreatif untuk desain, fotografi, dan kebutuhan visual.",

    logoUrl: null,
    bannerUrl: null,

    status: "ACTIVE",

    badge: "STAR_VENDOR",

    createdAt: "2026-05-22T08:00:00.000Z",
  },

  {
    id: 3,
    userId: 21,

    shopName: "Nexa Digital Lab",

    description: "Layanan teknologi dan solusi digital.",

    logoUrl: null,
    bannerUrl: null,

    status: "ACTIVE",

    badge: "SIGNATURE_PARTNER",

    createdAt: "2026-05-27T08:00:00.000Z",
  },

  {
    id: 4,
    userId: 22,

    shopName: "Lentera Event",

    description: "Kebutuhan perlengkapan dan penyelenggaraan acara.",

    logoUrl: null,
    bannerUrl: null,

    status: "ACTIVE",

    badge: "RISING_STAR",

    createdAt: "2026-06-03T08:00:00.000Z",
  },

  {
    id: 5,
    userId: 23,

    shopName: "Dapur Kolektif",

    description: "Konsumsi, catering, snack box, dan minuman acara.",

    logoUrl: null,
    bannerUrl: null,

    status: "ACTIVE",

    badge: "STAR_VENDOR",

    createdAt: "2026-06-11T08:00:00.000Z",
  },

  {
    id: 6,
    userId: 24,

    shopName: "Merchworks CCI",

    description: "Merchandise dan apparel custom untuk organisasi dan event.",

    logoUrl: null,
    bannerUrl: null,

    status: "ACTIVE",

    badge: "RISING_STAR",

    createdAt: "2026-06-19T08:00:00.000Z",
  },

  {
    id: 7,
    userId: 25,

    shopName: "StageHub Talent",

    description: "Talent, MC, performer, dan entertainment untuk event.",

    logoUrl: null,
    bannerUrl: null,

    status: "ACTIVE",

    badge: "STAR_VENDOR",

    createdAt: "2026-07-01T08:00:00.000Z",
  },
];

const SERVICE_FIXTURES = [
  {
    categoryId: 1,

    titles: [
      "Jasa Desain Logo",
      "Desain Poster Acara",
      "Desain Konten Instagram",
      "Fotografi Produk",
      "Video Company Profile",
      "Desain Branding UMKM",
      "Desain Banner Event",
      "Editing Video Promosi",
    ],

    basePrice: 150_000,
  },

  {
    categoryId: 2,

    titles: [
      "Pembuatan Landing Page",
      "Website Company Profile",
      "UI UX Design Website",
      "Pembuatan Dashboard Admin",
      "Setup WordPress",
      "Konsultasi Sistem Informasi",
      "Pembuatan Prototype Aplikasi",
      "Maintenance Website",
    ],

    basePrice: 350_000,
  },

  {
    categoryId: 3,

    titles: [
      "Sewa Sound System",
      "Sewa Lighting Event",
      "Paket Dekorasi Event",
      "Dokumentasi Acara",
      "Sewa Meja dan Kursi",
      "Event Organizer Kampus",
      "Sewa Backdrop Acara",
      "Paket Perlengkapan Seminar",
    ],

    basePrice: 250_000,
  },

  {
    categoryId: 4,

    titles: [
      "Snack Box Acara",
      "Catering Nasi Box",
      "Coffee Break Seminar",
      "Paket Konsumsi Rapat",
      "Catering Event Kampus",
      "Paket Minuman Event",
      "Dessert Box Acara",
      "Paket Konsumsi Panitia",
    ],

    basePrice: 25_000,
  },

  {
    categoryId: 5,

    titles: [
      "Custom Kaos Event",
      "Cetak Tote Bag",
      "Pembuatan ID Card",
      "Custom Hoodie Organisasi",
      "Cetak Merchandise Acara",
      "Pembuatan Lanyard",
      "Custom Jaket Komunitas",
      "Paket Merchandise Seminar",
    ],

    basePrice: 45_000,
  },

  {
    categoryId: 6,

    titles: [
      "MC Acara Formal",
      "Band Akustik",
      "Solo Singer Event",
      "Talent Photoshoot",
      "Moderator Seminar",
      "Performer Acara Kampus",
      "Host Entertainment",
      "Acoustic Duo Event",
    ],

    basePrice: 300_000,
  },
] as const;

function getCategory(id: number) {
  return MOCK_CATEGORIES.find((category) => category.id === id)!;
}

function getMerchant(index: number) {
  return MOCK_MERCHANTS[index % MOCK_MERCHANTS.length];
}

function createGigs(): MarketplaceGig[] {
  let gigId = 1;

  const gigs: MarketplaceGig[] = [];

  SERVICE_FIXTURES.forEach((group, categoryIndex) => {
    const category = getCategory(group.categoryId);

    group.titles.forEach((title, titleIndex) => {
      /**
       * Gig pertama dibuat benar-benar
       * menyerupai seed backend:
       *
       * Toko Test CCI
       * Creative Studio
       * Jasa Desain Logo
       * Rp150.000
       */
      const merchant =
        gigId === 1
          ? MOCK_MERCHANTS[0]
          : getMerchant(categoryIndex + titleIndex + 1);

      const featured = gigId % 9 === 0;

      const price =
        group.basePrice +
        titleIndex * Math.max(15_000, Math.round(group.basePrice * 0.12));

      gigs.push({
        id: gigId,

        merchantId: merchant.id,

        categoryId: category.id,

        title,

        description:
          gigId === 1
            ? "Desain logo profesional untuk acara kampus"
            : `${title} profesional untuk kebutuhan proyek, organisasi, bisnis, maupun kegiatan kampus.`,

        price,

        plan:
          titleIndex % 3 === 0
            ? "BASIC"
            : titleIndex % 3 === 1
              ? "STANDARD"
              : "PREMIUM",

        mediaUrls: null,

        status: "ACTIVE",

        rejectionReason: null,

        createdAt: new Date(
          2026,
          7,
          Math.max(1, 28 - ((gigId - 1) % 27)),
        ).toISOString(),

        featuredStatus: featured ? "FEATURED" : "NONE",

        featuredUntil: featured ? "2026-12-31T23:59:59.000Z" : null,

        merchant: {
          shopName: merchant.shopName,

          user: {
            fullName: merchant.shopName,
          },
        },

        category: {
          id: category.id,

          name: category.name,

          commissionRate: category.commissionRate,
        },
      });

      gigId += 1;
    });
  });

  return gigs;
}

export const MOCK_GIGS = createGigs();

function leaderboardMerchant(merchant: PublicMerchant) {
  return {
    id: merchant.id,

    shopName: merchant.shopName,

    logoUrl: merchant.logoUrl,

    badge: merchant.badge,
  };
}

export const MOCK_LEADERBOARD: MerchantLeaderboard = {
  mostBooked: [
    {
      merchant: leaderboardMerchant(MOCK_MERCHANTS[2]),
      completedOrders: 128,
    },

    {
      merchant: leaderboardMerchant(MOCK_MERCHANTS[1]),
      completedOrders: 112,
    },

    {
      merchant: leaderboardMerchant(MOCK_MERCHANTS[5]),
      completedOrders: 94,
    },

    {
      merchant: leaderboardMerchant(MOCK_MERCHANTS[3]),
      completedOrders: 76,
    },

    {
      merchant: leaderboardMerchant(MOCK_MERCHANTS[0]),
      completedOrders: 42,
    },
  ],

  bestRating: [
    {
      merchant: leaderboardMerchant(MOCK_MERCHANTS[2]),

      avgRating: "4.95",
      reviewCount: 88,
    },

    {
      merchant: leaderboardMerchant(MOCK_MERCHANTS[1]),

      avgRating: "4.90",
      reviewCount: 73,
    },

    {
      merchant: leaderboardMerchant(MOCK_MERCHANTS[5]),

      avgRating: "4.82",
      reviewCount: 69,
    },

    {
      merchant: leaderboardMerchant(MOCK_MERCHANTS[3]),

      avgRating: "4.78",
      reviewCount: 54,
    },

    {
      merchant: leaderboardMerchant(MOCK_MERCHANTS[0]),

      avgRating: "4.65",
      reviewCount: 21,
    },
  ],

  fastestResponse: [
    {
      merchant: leaderboardMerchant(MOCK_MERCHANTS[2]),

      avgResponseHours: "0.8",
    },

    {
      merchant: leaderboardMerchant(MOCK_MERCHANTS[1]),

      avgResponseHours: "1.2",
    },

    {
      merchant: leaderboardMerchant(MOCK_MERCHANTS[3]),

      avgResponseHours: "1.8",
    },
  ],
};

export const MOCK_MARKETPLACE_DATA: MarketplaceData = {
  categories: MOCK_CATEGORIES,

  merchants: MOCK_MERCHANTS,

  gigs: MOCK_GIGS,

  leaderboard: MOCK_LEADERBOARD,
};
