import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  Mail, 
  Star, 
  Trash2, 
  CheckCheck, 
  Clock, 
  User, 
  ExternalLink, 
  Search, 
  Copy, 
  Check, 
  Reply, 
  AlertCircle,
  Sparkles,
  Filter,
  CheckCircle2,
  Settings,
  Send,
  MessageSquareReply,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ContactMessage } from '../types/message';
import { MessageService } from '../services/messageService';
import { EmailReplyModal } from './EmailReplyModal';
import { EmailConfigModal } from './EmailConfigModal';

interface MessagesInboxTabProps {
  darkMode?: boolean;
}

export const MessagesInboxTab: React.FC<MessagesInboxTabProps> = ({ darkMode = true }) => {
  const [messages, setMessages] = useState<ContactMessage[]>(() => MessageService.getMessages());
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const list = MessageService.getMessages();
    return list.length > 0 ? list[0].id : null;
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred' | 'replied'>('all');
  const [copied, setCopied] = useState<boolean>(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState<boolean>(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [showReplyHistory, setShowReplyHistory] = useState<boolean>(true);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      const msgs = e.detail || MessageService.getMessages();
      setMessages(msgs);
      if (selectedId && !msgs.some((m: ContactMessage) => m.id === selectedId)) {
        setSelectedId(msgs.length > 0 ? msgs[0].id : null);
      }
    };

    window.addEventListener('portfolio_messages_updated', handleUpdate);
    return () => window.removeEventListener('portfolio_messages_updated', handleUpdate);
  }, [selectedId]);

  const handleSelectMessage = (msg: ContactMessage) => {
    setSelectedId(msg.id);
    if (!msg.read) {
      MessageService.markAsRead(msg.id, true);
    }
  };

  const handleToggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    MessageService.toggleStar(id);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Are you sure you want to delete this message? / আপনি কি এই বার্তাটি মুছে ফেলতে চান?')) {
      MessageService.deleteMessage(id);
    }
  };

  const handleMarkAllRead = () => {
    MessageService.markAllAsRead();
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all messages? / আপনি কি সব বার্তা মুছে ফেলতে চান?')) {
      MessageService.clearAllMessages();
    }
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter messages
  const filteredMessages = messages.filter((msg) => {
    if (filter === 'unread' && msg.read) return false;
    if (filter === 'starred' && !msg.starred) return false;
    if (filter === 'replied' && !msg.replied) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        msg.name.toLowerCase().includes(q) ||
        msg.email.toLowerCase().includes(q) ||
        msg.subject.toLowerCase().includes(q) ||
        msg.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedMessage = messages.find((m) => m.id === selectedId) || null;
  const unreadCount = messages.filter((m) => !m.read).length;
  const starredCount = messages.filter((m) => m.starred).length;
  const repliedCount = messages.filter((m) => m.replied).length;

  return (
    <div className="space-y-6">
      {/* Tab Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Inbox className="w-5 h-5 text-indigo-400" />
            <span>বার্তা ইনবক্স ও ইমেইল রিপ্লাই (Messages Inbox & Email Reply)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            কন্টাক্ট ফর্ম থেকে আসা বার্তা পড়ুন এবং Gmail SMTP ও Supabase সিঙ্কের মাধ্যমে সরাসরি ভিজিটরের ইমেইলে উত্তর দিন।
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:border-slate-600 transition-all cursor-pointer"
            title="ইমেইল সার্ভার কনফিগারেশন (Gmail SMTP / Custom SMTP)"
          >
            <Settings className="w-3.5 h-3.5 text-indigo-400" />
            <span>ইমেইল সেটিংস</span>
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>সব পড়া হয়েছে করুন</span>
            </button>
          )}

          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ইনবক্স খালি করুন</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => setFilter('all')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            filter === 'all'
              ? 'border-indigo-500 bg-indigo-500/10 shadow-xs'
              : darkMode ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">মোট বার্তা (Total)</span>
            <Inbox className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xl font-bold mt-1">{messages.length}</p>
        </div>

        <div 
          onClick={() => setFilter('unread')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            filter === 'unread'
              ? 'border-emerald-500 bg-emerald-500/10 shadow-xs'
              : darkMode ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">অপঠিত (Unread)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <p className="text-xl font-bold mt-1 text-emerald-400">{unreadCount}</p>
        </div>

        <div 
          onClick={() => setFilter('starred')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            filter === 'starred'
              ? 'border-amber-500 bg-amber-500/10 shadow-xs'
              : darkMode ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">গুরুত্বপূর্ণ (Starred)</span>
            <Star className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-bold mt-1 text-amber-400">{starredCount}</p>
        </div>

        <div 
          onClick={() => setFilter('replied')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            filter === 'replied'
              ? 'border-sky-500 bg-sky-500/10 shadow-xs'
              : darkMode ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">উত্তর দেওয়া হয়েছে (Replied)</span>
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-xl font-bold mt-1 text-sky-400">{repliedCount}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="নাম, ইমেইল বা বিষয় দিয়ে খুঁজুন / Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border outline-none ${
              darkMode ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
            }`}
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-800/40 p-1 rounded-xl border border-slate-700/60 overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'unread' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('starred')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'starred' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Starred ({starredCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('replied')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'replied' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Replied ({repliedCount})
          </button>
        </div>
      </div>

      {/* Main Inbox Container: Two Column Layout */}
      {messages.length === 0 ? (
        <div className={`p-12 rounded-3xl border text-center space-y-3 ${
          darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <Inbox className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold">ইনবক্স খালি / No Messages Yet</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            আপনার কন্টাক্ট ফর্ম থেকে কেউ মেসেজ পাঠালে তা সাথে সাথে এখানে এসে জমা হবে এবং সরাসরি ইমেইল রিপ্লাই দেওয়া যাবে।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start min-h-[420px]">
          
          {/* Left Column: Messages List */}
          <div className={`lg:col-span-5 rounded-2xl border divide-y overflow-y-auto max-h-[560px] ${
            darkMode ? 'bg-slate-900/60 border-slate-800 divide-slate-800/60' : 'bg-white border-slate-200 divide-slate-100'
          }`}>
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                কোনো বার্তা মেলেনি
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedId === msg.id;
                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`p-4 cursor-pointer transition-all flex items-start gap-3 relative ${
                      isSelected
                        ? darkMode
                          ? 'bg-indigo-600/15 border-l-4 border-l-indigo-500'
                          : 'bg-indigo-50 border-l-4 border-l-indigo-600'
                        : darkMode
                          ? 'hover:bg-slate-800/50'
                          : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Unread indicator dot */}
                    {!msg.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5 shadow-sm shadow-emerald-500/50"></span>
                    )}

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs font-bold truncate ${
                          !msg.read ? (darkMode ? 'text-white' : 'text-slate-900') : 'text-slate-400'
                        }`}>
                          {msg.name}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {msg.formattedDate.split(',')[0]}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <p className={`text-xs truncate flex-1 ${
                          !msg.read ? 'font-semibold text-indigo-400' : 'text-slate-300'
                        }`}>
                          {msg.subject}
                        </p>
                        {msg.replied && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/20 shrink-0 flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Replied</span>
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {msg.message}
                      </p>
                    </div>

                    {/* Star toggle button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleStar(msg.id, e)}
                      className={`shrink-0 p-1 rounded-lg hover:bg-slate-800/40 transition-colors cursor-pointer ${
                        msg.starred ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                      }`}
                      title={msg.starred ? 'তারকাচিহ্নিত' : 'তারকাচিহ্ন দিন'}
                    >
                      <Star className={`w-3.5 h-3.5 ${msg.starred ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Selected Message Details */}
          <div className="lg:col-span-7 space-y-4">
            {selectedMessage ? (
              <div className={`p-6 rounded-2xl border space-y-5 ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                {/* Header with Sender Info and Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800/60">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center font-bold text-base shadow-md">
                      {selectedMessage.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">
                          {selectedMessage.name}
                        </h4>
                        {selectedMessage.starred && (
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        )}
                        {selectedMessage.replied && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>উত্তর দেওয়া হয়েছে</span>
                          </span>
                        )}
                      </div>
                      <a
                        href={`mailto:${selectedMessage.email}`}
                        className="text-xs text-indigo-400 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <Mail className="w-3 h-3" />
                        <span>{selectedMessage.email}</span>
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {/* Direct In-App Reply Button */}
                    <button
                      type="button"
                      onClick={() => setIsReplyModalOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
                      title="ইমেইল উত্তর পাঠান (In-App Reply via Gmail SMTP)"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>ইমেইল উত্তর দিন</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyMessage(`From: ${selectedMessage.name} (${selectedMessage.email})\nSubject: ${selectedMessage.subject}\nDate: ${selectedMessage.formattedDate}\n\n${selectedMessage.message}`)}
                      className="p-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="মেসেজ কপি করুন"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(selectedMessage.id)}
                      className="p-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                      title="মেসেজ মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subject & Timestamp Row */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">বিষয় / Subject</span>
                  <h3 className="text-lg font-bold text-slate-100">
                    {selectedMessage.subject}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>পাঠানোর সময়: {selectedMessage.formattedDate}</span>
                  </p>
                </div>

                {/* Message Body */}
                <div className={`p-4 rounded-xl border text-sm leading-relaxed whitespace-pre-wrap ${
                  darkMode ? 'bg-slate-950/60 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  {selectedMessage.message}
                </div>

                {/* Sent Reply History Thread Section */}
                {selectedMessage.replyHistory && selectedMessage.replyHistory.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-3">
                    <div 
                      onClick={() => setShowReplyHistory(!showReplyHistory)}
                      className="flex items-center justify-between cursor-pointer py-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <MessageSquareReply className="w-4 h-4" />
                        <span>প্রেরিত উত্তরের ইতিহাস (Reply History - {selectedMessage.replyHistory.length})</span>
                      </span>
                      {showReplyHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>

                    {showReplyHistory && (
                      <div className="space-y-3">
                        {selectedMessage.replyHistory.map((rep) => (
                          <div 
                            key={rep.id}
                            className={`p-4 rounded-2xl border text-xs space-y-2 ${
                              rep.status === 'sent'
                                ? darkMode ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-indigo-50/60 border-indigo-200'
                                : darkMode ? 'bg-red-950/20 border-red-500/30' : 'bg-red-50 border-red-200'
                            }`}
                          >
                            <div className="flex items-center justify-between flex-wrap gap-2 text-[11px]">
                              <span className="font-bold text-indigo-400 flex items-center gap-1">
                                <Send className="w-3 h-3" />
                                <span>To: {rep.recipientName} ({rep.recipientEmail})</span>
                              </span>
                              <span className="text-slate-400 font-mono text-[10px]">
                                {rep.formattedDate} · Provider: {rep.provider.toUpperCase()}
                              </span>
                            </div>

                            <p className="font-semibold text-slate-200">
                              {rep.replySubject}
                            </p>

                            <div className={`p-3 rounded-xl whitespace-pre-wrap font-sans text-xs leading-relaxed ${
                              darkMode ? 'bg-slate-950/60 text-slate-300' : 'bg-white text-slate-800'
                            }`}>
                              {rep.replyBody}
                            </div>

                            {rep.messageId && (
                              <p className="text-[10px] text-slate-500 font-mono">
                                Delivery Receipt ID: {rep.messageId}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div className={`p-12 rounded-2xl border text-center text-slate-400 text-xs ${
                darkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                বাম পাশ থেকে যেকোনো একটি বার্তা নির্বাচন করুন।
              </div>
            )}
          </div>

        </div>
      )}

      {/* In-App Interactive Reply Composer Modal */}
      {selectedMessage && (
        <EmailReplyModal
          message={selectedMessage}
          isOpen={isReplyModalOpen}
          onClose={() => setIsReplyModalOpen(false)}
          darkMode={darkMode}
          onOpenSettings={() => {
            setIsReplyModalOpen(false);
            setIsConfigModalOpen(true);
          }}
          onSuccess={() => {
            // Refreshes messages state
            setMessages(MessageService.getMessages());
          }}
        />
      )}

      {/* Email Server / API Configuration Modal */}
      <EmailConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        darkMode={darkMode}
      />
    </div>
  );
};

