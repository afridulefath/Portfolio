import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Settings, 
  Mail, 
  Server, 
  Key, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  HelpCircle,
  ExternalLink,
  Lock,
  Database
} from 'lucide-react';
import { EmailSenderConfig } from '../types/message';
import { MessageService } from '../services/messageService';

interface EmailConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

export const EmailConfigModal: React.FC<EmailConfigModalProps> = ({
  isOpen,
  onClose,
  darkMode = true,
}) => {
  const [config, setConfig] = useState<EmailSenderConfig>(() => MessageService.getEmailConfig());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [serverStatus, setServerStatus] = useState<{
    hasGmail: boolean;
    gmailUser?: string;
    hasSupabase: boolean;
    defaultProvider: string;
    senderName?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(MessageService.getEmailConfig());
      setSavedSuccess(false);

      // Check server env configuration status
      fetch('/api/email-config-status')
        .then((res) => res.json())
        .then((data) => setServerStatus(data))
        .catch(() => setServerStatus(null));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    MessageService.saveEmailConfig(config);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden my-6 transition-all ${
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
                <span>Gmail SMTP ও ইমেইল রিপ্লাই কনফিগারেশন</span>
              </h3>
              <p className="text-xs text-slate-400">
                Gmail App Password এবং Supabase ডাটাবেজ স্ট্যাটাস সিঙ্ক সেটিংস
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border border-slate-700/60 bg-slate-800/60 text-slate-300 hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Server & Supabase Status Banner */}
        {serverStatus && (
          <div className={`px-6 py-3 border-b text-xs flex items-center justify-between flex-wrap gap-2 ${
            darkMode ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-100/70 border-slate-200 text-slate-600'
          }`}>
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${serverStatus.hasGmail ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <span>
                Gmail SMTP: <strong>{serverStatus.hasGmail ? `Ready (${serverStatus.gmailUser || 'Active'})` : 'Credentials via UI / Env'}</strong>
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-indigo-400">
              <Database className="w-3.5 h-3.5" />
              <span>Supabase Sync: Active</span>
            </span>
          </div>
        )}

        {savedSuccess && (
          <div className="p-4 bg-emerald-500/10 border-b border-emerald-500/30 text-emerald-400 flex items-center gap-3 animate-fade-in text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>ইমেইল কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-6">
          
          {/* Provider Selector: Gmail SMTP vs Custom SMTP */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Email Dispatch Engine (সার্ভার প্রোটোকল)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfig({ ...config, provider: 'gmail' })}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  config.provider === 'gmail' || !config.provider
                    ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400 font-bold shadow-xs'
                    : darkMode ? 'bg-slate-800/40 border-slate-700/60 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-bold">Gmail SMTP (App Password)</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Google একাউন্টের ১৬ অক্ষরের অ্যাপ পাসওয়ার্ড দিয়ে নিরাপদ ডেলিভারি</p>
              </button>

              <button
                type="button"
                onClick={() => setConfig({ ...config, provider: 'smtp' })}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  config.provider === 'smtp'
                    ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400 font-bold shadow-xs'
                    : darkMode ? 'bg-slate-800/40 border-slate-700/60 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold">Custom SMTP Server</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">কাস্টম হোস্ট, পোর্ট ও SSL/TLS মেইল সার্ভার কনফিগারেশন</p>
              </button>
            </div>
          </div>

          {/* Gmail SMTP Settings */}
          {(config.provider === 'gmail' || !config.provider) && (
            <div className={`p-4 rounded-2xl border space-y-4 ${
              darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Gmail Credentials (Google App Password)
                  </h4>
                </div>
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>Generate App Password</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Instructions Box */}
              <div className={`p-3 rounded-xl border text-[11px] leading-relaxed space-y-1 ${
                darkMode ? 'bg-indigo-950/20 border-indigo-500/20 text-indigo-200' : 'bg-indigo-50 border-indigo-100 text-indigo-900'
              }`}>
                <p className="font-bold flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Google App Password তৈরির সহজ ধাপ:</span>
                </p>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-400 pl-1">
                  <li>Google Account-এ <strong>2-Step Verification</strong> চালু করুন।</li>
                  <li><a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-indigo-400 underline">myaccount.google.com/apppasswords</a> এ যান।</li>
                  <li>একটি অ্যাপ নাম দিন (যেমন: "Portfolio Reply") এবং তৈরি হওয়া <strong>১৬ অক্ষরের পাসওয়ার্ডটি</strong> নিচে বসান।</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-400">
                    Gmail User (আপনার জিমেইল এড্রেস)
                  </label>
                  <input
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={config.gmailUser || ''}
                    onChange={(e) => setConfig({ ...config, gmailUser: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none font-mono ${
                      darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-400">
                    Gmail App Password (১৬ অক্ষরের পাসওয়ার্ড)
                  </label>
                  <input
                    type="password"
                    placeholder="abcd efgh ijkl mnop"
                    value={config.gmailAppPassword || ''}
                    onChange={(e) => setConfig({ ...config, gmailAppPassword: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none font-mono ${
                      darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Custom SMTP Settings */}
          {config.provider === 'smtp' && (
            <div className={`p-4 rounded-2xl border space-y-3 ${
              darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Custom SMTP Server Configuration
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-400">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    placeholder="mail.yourdomain.com"
                    value={config.smtpHost || ''}
                    onChange={(e) => setConfig({ ...config, smtpHost: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none font-mono ${
                      darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-400">
                    Port (587 / 465)
                  </label>
                  <input
                    type="number"
                    placeholder="587"
                    value={config.smtpPort || 587}
                    onChange={(e) => setConfig({ ...config, smtpPort: parseInt(e.target.value) || 587 })}
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none font-mono ${
                      darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-400">
                    SMTP Username / Email
                  </label>
                  <input
                    type="text"
                    placeholder="user@example.com"
                    value={config.smtpUser || ''}
                    onChange={(e) => setConfig({ ...config, smtpUser: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none font-mono ${
                      darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-400">
                    SMTP Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••"
                    value={config.smtpPass || ''}
                    onChange={(e) => setConfig({ ...config, smtpPass: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none font-mono ${
                      darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Default Sender Name & Signature */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-400">
                  Default Sender Display Name
                </label>
                <input
                  type="text"
                  placeholder="Alex Vance"
                  value={config.defaultSenderName || config.gmailFromName || ''}
                  onChange={(e) => setConfig({ ...config, defaultSenderName: e.target.value, gmailFromName: e.target.value })}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs border outline-none ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-400">
                  Default Sender Email Address
                </label>
                <input
                  type="email"
                  placeholder="alex.vance@architect.io"
                  value={config.gmailUser || config.smtpFrom || ''}
                  onChange={(e) => setConfig({ ...config, gmailUser: e.target.value, smtpFrom: e.target.value })}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs border outline-none font-mono ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400">
                Default Email Signature (স্বয়ংক্রিয় স্বাক্ষর)
              </label>
              <textarea
                rows={3}
                placeholder="Best regards,&#10;Alex Vance&#10;Principal Distributed Systems & AI Solutions Architect&#10;https://alexvance.dev"
                value={config.defaultSignature || ''}
                onChange={(e) => setConfig({ ...config, defaultSignature: e.target.value })}
                className={`w-full p-3 rounded-xl text-xs border outline-none resize-none ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-700 bg-slate-800/60 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              বন্ধ করুন / Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>সেটিংস সংরক্ষণ করুন (Save Settings)</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
