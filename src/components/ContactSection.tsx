import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  Calendar, 
  CheckCircle2, 
  Copy, 
  Check, 
  AlertCircle,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PortfolioData } from '../types/portfolio';
import { SocialIcon } from './SocialIcon';
import { MessageService } from '../services/messageService';

interface ContactSectionProps {
  data: PortfolioData;
  darkMode: boolean;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ data, darkMode }) => {
  const { contact, personal, siteSettings, socials } = data;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '', // Spam bot protection
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [userLocalTime, setUserLocalTime] = useState<string>('');

  useEffect(() => {
    // Show live time in specified timezone
    const updateTime = () => {
      try {
        const timeString = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/Los_Angeles',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: true,
        }).format(new Date());
        setUserLocalTime(timeString);
      } catch {
        setUserLocalTime(new Date().toLocaleTimeString());
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text: string, type: 'email' | 'phone') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Please enter your full name';
    if (!formData.email.trim()) {
      errors.email = 'Please enter your email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.subject.trim()) errors.subject = 'Please enter a subject';
    if (!formData.message.trim()) {
      errors.message = 'Please enter your message';
    } else if (formData.message.trim().length < 15) {
      errors.message = 'Message must be at least 15 characters long';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Spam honeypot detection
    if (formData.honeypot) {
      console.warn('Spam submission detected and blocked.');
      return;
    }

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Save message to MessageService so it appears in CMS Studio Inbox
      MessageService.addMessage({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

      await new Promise((resolve) => setTimeout(resolve, 600));

      setIsSubmitted(true);
      setIsSubmitting(false);

      // Trigger Confetti
      if (siteSettings.enableConfetti) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      }
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({ name: '', email: '', subject: '', message: '', honeypot: '' });
    setFormErrors({});
    setIsSubmitted(false);
  };

  return (
    <section 
      id="contact" 
      className={`py-24 sm:py-32 transition-colors duration-300 scroll-mt-20 ${
        darkMode ? 'bg-slate-900/40 border-t border-slate-800/80' : 'bg-slate-50/60 border-t border-slate-200/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Mail className="w-3.5 h-3.5" />
            <span>Direct Inquiries</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Let's Discuss Opportunities & Projects
          </h2>
          <p className={`text-base sm:text-lg leading-relaxed ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Have an open architecture role, consulting engagement, or keynote invite? Send a direct message or schedule a call.
          </p>
        </div>

        {/* Two Column Layout: Contact Channels & Interactive Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Direct Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Email Card */}
            <div className={`p-6 rounded-3xl border transition-all ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider ${
                      darkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      Direct Email
                    </p>
                    <a 
                      href={`mailto:${contact.email}`}
                      className={`text-sm sm:text-base font-bold hover:text-indigo-500 transition-colors ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {contact.email}
                    </a>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(contact.email, 'email')}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    darkMode ? 'border-slate-800 bg-slate-800 text-slate-300 hover:text-white' : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                  title="Copy email to clipboard"
                >
                  {copiedEmail ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Phone Card */}
            <div className={`p-6 rounded-3xl border transition-all ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider ${
                      darkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      Phone & WhatsApp
                    </p>
                    <a 
                      href={`tel:${contact.phone}`}
                      className={`text-sm sm:text-base font-bold hover:text-emerald-500 transition-colors ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {contact.phone}
                    </a>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(contact.phone, 'phone')}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    darkMode ? 'border-slate-800 bg-slate-800 text-slate-300 hover:text-white' : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                  title="Copy phone to clipboard"
                >
                  {copiedPhone ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Location & Timezone Details */}
            <div className={`p-6 rounded-3xl border space-y-4 ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Location
                  </p>
                  <p className={`text-sm sm:text-base font-bold ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {contact.location}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/60 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Timezone:</span>
                  <span className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    {contact.timezone}
                  </span>
                  {userLocalTime && (
                    <span className="block text-[11px] text-indigo-400 font-mono mt-0.5">
                      Current: {userLocalTime}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Office Hours:</span>
                  <span className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    {contact.workingHours}
                  </span>
                </div>
              </div>
            </div>

            {/* Schedule Meeting CTA */}
            {contact.calendlyUrl && (
              <a
                href={contact.calendlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-6 rounded-3xl border flex items-center justify-between group transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
                  darkMode
                    ? 'bg-gradient-to-r from-indigo-950/40 to-slate-900 border-indigo-500/30 hover:border-indigo-400'
                    : 'bg-gradient-to-r from-indigo-50 to-white border-indigo-200 hover:border-indigo-300 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold group-hover:text-indigo-500 transition-colors ${
                      darkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      Book a 30-Min Strategy Call
                    </p>
                    <p className="text-xs text-slate-400">
                      Sync calendar directly via Calendly
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-indigo-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            )}

            {/* Social Media & Instant Channels */}
            {socials && socials.filter(s => s.enabled).length > 0 && (
              <div className={`p-6 rounded-3xl border space-y-4 ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Connect with me / সোশ্যাল মিডিয়ায় যুক্ত হোন
                  </p>
                  <p className={`text-sm font-bold mt-0.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Active Social Channels
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                  {socials.filter(s => s.enabled).map((social) => (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                        darkMode
                          ? 'border-slate-800 bg-slate-850/80 text-slate-300 hover:text-white hover:border-indigo-500 hover:bg-slate-800'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                      title={`${social.platform} (${social.username})`}
                    >
                      <div className="shrink-0 text-indigo-500">
                        <SocialIcon platformOrIcon={social.iconName || social.platform} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate leading-tight">{social.platform}</p>
                        <p className="text-[10px] text-slate-400 truncate">{social.username || 'Connect'}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className={`p-8 sm:p-10 rounded-3xl border transition-all ${
              darkMode ? 'bg-slate-900 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-md'
            }`}>
              
              {isSubmitted ? (
                /* Success Message State */
                <div className="text-center py-10 space-y-5 animate-fade-in">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      Message Delivered Successfully!
                    </h3>
                    <p className={`text-sm max-w-md mx-auto ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      Thank you for reaching out, <span className="font-semibold text-indigo-500">{formData.name}</span>. I have received your message regarding <span className="font-semibold">{formData.subject}</span> and will respond within 24 business hours.
                    </p>
                  </div>

                  <button
                    onClick={handleResetForm}
                    className="px-6 py-3 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                /* The Contact Form */
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <div className="space-y-2 mb-6">
                    <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      Send a Message
                    </h3>
                    <p className={`text-xs sm:text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Fill out the form below. Messages are dispatched instantly.
                    </p>
                  </div>

                  {/* Honeypot for spam bots (Hidden) */}
                  <input
                    type="text"
                    name="honeypot"
                    value={formData.honeypot}
                    onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  {/* Name & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label 
                        htmlFor="contact-form-name"
                        className={`block text-xs font-semibold uppercase tracking-wider ${
                          darkMode ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        Your Name *
                      </label>
                      <input
                        id="contact-form-name"
                        type="text"
                        placeholder="Sarah Connor"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                        }}
                        className={`w-full px-4 py-3 rounded-xl text-sm border transition-colors outline-none focus:ring-2 focus:ring-indigo-500 ${
                          formErrors.name
                            ? 'border-red-500 bg-red-500/5'
                            : darkMode
                              ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
                              : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.name && (
                        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3" />
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label 
                        htmlFor="contact-form-email"
                        className={`block text-xs font-semibold uppercase tracking-wider ${
                          darkMode ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        Your Email *
                      </label>
                      <input
                        id="contact-form-email"
                        type="email"
                        placeholder="sarah@example.com"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                        }}
                        className={`w-full px-4 py-3 rounded-xl text-sm border transition-colors outline-none focus:ring-2 focus:ring-indigo-500 ${
                          formErrors.email
                            ? 'border-red-500 bg-red-500/5'
                            : darkMode
                              ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
                              : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.email && (
                        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3" />
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                  </div>

                  {/* Subject */}
                  <div className="space-y-1.5">
                    <label 
                      htmlFor="contact-form-subject"
                      className={`block text-xs font-semibold uppercase tracking-wider ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Subject *
                    </label>
                    <input
                      id="contact-form-subject"
                      type="text"
                      placeholder="e.g. Lead Solutions Architect Role / Cloud Advisory"
                      value={formData.subject}
                      onChange={(e) => {
                        setFormData({ ...formData, subject: e.target.value });
                        if (formErrors.subject) setFormErrors({ ...formErrors, subject: '' });
                      }}
                      className={`w-full px-4 py-3 rounded-xl text-sm border transition-colors outline-none focus:ring-2 focus:ring-indigo-500 ${
                        formErrors.subject
                          ? 'border-red-500 bg-red-500/5'
                          : darkMode
                            ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
                            : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                      }`}
                    />
                    {formErrors.subject && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        {formErrors.subject}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label 
                      htmlFor="contact-form-message"
                      className={`block text-xs font-semibold uppercase tracking-wider ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Message *
                    </label>
                    <textarea
                      id="contact-form-message"
                      rows={5}
                      placeholder="Hi Alex, we are expanding our platform architecture squad and would love to connect..."
                      value={formData.message}
                      onChange={(e) => {
                        setFormData({ ...formData, message: e.target.value });
                        if (formErrors.message) setFormErrors({ ...formErrors, message: '' });
                      }}
                      className={`w-full px-4 py-3 rounded-xl text-sm border transition-colors outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
                        formErrors.message
                          ? 'border-red-500 bg-red-500/5'
                          : darkMode
                            ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
                            : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                      }`}
                    />
                    {formErrors.message && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        {formErrors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    id="contact-form-submit-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-2xl font-semibold text-sm sm:text-base text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-slate-400">
                    Protected by spam honeypots & client-side validation. Zero marketing spam guaranteed.
                  </p>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
