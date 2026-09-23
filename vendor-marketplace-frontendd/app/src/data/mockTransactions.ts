import type { TransactionItem } from "../types/Transactions";

export const initialTransaction: TransactionItem[] = [
     {
      id: "TRX-88291",
      type: "INCOME",
      title: "Pembayaran Order - UI/UX Landing Page",
      orderId: "ORD-9481",
      date: "21 Sep 2026, 14:20 WIB",
      amount: 450000,
      status: "COMPLETED",
    },
    {
      id: "TRX-88200",
      type: "WITHDRAWAL",
      title: "Penarikan Saldo ke Bank BCA",
      bankAccount: "BCA • **** 3912",
      date: "19 Sep 2026, 09:15 WIB",
      amount: 2000000,
      status: "COMPLETED",
    },
    {
      id: "TRX-88150",
      type: "INCOME",
      title: "Pembayaran Order - Desain Logo Minimalis",
      orderId: "ORD-9482",
      date: "18 Sep 2026, 16:45 WIB",
      amount: 150000,
      status: "COMPLETED",
    },
    {
      id: "TRX-88112",
      type: "INCOME",
      title: "Pembayaran Order - Motion Graphic 30s",
      orderId: "ORD-9475",
      date: "17 Sep 2026, 11:30 WIB",
      amount: 250000,
      status: "PENDING",
    },
    {
      id: "TRX-88090",
      type: "WITHDRAWAL",
      title: "Penarikan Saldo ke Bank Mandiri",
      bankAccount: "Mandiri • **** 4102",
      date: "10 Sep 2026, 10:00 WIB",
      amount: 1500000,
      status: "COMPLETED",
    },
]