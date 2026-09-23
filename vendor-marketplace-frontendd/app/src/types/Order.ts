type OrderStatus = "PENDING" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED" | "REJECTED";

export interface OrderItem {
  id: string;
  clientName: string;
  clientPhone?: string;
  serviceTitle: string;
  packageTier: "Basic" | "Standard" | "Premium";
  price: number;
  orderDate: string;
  deadline: string;
  status: "PENDING" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED" | "REJECTED";
  notes?: string;
  deliveredFiles?: string[];
}

export interface OrderDetailType {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceTitle: string;
  packageTier: string;
  price: number;
  adminFee: number;
  totalNet: number;
  orderDate: string;
  deadline: string;
  status: OrderStatus;
  requirements: {
    brandName: string;
    slogan: string;
    colorPreferences: string;
    notes: string;
    attachedFile: string;
  };
  deliverables: Array<{
    fileName: string;
    uploadedAt: string;
    note: string;
  }>;
}