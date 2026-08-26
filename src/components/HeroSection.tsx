import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  Download, 
  CheckCircle2, 
  Briefcase, 
  Star,
  FileText,
  ExternalLink,
  GraduationCap,
  Camera,
  Mail,
  UserCheck,
} from 'lucide-react';
import { PortfolioData } from '../types/portfolio';
import { SocialIcon } from './SocialIcon';

interface HeroSectionProps {
  data: PortfolioData;
  darkMode: boolean;
  onOpenCms: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ data, darkMode }) => {
  const { personal, socials, siteSettings } = data;

  const showResume = personal.showResumeButton !== false && Boolean(personal.resumeUrl && personal.resumeUrl.trim());
  const isDirectFile = personal.resumeUrl?.startsWith('data:');
  const resumeDownloadName = personal.resumeFileName || `${personal.fullName.replace(/\s+/g, '_')}_CV.pdf`;

  const quickNavCards = [
    {
      title: 'About & Vision',
      subtitle: `${data.skills.length}+ Core Competencies`,
      to: '/about',
      icon: <UserCheck className="w-4 h-4 text-indigo-500" />,
    },
    {
      title: 'Career History',
      subtitle: `${data.experiences.length} Leadership Roles`,
      to: '/experience',
      icon: <Briefcase className="w-4 h-4 text-indigo-500" />,
    },
    {
      title: 'Academics & Certs',
      subtitle: `${data.certificates.length} Verified Credentials`,
      to: '/education',
      icon: <GraduationCap className="w-4 h-4 text-indigo-500" />,
    },
    {
      title: 'Visual Showcase',
      subtitle: `${data.gallery.length} Curated Media`,
      to: '/gallery',
      icon: <Camera className="w-4 h-4 text-indigo-500" />,
    },
    {
      title: 'Direct Inquiries',
      subtitle: 'Open for Collaboration',
      to: '/contact',
      icon: <Mail className="w-4 h-4 text-indigo-500" />,
    }
  ];

  const primaryLink = personal.heroCtaPrimaryLink?.startsWith('#') 
    ? personal.heroCtaPrimaryLink.replace('#', '/') 
    : (personal.heroCtaPrimaryLink || '/contact');

  const secondaryLink = personal.heroCtaSecondaryLink?.startsWith('#')
    ? personal.heroCtaSecondaryLink.replace('#', '/')
    : (personal.heroCtaSecondaryLink || '/experience');

  const isPrimaryExternal = primaryLink.startsWith('http');
  const isSecondaryExternal = secondaryLink.startsWith('http');

  return (
    <section 
      id="home-hero" 
      className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden flex flex-col justify-center min-h-[85vh]"
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
                  {personal.availabilityStatus || 'Available for Executive & Tech Opportunities'}
                </span>
              </div>
            )}

            {/* Main Greeting & Headline */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-sm font-semibold tracking-wider uppercase text-indigo-500">
                <Sparkles className="w-4 h-4" />
                <span>{personal.heroBadgeTitle || 'Executive & Technology Leader'}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
                <span className={darkMode ? 'text-white' : 'text-slate-900'}>
                  {personal.headline || personal.designation}
                </span>
              </h1>
            </div>

            {/* Sub-headline / Short Bio */}
            <p className={`text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed ${
              darkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {personal.subHeadline || personal.tagline || personal.shortBio}
            </p>

            {/* Location & Quick Meta */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-medium text-slate-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-500" />
                <span>{personal.location}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-500" />
                <span>{personal.designation}</span>
              </div>
              {data.experiences.length > 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Star className="w-4 h-4" />
                    <span>{data.experiences.length}+ Key Roles Track Record</span>
                  </div>
                </>
              )}
            </div>

            {/* Primary & Secondary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              {isPrimaryExternal ? (
                <a
                  id="hero-cta-primary"
                  href={primaryLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all duration-200 flex items-center gap-2 group cursor-pointer"
                >
                  <span>{personal.heroCtaPrimaryText || 'Get in Touch'}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              ) : (
                <Link
                  id="hero-cta-primary"
                  to={primaryLink}
                  className="px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all duration-200 flex items-center gap-2 group cursor-pointer"
                >
                  <span>{personal.heroCtaPrimaryText || 'Get in Touch'}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              )}

              {/* CV / Resume Button */}
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
                  <span>{personal.resumeButtonText || 'Download CV'}</span>
                </a>
              )}

              {isSecondaryExternal ? (
                <a
                  id="hero-cta-secondary"
                  href={secondaryLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-5 py-3.5 rounded-xl font-semibold text-sm sm:text-base border transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                    darkMode
                      ? 'border-slate-700 bg-slate-900/90 text-slate-200 hover:bg-slate-800 hover:border-slate-600'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-xs'
                  }`}
                >
                  <span>{personal.heroCtaSecondaryText || 'Explore Career & Work'}</span>
                </a>
              ) : (
                <Link
                  id="hero-cta-secondary"
                  to={secondaryLink}
                  className={`px-5 py-3.5 rounded-xl font-semibold text-sm sm:text-base border transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                    darkMode
                      ? 'border-slate-700 bg-slate-900/90 text-slate-200 hover:bg-slate-800 hover:border-slate-600'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-xs'
                  }`}
                >
                  <span>{personal.heroCtaSecondaryText || 'Explore Career & Work'}</span>
                </Link>
              )}
            </div>

            {/* Dynamic Social Links */}
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
                        : 'border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-300 shadow-xs hover:bg-slate-50'
                    }`}
                    title={`${social.platform} ${social.username ? `(${social.username})` : ''}`}
                  >
                    <SocialIcon 
                      platformOrIcon={social.iconName || social.platform} 
                      className="w-4 h-4 transition-transform group-hover:scale-110" 
                    />
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Profile Visual Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm sm:max-w-md">
              
              {/* Decorative Card Framing */}
              <div className={`absolute -inset-2 rounded-3xl bg-gradient-to-tr from-indigo-500 via-sky-400 to-indigo-600 opacity-30 blur-lg transition duration-500 group-hover:opacity-60`} />
              
              <div className={`relative rounded-3xl p-6 sm:p-7 border backdrop-blur-xl transition-all duration-300 ${
                darkMode 
                  ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-2xl shadow-black/40' 
                  : 'bg-white/95 border-slate-200 text-slate-900 shadow-xl'
              }`}>
                
                {/* Avatar with dynamic fallback */}
                <div className="relative mb-6 group">
                  <div className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-800 border border-slate-700/60 flex items-center justify-center">
                    {personal.avatarUrl ? (
                      <img 
                        src={personal.avatarUrl} 
                        alt={personal.fullName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-indigo-900 to-slate-900 flex items-center justify-center text-5xl font-black text-white/40">
                        {personal.fullName.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  {/* Verified Badge */}
                  <div className="absolute bottom-3 right-3 bg-indigo-600 text-white p-2 rounded-xl shadow-lg border border-indigo-400/40 flex items-center gap-1.5 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verified Profile</span>
                  </div>
                </div>

                {/* Identity Info */}
                <div className="space-y-3 text-center sm:text-left">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                      {personal.fullName}
                    </h3>
                    <p className="text-sm font-semibold text-indigo-500">
                      {personal.designation}
                    </p>
                  </div>

                  <p className={`text-xs sm:text-sm line-clamp-3 leading-relaxed ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {personal.bio}
                  </p>

                  {/* Highlights Pill Badges */}
                  {data.about.highlights && data.about.highlights.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-1.5 justify-center sm:justify-start">
                      {data.about.highlights.slice(0, 3).map((item, idx) => (
                        <span 
                          key={idx}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium ${
                            darkMode 
                              ? 'bg-slate-800/80 border-slate-700 text-slate-300' 
                              : 'bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* Quick Nav Cards */}
        <div className="mt-16 pt-10 border-t border-slate-800/40 dark:border-slate-800/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${
                darkMode ? 'text-indigo-400' : 'text-indigo-600'
              }`}>
                Explore Portfolio Pages
              </p>
              <h2 className={`text-lg font-bold ${
                darkMode ? 'text-slate-200' : 'text-slate-800'
              }`}>
                Multi-Page Complete Directory
              </h2>
            </div>
            <span className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Click any page below or use the Navbar
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {quickNavCards.map((card, idx) => (
              <Link
                key={idx}
                id={`hero-nav-${card.to.replace('/', '')}`}
                to={card.to}
                className={`group p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between gap-2 ${
                  darkMode
                    ? 'bg-slate-900/70 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl border ${
                    darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}>
                    {card.icon}
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <h3 className={`text-xs font-bold truncate ${
                    darkMode ? 'text-slate-100 group-hover:text-indigo-400' : 'text-slate-900 group-hover:text-indigo-600'
                  }`}>
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {card.subtitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
