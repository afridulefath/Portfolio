import { ContactMessage } from '../types/message';

const STORAGE_KEY = 'DYNAMIC_PORTFOLIO_CONTACT_MESSAGES_V1';

const DEFAULT_MESSAGES: ContactMessage[] = [
  {
    id: 'msg-sample-1',
    name: 'Rahim Chowdhury',
    email: 'rahim.cloud@example.com',
    subject: 'Project Consultation & Architecture Review',
    message: 'Hello Alex, I came across your portfolio and was impressed by your enterprise cloud architecture background. We have a high-scale microservices migration project and would like to schedule a 30-min discovery call with you next week.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    formattedDate: new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(Date.now() - 3600000 * 5)),
    read: false,
    starred: true,
  },
  {
    id: 'msg-sample-2',
    name: 'Sarah Jenkins',
    email: 'sarah.j@fintechventures.io',
    subject: 'Senior Tech Lead Role Inquiry',
    message: 'Hi Alex, our engineering leadership team is expanding and we are looking for a Principal Architect. Your experience with Next.js, Kubernetes and zero-downtime deployments matches our current roadmap. Looking forward to connecting!',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    formattedDate: new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(Date.now() - 86400000)),
    read: true,
    starred: false,
  }
];

export class MessageService {
  /**
   * Retrieve all messages stored in localStorage
   */
  public static getMessages(): ContactMessage[] {
    if (typeof window === 'undefined') return DEFAULT_MESSAGES;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Initialize with default sample messages
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MESSAGES));
        return DEFAULT_MESSAGES;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_MESSAGES;
    }
  }

  /**
   * Save a new contact message
   */
  public static addMessage(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): ContactMessage {
    const messages = this.getMessages();
    const now = new Date();
    
    const newMessage: ContactMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: data.name.trim(),
      email: data.email.trim(),
      subject: data.subject.trim(),
      message: data.message.trim(),
      createdAt: now.toISOString(),
      formattedDate: new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(now),
      read: false,
      starred: false,
    };

    const updated = [newMessage, ...messages];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('portfolio_messages_updated', { detail: updated }));
    }

    return newMessage;
  }

  /**
   * Mark message as read
   */
  public static markAsRead(id: string, readState = true): void {
    const messages = this.getMessages();
    const updated = messages.map(msg => msg.id === id ? { ...msg, read: readState } : msg);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('portfolio_messages_updated', { detail: updated }));
    }
  }

  /**
   * Mark all messages as read
   */
  public static markAllAsRead(): void {
    const messages = this.getMessages();
    const updated = messages.map(msg => ({ ...msg, read: true }));
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('portfolio_messages_updated', { detail: updated }));
    }
  }

  /**
   * Toggle star status
   */
  public static toggleStar(id: string): void {
    const messages = this.getMessages();
    const updated = messages.map(msg => msg.id === id ? { ...msg, starred: !msg.starred } : msg);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('portfolio_messages_updated', { detail: updated }));
    }
  }

  /**
   * Delete a message by ID
   */
  public static deleteMessage(id: string): void {
    const messages = this.getMessages();
    const updated = messages.filter(msg => msg.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('portfolio_messages_updated', { detail: updated }));
    }
  }

  /**
   * Clear all messages
   */
  public static clearAllMessages(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      window.dispatchEvent(new CustomEvent('portfolio_messages_updated', { detail: [] }));
    }
  }

  /**
   * Get unread messages count
   */
  public static getUnreadCount(): number {
    const messages = this.getMessages();
    return messages.filter(m => !m.read).length;
  }
}
