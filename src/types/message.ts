export interface MessageReplyRecord {
  id: string;
  replySubject: string;
  replyBody: string;
  senderName: string;
  senderEmail: string;
  recipientEmail: string;
  recipientName: string;
  provider: 'gmail_smtp' | 'smtp' | 'direct' | 'simulation';
  sentAt: string;
  formattedDate: string;
  status: 'sent' | 'failed';
  messageId?: string;
  error?: string;
  supabaseSynced?: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string; // ISO string
  formattedDate: string; // e.g. "22 Aug 2026, 03:30 PM"
  read: boolean;
  starred?: boolean;
  replied?: boolean;
  lastRepliedAt?: string;
  replyHistory?: MessageReplyRecord[];
  supabaseSynced?: boolean;
}

export interface EmailSenderConfig {
  provider: 'gmail' | 'smtp';
  gmailUser?: string;
  gmailAppPassword?: string;
  gmailFromName?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPass?: string;
  smtpFrom?: string;
  defaultSenderName?: string;
  defaultSignature?: string;
}

