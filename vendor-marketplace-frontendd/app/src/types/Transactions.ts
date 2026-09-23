export interface TransactionItem {
  id: string;
  type: "INCOME" | "WITHDRAWAL";
  title: string;
  orderId?: string;
  date: string;
  amount: number;
  status: "COMPLETED" | "PENDING" | "FAILED";
  bankAccount?: string;
}