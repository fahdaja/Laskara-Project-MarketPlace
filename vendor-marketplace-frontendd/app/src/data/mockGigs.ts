// src/data/mockGigs.ts
import type { GigsItem } from "../types/Gigs";

export const initialGigs: GigsItem[] = [
  {
    id: "1",
    title: "Desain Logo Minimalis",
    description:
      "Desain logo lengkap, palet warna, dan template media sosial untuk kebutuhan premium.",
    price: 45000,
    status: "AKTIF",
    image: "/assets/images/hero-creative-studio.png",
  },
  {
    id: "2",
    title: "UI/UX Website E-Commerce",
    description:
      "Perancangan tampilan web modern dan responsif menggunakan Figma.",
    price: 150000,
    status: "MENUNGGU",
    image: "/assets/images/hero-creative-studio.png",
  },
  {
    id: "3",
    title: "Video Motion Graphic 30s",
    description:
      "Pembuatan video promosi produk animasi 2D untuk iklan sosial media.",
    price: 45000,
    status: "DITOLAK",
    image: "/assets/images/hero-creative-studio.png",
    rejectionReason:
      "Harga terlalu rendah untuk posisi brand saat ini. Sesuaikan minimal menjadi Rp 50.000.",
  },
];