export interface GigsItem {
  id: string;
  title: string;
  description: string;
  price: number;
  status: "AKTIF" | "MENUNGGU" | "DITOLAK";
  image: string;
  rejectionReason?: string;
}

export interface PackageTier {
  price: number | "";
  features: string[]; // Diubah menjadi dinamis array string
}

export interface PortfolioItem {
  id: string;
  image: string; // Base64 atau URL Preview
}