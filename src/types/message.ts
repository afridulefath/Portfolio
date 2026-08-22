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
}
