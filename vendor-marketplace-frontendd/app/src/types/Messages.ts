export interface Message {
  id: string;
  sender: "client" | "merchant";
  text?: string;
  time: string;
  offer?: {
    serviceTitle: string;
    price: number;
    format: string;
    status: "PENDING" | "ACCEPTED" | "DECLINED";
  };
}

export interface Chat {
  id: string;
  clientName: string;
  clientAvatar?: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  hasOffer: boolean;
  messages: Message[];
}
