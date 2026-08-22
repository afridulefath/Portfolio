import React from 'react';
import { 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  Download, 
  CheckCircle2, 
  Briefcase, 
  Star,
  FileText,
  ExternalLink
} from 'lucide-react';
import { PortfolioData } from '../types/portfolio';
import { SocialIcon } from './SocialIcon';

interface HeroSectionProps {
  data: PortfolioData;
  darkMode: boolean;
  onOpenCms: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ data, darkMode, onOpenCms }) => {
  const { personal, socials, siteSettings } = data;

  const showResume = personal.showResumeButton !== false && Boolean(personal.resumeUrl && personal.resumeUrl.trim());
  const isDirectFile = personal.resumeUrl?.startsWith('data:');
  const resumeDownloadName = personal.resumeFileName || `${personal.fullName.replace(/\s+/g, '_')}_CV.pdf`;

  return (
    <section 
      id="home" 
      className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden flex items-center justify-center min-h-[90vh]"
    >
      {/* Background Decorative subtle ambient glow */}
      <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center">
        <div className={`w-[500px] h-[500px] rounded-full blur-3xl opacity-20 transition-all duration-700 ${
          darkMode ? 'bg-indigo-600/30' : 'bg-indigo-300/40'
        }`} />
        <div className={`w-[400px] h-[400px] rounded-full blur-3xl opacity-15 transition-all duration-700 -translate-x-40 translate-y-32 ${
          darkMode ? 'bg-sky-500/20' : 'bg-sky-200/50'
        }`} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Availability Badge */}
            {siteSettings.showAvailabilityBadge && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase shadow-xs transition-colors duration-200">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className={darkMode ? 'text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/60' : 'text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200'}>
                  {personal.availability}
                </span>
              </div>
            )}

            {/* Name and Designation */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                <span className={darkMode ? 'text-slate-100' : 'text-slate-900'}>
                  Hi, I'm{' '}
                </span>
                <span className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                  {personal.fullName}
                </span>
              </h1>

              <p className={`text-xl sm:text-2xl font-semibold tracking-tight ${
                darkMode ? 'text-indigo-300' : 'text-indigo-700'
              }`}>
                {personal.designation}
              </p>
            </div>

            {/* Tagline / Introduction */}
            <p className={`text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed ${
              darkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {personal.shortBio || personal.tagline}
            </p>

            {/* Location Pill */}
            <div className="flex items-center justify-center lg:justify-start gap-2 text-sm font-medium">
              <MapPin className={`w-4 h-4 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
                {personal.location}
              </span>
            </div>

            {/* CTAs with Download CV / Resume Button */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <a
                id="hero-cta-primary"
                href={personal.heroCtaPrimaryLink || '#contact'}
                className="px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all duration-200 flex items-center gap-2 group cursor-pointer"
              >
                <span>{personal.heroCtaPrimaryText || 'Get in Touch'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>

              {/* CV / Resume Button on Homepage */}
              {showResume && (
                <a
                  id="hero-cta-resume"
                  href={personal.resumeUrl}
                  download={isDirectFile ? resumeDownloadName : undefined}
                  target={isDirectFile ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className={`px-5 py-3.5 rounded-xl font-semibold text-sm sm:text-base border transition-all duration-200 flex items-center gap-2 group cursor-pointer ${
                    darkMode
                      ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40 hover:border-emerald-400 shadow-md shadow-emerald-950/20'
                      : 'border-emerald-300 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400 shadow-xs'
                  }`}
                  title="সিভি ডাউনলোড / ভিউ করুন"
                >
                  <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                  <span>{personal.resumeButtonText || 'আমার সিভি / Download CV'}</span>
                </a>
              )}

              <a
                id="hero-cta-secondary"
                href={personal.heroCtaSecondaryLink || '#experience'}
                className={`px-5 py-3.5 rounded-xl font-semibold text-sm sm:text-base border transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  darkMode
                    ? 'border-slate-700 bg-slate-900/90 text-slate-200 hover:bg-slate-800 hover:border-slate-600'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-xs'
                }`}
              >
                <span>{personal.heroCtaSecondaryText || 'Explore Career & Work'}</span>
              </a>
            </div>

            {/* Dynamic Social Links (Connect with me) */}
            <div className="pt-4 flex flex-col items-center lg:items-start gap-3">
              <span className={`text-xs font-semibold uppercase tracking-wider ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Connect with me
              </span>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                {socials.filter(s => s.enabled).map((social) => (
                  <a
                    key={social.id}
                    id={`hero-social-${social.platform.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2.5 rounded-xl border transition-all duration-200 group cursor-pointer hover:scale-105 active:scale-95 ${
                      darkMode
                        ? 'border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:border-indigo-500 hover:bg-slate-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 shadow-xs'
                    }`}
                    title={`${social.platform} ${social.username ? `(${social.username})` : ''}`}
                  >
                    <SocialIcon 
                      platformOrIcon={social.iconName || social.platform} 
                      className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" 
                    />
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Profile Image Card & Stat Overlay */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative group w-full max-w-sm sm:max-w-md">
              
              {/* Outer Glow Ring */}
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-sky-400 opacity-30 group-hover:opacity-60 blur-xl transition-all duration-500" />

              {/* Main Photo Card */}
              <div className={`relative rounded-3xl overflow-hidden border p-2 shadow-2xl transition-transform duration-300 ${
                darkMode 
                  ? 'bg-slate-900 border-slate-800' 
                  : 'bg-white border-slate-200'
              }`}>
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-800">
                  <img
                    id="hero-profile-avatar"
                    src={personal.avatarUrl}
                    alt={personal.fullName}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback image if custom image link fails
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  
                  {/* Subtle Gradient Overlay on bottom of photo */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60" />

                  {/* Inline quick info */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-sm font-semibold drop-shadow-md">{personal.fullName}</p>
                    <p className="text-xs text-slate-300 drop-shadow-xs">{personal.designation}</p>
                  </div>
                </div>
              </div>

              {/* Floating Stat Badge 1: Experience */}
              <div className={`absolute -bottom-5 -left-4 sm:-left-6 px-4 py-3 rounded-2xl border shadow-xl flex items-center gap-3 backdrop-blur-md animate-fade-in ${
                darkMode
                  ? 'bg-slate-900/95 border-slate-800 text-slate-100'
                  : 'bg-white/95 border-slate-200 text-slate-900'
              }`}>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-bold leading-none text-indigo-500">
                    {personal.yearsExperience}+ Years
                  </div>
                  <div className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Industry Experience
                  </div>
                </div>
              </div>

              {/* Floating Stat Badge 2: Projects / Success */}
              <div className={`absolute -top-4 -right-4 sm:-right-6 px-4 py-3 rounded-2xl border shadow-xl flex items-center gap-3 backdrop-blur-md animate-fade-in ${
                darkMode
                  ? 'bg-slate-900/95 border-slate-800 text-slate-100'
                  : 'bg-white/95 border-slate-200 text-slate-900'
              }`}>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-bold leading-none text-emerald-500">
                    {personal.projectsCompleted}+
                  </div>
                  <div className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Projects Delivered
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
