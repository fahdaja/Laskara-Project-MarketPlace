export const getWhatsAppUrl = (phone?: string, clientName?: string, orderId?: string) => {
  if (!phone) return "#";
  const cleanedPhone = phone.replace(/[^0-9]/g, "");
  const message = encodeURIComponent(
    `Halo ${clientName || "Klien"}, saya terkait pesanan ${orderId || ""} di platform.`
  );
  return `https://wa.me/${cleanedPhone}?text=${message}`;
};