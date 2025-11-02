export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientIds: string[]; // empty array means broadcast to all
  recipientRoles?: string[]; // specific roles to broadcast to
  locationFilter?: string; // location restriction for admin broadcasts
  content: string;
  timestamp: Date;
  read: boolean;
  parentMessageId?: string; // for replies
}

export interface MessageThread {
  id: string;
  participants: string[];
  lastMessage: Message;
  unreadCount: number;
}