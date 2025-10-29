import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Message } from '@/types/message';
import { useAuth } from './AuthContext';

interface MessagingContextType {
  messages: Message[];
  sendMessage: (content: string, recipientIds: string[], recipientRoles?: string[], parentMessageId?: string) => void;
  markAsRead: (messageId: string) => void;
  unreadCount: number;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

// Mock users for recipient selection
export const mockUsers = [
  { id: '0', name: 'Super Administrator', role: 'super_admin', location: 'HQ' },
  { id: '1', name: 'John Administrator', role: 'admin', location: 'PTC' },
  { id: '2', name: 'Priya Admin', role: 'admin', location: 'VGTAP' },
  { id: '3', name: 'Rajesh Kumar', role: 'admin', location: 'NCR' },
  { id: '4', name: 'Ananya Sharma', role: 'admin', location: 'BLR' },
  { id: '5', name: 'Sarah Trainer', role: 'trainer', location: 'PTC' },
  { id: '6', name: 'Mike Security', role: 'security', location: 'PTC' },
];

export function MessagingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);

  // Load messages from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('app_messages');
    if (stored) {
      const parsed = JSON.parse(stored);
      setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('app_messages', JSON.stringify(messages));
    }
  }, [messages]);

  const sendMessage = (content: string, recipientIds: string[], recipientRoles?: string[], parentMessageId?: string) => {
    if (!user) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      recipientIds,
      recipientRoles,
      content,
      timestamp: new Date(),
      read: false,
      parentMessageId,
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const markAsRead = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg => (msg.id === messageId ? { ...msg, read: true } : msg))
    );
  };

  const unreadCount = messages.filter(
    msg => 
      !msg.read && 
      msg.senderId !== user?.id &&
      (msg.recipientIds.length === 0 || 
       msg.recipientIds.includes(user?.id || '') ||
       msg.recipientRoles?.includes(user?.role || ''))
  ).length;

  return (
    <MessagingContext.Provider value={{ messages, sendMessage, markAsRead, unreadCount }}>
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
}