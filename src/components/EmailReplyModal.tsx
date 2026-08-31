import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Mail, 
  User, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Settings, 
  FileText, 
  Quote, 
  ShieldCheck,
  Clock,
  RefreshCw,
  Eye,
  Sliders,
  Check
} from 'lucide-react';
import { ContactMessage } from '../types/message';
import { MessageService } from '../services/messageService';

interface EmailReplyModalProps {
  message: ContactMessage;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  darkMode?: boolean;
  onOpenSettings?: () => void;
}

const QUICK_TEMPLATES = [
  {
    id: 't-meeting',
    title: '📅 শিডিউল কল ও মিটিং (Meeting Invite)',
    subjectPrefix: 'Re: ',
    body: (name: string) => `Hi ${name},\n\nThank you for reaching out through my portfolio! I would be very happy to discuss your requirements and how we can collaborate.\n\nPlease feel free to pick a 30-minute slot that works best for your schedule here: https://calendly.com or let me know a couple of time windows next week.\n\nLooking forward to speaking with you!`,
  },
  {
    id: 't-project',
    title: '💼 প্রজেক্ট রিভিউ ও ফলো-আপ (Project Consultation)',
    subjectPrefix: 'Re: ',
    body: (name: string) => `Hi ${name},\n\nThank you for sharing the project details with me. I reviewed your inquiry regarding high-scale engineering and cloud infrastructure.\n\nI have experience delivering similar production workloads and would love to dive deeper into the technical architecture with your team. Could you share any technical specifications or timeline targets you have in mind?\n\nBest regards,`,
  },
  {
    id: 't-thanks',
    title: '🤝 সাধারণ ধন্যবাদ ও একনলেজমেন্ট (General Thanks)',
    subjectPrefix: 'Re: ',
    body: (name: string) => `Hi ${name},\n\nThank you for getting in touch! I have received your message and appreciate you taking the time to write.\n\nI am currently reviewing the details and will get back to you with a comprehensive follow-up shortly.\n\nWarm regards,`,
  },
];

export const EmailReplyModal: React.FC<EmailReplyModalProps> = ({
  message,
  isOpen,
  onClose,
  onSuccess,
  darkMode = true,
  onOpenSettings,
}) => {
  const emailConfig = MessageService.getEmailConfig();

  const [subject, setSubject] = useState<string>(() => {
    return message.subject.startsWith('Re:') ? message.subject : `Re: ${message.subject}`;
  });
  const [senderName, setSenderName] = useState<string>(emailConfig.defaultSenderName || emailConfig.gmailFromName || 'Alex Vance');
  const [senderEmail, setSenderEmail] = useState<string>(emailConfig.gmailUser || emailConfig.smtpFrom || 'alex.vance@architect.io');
  const [replyBody, setReplyBody] = useState<string>(() => {
    return `Hi ${message.name},\n\nThank you for reaching out regarding "${message.subject}".\n\n`;
  });
  const [includeQuote, setIncludeQuote] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [resultState, setResultState] = useState<{
    status: 'idle' | 'success' | 'error';
    message?: string;
    messageId?: string;
    provider?: string;
    simulated?: boolean;
  }>({ status: 'idle' });

  const [activeTab, setActiveTab] = useState<'compose' | 'preview'>('compose');

  useEffect(() => {
    if (isOpen) {
      setSubject(message.subject.startsWith('Re:') ? message.subject : `Re: ${message.subject}`);
      setReplyBody(`Hi ${message.name},\n\nThank you for reaching out regarding "${message.subject}".\n\n`);
      setResultState({ status: 'idle' });
      setActiveTab('compose');
    }
  }, [isOpen, message]);

  if (!isOpen) return null;

  const handleApplyTemplate = (templateBody: string) => {
    setReplyBody(templateBody);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!replyBody.trim()) {
      setResultState({ status: 'error', message: 'অনুগ্রহ করে উত্তরের টেক্সট লিখুন (Reply text cannot be empty).' });
      return;
    }

    if (!subject.trim()) {
      setResultState({ status: 'error', message: 'অনুগ্রহ করে ইমেইলের বিষয় লিখুন (Subject is required).' });
      return;
    }

    setIsSending(true);
    setResultState({ status: 'idle' });

    try {
      const fullReplyWithSignature = emailConfig.defaultSignature
        ? `${replyBody.trim()}\n\n${emailConfig.defaultSignature}`
        : replyBody.trim();

      const res = await MessageService.sendReplyEmail({
        originalMessageId: message.id,
        originalMessageText: includeQuote ? message.message : undefined,
        recipientEmail: message.email,
        recipientName: message.name,
        replySubject: subject.trim(),
        replyBody: fullReplyWithSignature,
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
      });

      setIsSending(false);

      if (res.success) {
        setResultState({
          status: 'success',
          message: `ইমেইল সফলভাবে পাঠানো হয়েছে (${message.email}-এ ডেলিভার করা হয়েছে)।`,
          messageId: res.messageId,
          provider: res.provider,
          simulated: res.simulated,
        });
        if (onSuccess) onSuccess();
      } else {
        setResultState({
          status: 'error',
          message: res.error || 'ইমেইল পাঠাতে ব্যর্থ হয়েছে। অনুগ্রহ করে সেটিংস বা ইন্টারনেট কানেকশন চেক করুন।',
        });
      }
    } catch (err: any) {
      setIsSending(false);
      setResultState({
        status: 'error',
        message: err.message || 'একটি অপ্রত্যাশিত সমস্যা দেখা দিয়েছে।',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className={`w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden my-6 transition-all ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className={`p-5 sm:p-6 border-b flex items-center justify-between gap-4 ${
          darkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/15 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span>ইমেইল উত্তর পাঠান (Send Email Reply)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Gmail SMTP & Supabase</span>
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                প্রাপক: <strong className="text-indigo-400">{message.name}</strong> &lt;{message.email}&gt;
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="p-2 rounded-xl border border-slate-700/60 bg-slate-800/60 text-slate-300 hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
                title="ইমেইল সার্ভার কনফিগারেশন (Email Settings)"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-700/60 bg-slate-800/60 text-slate-300 hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Notification Banner */}
        {resultState.status === 'success' && (
          <div className="p-4 bg-emerald-500/10 border-b border-emerald-500/30 text-emerald-400 flex items-start gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm">
              <p className="font-bold">{resultState.message}</p>
              <p className="text-[11px] text-emerald-300/80 mt-0.5">
                Receipt Message ID: <code className="font-mono bg-emerald-950/40 px-1 py-0.5 rounded">{resultState.messageId}</code> (Provider: {resultState.provider})
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              সম্পন্ন / Close
            </button>
          </div>
        )}

        {resultState.status === 'error' && (
          <div className="p-4 bg-red-500/10 border-b border-red-500/30 text-red-400 flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm">
              <p className="font-bold">ইমেইল পাঠানো যায়নি</p>
              <p className="text-[11px] text-red-300/80 mt-0.5">{resultState.message}</p>
            </div>
          </div>
        )}

        {/* Modal Form Body */}
        <form onSubmit={handleSendReply} className="p-5 sm:p-6 space-y-5">
          
          {/* Quick Snippet Templates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>দ্রুত উত্তর টেমপ্লেট (Quick Templates)</span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('compose')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    activeTab === 'compose' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    activeTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Preview HTML
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {QUICK_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl.body(message.name))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    darkMode
                      ? 'bg-slate-800/80 border-slate-700 hover:border-indigo-500 hover:bg-slate-800 text-slate-200'
                      : 'bg-slate-100 border-slate-200 hover:border-indigo-500 text-slate-700'
                  }`}
                >
                  {tmpl.title}
                </button>
              ))}
            </div>
          </div>

          {/* Email Headers Form Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Recipient info (Readonly) */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400">
                To (প্রাপক)
              </label>
              <div className={`px-3.5 py-2.5 rounded-xl text-xs border font-mono truncate flex items-center gap-2 ${
                darkMode ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{message.name} &lt;{message.email}&gt;</span>
              </div>
            </div>

            {/* Sender info */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400">
                From (প্রেরক নাম ও ঠিকানা)
              </label>
              <input
                type="text"
                value={`${senderName} <${senderEmail}>`}
                onChange={(e) => {
                  const val = e.target.value;
                  const match = val.match(/^(.*?)\s*<([^>]+)>$/);
                  if (match) {
                    setSenderName(match[1].trim());
                    setSenderEmail(match[2].trim());
                  } else {
                    setSenderName(val);
                  }
                }}
                placeholder="Alex Vance <alex.vance@architect.io>"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none font-mono ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

          </div>

          {/* Subject Field */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-400">
              Subject (ইমেইল বিষয়)
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Re: Inquiries..."
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-none ${
                darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Composer Body / Preview */}
          {activeTab === 'compose' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-400">
                  Message Body (উত্তরের বার্তা বিবরণী)
                </label>
                <span className="text-[11px] text-slate-500">
                  {replyBody.length} characters
                </span>
              </div>
              <textarea
                rows={8}
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Write your email reply here..."
                className={`w-full p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed border outline-none resize-y font-sans ${
                  darkMode ? 'bg-slate-950/80 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400">
                HTML Email Preview (প্রাপক যেভাবে দেখতে পাবেন)
              </label>
              <div className={`p-4 rounded-xl border max-h-[260px] overflow-y-auto text-xs sm:text-sm space-y-3 ${
                darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                <div className="p-3 bg-indigo-600 text-white rounded-lg font-bold text-xs">
                  {senderName} — Response to inquiry
                </div>
                <div className="whitespace-pre-wrap leading-relaxed">
                  {replyBody}
                  {emailConfig.defaultSignature && `\n\n${emailConfig.defaultSignature}`}
                </div>
                {includeQuote && (
                  <div className="p-3 border-l-2 border-indigo-500 bg-slate-800/40 rounded text-slate-400 text-xs italic">
                    <p className="font-bold text-[10px] text-slate-300 uppercase">Original Message from {message.name}:</p>
                    <p className="mt-1">{message.message}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Include Quote & Security Notice */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeQuote}
                onChange={(e) => setIncludeQuote(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Quote className="w-3.5 h-3.5 text-indigo-400" />
                <span>মূল বার্তার উক্তি সংযুক্ত করুন (Include Original Message Quote)</span>
              </span>
            </label>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Anti-Spam & Injection Protected</span>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/60">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-700 bg-slate-800/60 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              বাতিল / Cancel
            </button>

            <button
              type="submit"
              disabled={isSending}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>ইমেইল পাঠানো হচ্ছে (Sending)...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>উত্তর পাঠিয়ে দিন (Send Reply)</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
