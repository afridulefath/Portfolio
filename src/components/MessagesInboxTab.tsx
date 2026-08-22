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
  Filter
} from 'lucide-react';
import { ContactMessage } from '../types/message';
import { MessageService } from '../services/messageService';

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
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');
  const [copied, setCopied] = useState<boolean>(false);

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

  return (
    <div className="space-y-6">
      {/* Tab Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Inbox className="w-5 h-5 text-indigo-400" />
            <span>বার্তা ইনবক্স (Contact Messages Inbox)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            কন্টাক্ট ফর্ম থেকে ভিজিটর ও ক্লায়েন্টদের পাঠানো সমস্ত বার্তা এখানে সরাসরি প্রদর্শিত ও সংরক্ষিত হয়।
          </p>
        </div>

        <div className="flex items-center gap-2">
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
      <div className="grid grid-cols-3 gap-3">
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
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3">
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

        <div className="flex items-center gap-1 bg-slate-800/40 p-1 rounded-xl border border-slate-700/60">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === 'unread' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('starred')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === 'starred' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Starred
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
            আপনার কন্টাক্ট ফর্ম থেকে কেউ মেসেজ পাঠালে তা সাথে সাথে এখানে এসে জমা হবে।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start min-h-[420px]">
          
          {/* Left Column: Messages List */}
          <div className={`lg:col-span-5 rounded-2xl border divide-y overflow-y-auto max-h-[500px] ${
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

                      <p className={`text-xs truncate ${
                        !msg.read ? 'font-semibold text-indigo-400' : 'text-slate-300'
                      }`}>
                        {msg.subject}
                      </p>

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
          <div className="lg:col-span-7">
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
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <span>{selectedMessage.name}</span>
                        {selectedMessage.starred && (
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        )}
                      </h4>
                      <a
                        href={`mailto:${selectedMessage.email}`}
                        className="text-xs text-indigo-400 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <Mail className="w-3 h-3" />
                        <span>{selectedMessage.email}</span>
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-xs cursor-pointer"
                      title="ইমেইলে উত্তর দিন"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>ইমেইলে উত্তর দিন</span>
                    </a>

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
    </div>
  );
};
