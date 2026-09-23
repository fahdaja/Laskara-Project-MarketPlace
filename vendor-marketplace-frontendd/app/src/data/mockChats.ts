import type { Chat } from '../types/Messages' ;
import type { Message } from '../types/Messages'

export const initialChat: Chat[] = [
     {
      id: "1",
      clientName: "Budi Santoso",
      lastMessage: "Halo mas, apakah bisa pengerjaan logo dipercepat?",
      lastTime: "10m",
      unreadCount: 1,
      hasOffer: false,
      messages: [
        {
          id: "m1",
          sender: "client",
          text: "Halo mas, saya mau tanya-tanya dulu tentang paket Desain Logo Minimalis.",
          time: "09:30 AM",
        },
        {
          id: "m2",
          sender: "merchant",
          text: "Halo Mas Budi! Boleh banget, silakan ceritakan kebutuhan konsep logonya.",
          time: "09:32 AM",
        },
        {
          id: "m3",
          sender: "client",
          text: "Halo mas, apakah bisa pengerjaan logo dipercepat?",
          time: "09:45 AM",
        },
      ],
    },
    {
      id: "2",
      clientName: "Siti Rahma",
      lastMessage: "Penawaran khusus sebesar Rp 650.000 telah dikirim",
      lastTime: "2j",
      unreadCount: 0,
      hasOffer: true,
      messages: [
        {
          id: "m10",
          sender: "client",
          text: "Saya butuh redesign UI/UX aplikasi e-commerce 3 halaman.",
          time: "Kemarin",
        },
        {
          id: "m11",
          sender: "merchant",
          text: "Baik Mba Siti, saya buatkan custom offer khusus untuk 3 halaman UI/UX ya.",
          time: "Kemarin",
        },
        {
          id: "m12",
          sender: "merchant",
          time: "Kemarin",
          offer: {
            serviceTitle: "Redesign UI/UX E-Commerce (3 Halaman Mobile)",
            price: 650000,
            format: "3 Hari Kerja",
            status: "PENDING",
          },
        },
      ],
    },
    {
      id: "3",
      clientName: "PT Digital Nusantara",
      lastMessage: "Terima kasih banyak atas hasil pekerjaannya!",
      lastTime: "1h",
      unreadCount: 0,
      hasOffer: false,
      messages: [
        {
          id: "m20",
          sender: "client",
          text: "Terima kasih banyak atas hasil pekerjaannya!",
          time: "3 Hari lalu",
        },
      ],
    },
]

export const initialMessage: Message[] = [

]