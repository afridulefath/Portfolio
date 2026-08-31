import { createClient } from '@supabase/supabase-js';
import { ContactMessage, MessageReplyRecord, EmailSenderConfig } from '../types/message';

const STORAGE_KEY = 'DYNAMIC_PORTFOLIO_CONTACT_MESSAGES_V1';
const EMAIL_CONFIG_KEY = 'DYNAMIC_PORTFOLIO_EMAIL_CONFIG_V1';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const messageSupabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);

const DEFAULT_EMAIL_CONFIG: EmailSenderConfig = {
  provider: 'gmail',
  defaultSenderName: 'Alex Vance',
  defaultSignature: 'Best regards,\nAlex Vance\nPrincipal Distributed Systems & AI Solutions Architect\nhttps://alexvance.dev',
};

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
    replied: false,
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
    replied: true,
    lastRepliedAt: new Date(Date.now() - 80000000).toISOString(),
    replyHistory: [
      {
        id: 'reply-sample-1',
        replySubject: 'Re: Senior Tech Lead Role Inquiry',
        replyBody: 'Hi Sarah,\n\nThank you for reaching out and for your kind words regarding my architecture background. The Principal Architect position and your roadmap sound very exciting.\n\nI would be glad to hop on a discovery call next week. You can view my available slots at https://calendly.com or let me know a few time options that suit you best.\n\nLooking forward to speaking soon!',
        senderName: 'Alex Vance',
        senderEmail: 'alex.vance@architect.io',
        recipientName: 'Sarah Jenkins',
        recipientEmail: 'sarah.j@fintechventures.io',
        provider: 'gmail_smtp',
        sentAt: new Date(Date.now() - 80000000).toISOString(),
        formattedDate: new Intl.DateTimeFormat('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(new Date(Date.now() - 80000000)),
        status: 'sent',
        messageId: 'msg_20260831_sample_gmail',
        supabaseSynced: true,
      }
    ]
  }
];

export class MessageService {
  /**
   * Retrieve all messages stored in localStorage with background Supabase sync
   */
  public static getMessages(): ContactMessage[] {
    if (typeof window === 'undefined') return DEFAULT_MESSAGES;
    try {
      this.syncFromSupabase();

      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MESSAGES));
        return DEFAULT_MESSAGES;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_MESSAGES;
    }
  }

  /**
   * Retrieve email configuration
   */
  public static getEmailConfig(): EmailSenderConfig {
    if (typeof window === 'undefined') return DEFAULT_EMAIL_CONFIG;
    try {
      const stored = localStorage.getItem(EMAIL_CONFIG_KEY);
      if (!stored) return DEFAULT_EMAIL_CONFIG;
      return { ...DEFAULT_EMAIL_CONFIG, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_EMAIL_CONFIG;
    }
  }

  /**
   * Save email configuration
   */
  public static saveEmailConfig(config: EmailSenderConfig): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(EMAIL_CONFIG_KEY, JSON.stringify(config));
    }
  }

  /**
   * Save a new contact message and sync with Supabase
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
      replied: false,
      replyHistory: [],
      supabaseSynced: false,
    };

    const updated = [newMessage, ...messages];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('portfolio_messages_updated', { detail: updated }));
    }

    // Background push to Supabase
    this.pushMessageToSupabase(newMessage);

    return newMessage;
  }

  /**
   * Push a message to Supabase contact_messages table
   */
  private static async pushMessageToSupabase(message: ContactMessage) {
    if (!supabaseUrl || !supabaseAnonKey) return;
    try {
      const { error } = await messageSupabase
        .from('contact_messages')
        .upsert({
          id: message.id,
          name: message.name,
          email: message.email,
          subject: message.subject,
          message: message.message,
          read: message.read,
          starred: message.starred || false,
          replied: message.replied || false,
          last_replied_at: message.lastRepliedAt || null,
          reply_history: message.replyHistory || [],
          created_at: message.createdAt,
        });

      if (!error) {
        // Update synced flag
        const stored = this.getMessages();
        const flagged = stored.map((m) => (m.id === message.id ? { ...m, supabaseSynced: true } : m));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(flagged));
      }
    } catch (e) {
      console.warn('Supabase message push skipped/offline:', e);
    }
  }

  /**
   * Record a reply to a message and update replied status in local storage and Supabase
   */
  public static addReplyToMessage(
    messageId: string,
    reply: {
      replySubject: string;
      replyBody: string;
      senderName: string;
      senderEmail: string;
      recipientName: string;
      recipientEmail: string;
      provider: 'gmail_smtp' | 'smtp' | 'direct' | 'simulation';
      status: 'sent' | 'failed';
      messageId?: string;
      error?: string;
      supabaseSynced?: boolean;
    }
  ): MessageReplyRecord {
    const messages = this.getMessages();
    const now = new Date();

    const newReplyRecord: MessageReplyRecord = {
      id: `reply-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      replySubject: reply.replySubject,
      replyBody: reply.replyBody,
      senderName: reply.senderName,
      senderEmail: reply.senderEmail,
      recipientName: reply.recipientName,
      recipientEmail: reply.recipientEmail,
      provider: reply.provider,
      sentAt: now.toISOString(),
      formattedDate: new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(now),
      status: reply.status,
      messageId: reply.messageId,
      error: reply.error,
      supabaseSynced: reply.supabaseSynced || false,
    };

    let targetUpdatedMsg: ContactMessage | null = null;

    const updated = messages.map(msg => {
      if (msg.id === messageId) {
        const history = msg.replyHistory ? [...msg.replyHistory, newReplyRecord] : [newReplyRecord];
        const newMsgState = {
          ...msg,
          read: true,
          replied: reply.status === 'sent' ? true : msg.replied,
          lastRepliedAt: reply.status === 'sent' ? now.toISOString() : msg.lastRepliedAt,
          replyHistory: history,
        };
        targetUpdatedMsg = newMsgState;
        return newMsgState;
      }
      return msg;
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('portfolio_messages_updated', { detail: updated }));
    }

    // Sync sent status with Supabase
    if (targetUpdatedMsg) {
      this.syncReplyToSupabase(messageId, newReplyRecord, targetUpdatedMsg);
    }

    return newReplyRecord;
  }

  /**
   * Sync Sent Status to Supabase
   */
  private static async syncReplyToSupabase(
    messageId: string,
    reply: MessageReplyRecord,
    updatedMessage: ContactMessage
  ) {
    if (!supabaseUrl || !supabaseAnonKey) return;
    try {
      // 1. Insert into contact_replies
      await messageSupabase
        .from('contact_replies')
        .insert([{
          id: reply.id,
          message_id: messageId,
          recipient_email: reply.recipientEmail,
          recipient_name: reply.recipientName,
          reply_subject: reply.replySubject,
          reply_body: reply.replyBody,
          sender_name: reply.senderName,
          sender_email: reply.senderEmail,
          delivery_receipt_id: reply.messageId,
          provider: reply.provider,
          status: reply.status,
          sent_at: reply.sentAt,
        }]);

      // 2. Update contact_messages
      await messageSupabase
        .from('contact_messages')
        .update({
          replied: updatedMessage.replied,
          last_replied_at: updatedMessage.lastRepliedAt,
          reply_history: updatedMessage.replyHistory,
          read: true,
        })
        .eq('id', messageId);
    } catch (err) {
      console.warn('Supabase reply sync skipped/offline:', err);
    }
  }

  /**
   * Dispatch a reply email through the backend API (/api/send-reply) with Gmail SMTP
   */
  public static async sendReplyEmail(params: {
    originalMessageId: string;
    originalMessageText?: string;
    recipientEmail: string;
    recipientName: string;
    replySubject: string;
    replyBody: string;
    senderName?: string;
    senderEmail?: string;
  }): Promise<{ success: boolean; messageId?: string; provider?: string; error?: string; simulated?: boolean; supabaseSynced?: boolean }> {
    const config = this.getEmailConfig();
    const senderName = params.senderName || config.gmailFromName || config.defaultSenderName || 'Alex Vance';
    const senderEmail = params.senderEmail || config.gmailUser || config.smtpFrom || 'alex.vance@architect.io';

    try {
      const response = await fetch('/api/send-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalMessageId: params.originalMessageId,
          originalMessageText: params.originalMessageText,
          recipientEmail: params.recipientEmail,
          recipientName: params.recipientName,
          replySubject: params.replySubject,
          replyBody: params.replyBody,
          senderName,
          senderEmail,
          customConfig: {
            provider: config.provider,
            gmailUser: config.gmailUser,
            gmailAppPassword: config.gmailAppPassword,
            gmailFromName: config.gmailFromName,
            smtpHost: config.smtpHost,
            smtpPort: config.smtpPort,
            smtpSecure: config.smtpSecure,
            smtpUser: config.smtpUser,
            smtpPass: config.smtpPass,
            smtpFrom: config.smtpFrom,
          }
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Record successful reply
        this.addReplyToMessage(params.originalMessageId, {
          replySubject: params.replySubject,
          replyBody: params.replyBody,
          senderName,
          senderEmail,
          recipientName: params.recipientName,
          recipientEmail: params.recipientEmail,
          provider: data.provider || 'gmail_smtp',
          status: 'sent',
          messageId: data.messageId,
          supabaseSynced: Boolean(data.supabaseSynced),
        });

        return {
          success: true,
          messageId: data.messageId,
          provider: data.provider,
          simulated: data.simulated,
          supabaseSynced: data.supabaseSynced,
        };
      } else {
        const errorMsg = data.error || 'Failed to send reply email via Gmail SMTP.';
        // Record failed attempt
        this.addReplyToMessage(params.originalMessageId, {
          replySubject: params.replySubject,
          replyBody: params.replyBody,
          senderName,
          senderEmail,
          recipientName: params.recipientName,
          recipientEmail: params.recipientEmail,
          provider: 'gmail_smtp',
          status: 'failed',
          error: errorMsg,
        });

        return {
          success: false,
          error: errorMsg,
        };
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Network error or backend unreachable';
      this.addReplyToMessage(params.originalMessageId, {
        replySubject: params.replySubject,
        replyBody: params.replyBody,
        senderName,
        senderEmail,
        recipientName: params.recipientName,
        recipientEmail: params.recipientEmail,
        provider: 'gmail_smtp',
        status: 'failed',
        error: errorMsg,
      });

      return {
        success: false,
        error: errorMsg,
      };
    }
  }

  /**
   * Sync Messages from Supabase
   */
  private static async syncFromSupabase() {
    if (typeof window === 'undefined') return;
    if (!supabaseUrl || !supabaseAnonKey) return;

    try {
      const { data, error } = await messageSupabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && Array.isArray(data) && data.length > 0 && !error) {
        const mapped: ContactMessage[] = data.map((item: any) => ({
          id: item.id,
          name: item.name || '',
          email: item.email || '',
          subject: item.subject || '',
          message: item.message || '',
          createdAt: item.created_at || new Date().toISOString(),
          formattedDate: new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }).format(new Date(item.created_at || Date.now())),
          read: Boolean(item.read),
          starred: Boolean(item.starred),
          replied: Boolean(item.replied),
          lastRepliedAt: item.last_replied_at || undefined,
          replyHistory: Array.isArray(item.reply_history) ? item.reply_history : [],
          supabaseSynced: true,
        }));

        const local = localStorage.getItem(STORAGE_KEY);
        if (!local || JSON.parse(local).length < mapped.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
          window.dispatchEvent(new CustomEvent('portfolio_messages_updated', { detail: mapped }));
        }
      }
    } catch {
      // Offline fallback
    }
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

    if (supabaseUrl && supabaseAnonKey) {
      messageSupabase
        .from('contact_messages')
        .update({ read: readState })
        .eq('id', id)
        .then(() => {});
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

    if (supabaseUrl && supabaseAnonKey) {
      messageSupabase
        .from('contact_messages')
        .update({ read: true })
        .then(() => {});
    }
  }

  /**
   * Toggle star status
   */
  public static toggleStar(id: string): void {
    const messages = this.getMessages();
    const target = messages.find(m => m.id === id);
    const newStarred = target ? !target.starred : true;
    const updated = messages.map(msg => msg.id === id ? { ...msg, starred: newStarred } : msg);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('portfolio_messages_updated', { detail: updated }));
    }

    if (supabaseUrl && supabaseAnonKey) {
      messageSupabase
        .from('contact_messages')
        .update({ starred: newStarred })
        .eq('id', id)
        .then(() => {});
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

    if (supabaseUrl && supabaseAnonKey) {
      messageSupabase
        .from('contact_messages')
        .delete()
        .eq('id', id)
        .then(() => {});
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

