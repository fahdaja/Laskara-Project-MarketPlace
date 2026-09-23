export const mapTabToOrderStatus = (tab: string): string | null => {
  switch (tab) {
    case "Baru": return "PENDING";
    case "Diproses": return "IN_PROGRESS";
    case "Menunggu Review": return "IN_REVIEW";
    case "Selesai": return "COMPLETED";
    case "Ditolak": return "REJECTED";
    default: return null; 
  }
};