import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowUp, 
  Play, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { PortfolioData } from '../types/portfolio';
import { AuthService } from '../services/authService';
import { SocialIcon } from './SocialIcon';

interface FooterProps {
  data: PortfolioData;
  darkMode: boolean;
  onOpenCms: () => void;
  onLogout?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ data, darkMode, onOpenCms, onLogout }) => {
  const { siteSettings, personal, socials } = data;
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => AuthService.isAuthenticated());
  const [logoError, setLogoError] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(AuthService.isAuthenticated());
    };

    window.addEventListener('portfolio_auth_changed', checkAuth);
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('portfolio_auth_changed', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    if (onLogout) {
      onLogout();
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const customLabels = siteSettings.navCustomLabels || {};

  const footerNavLinks = [
    { label: customLabels['home'] || 'Home', path: '/' },
    { label: customLabels['about'] || 'About', path: '/about' },
    { label: customLabels['projects'] || 'Projects', path: '/projects' },
    { label: customLabels['blogs'] || customLabels['blog'] || 'Blog', path: '/blogs' },
    { label: customLabels['experience'] || 'Experience', path: '/experience' },
    { label: customLabels['education'] || 'Education', path: '/education' },
    { label: customLabels['gallery'] || 'Gallery', path: '/gallery' },
    { label: customLabels['contact'] || 'Contact', path: '/contact' },
  ];

  return (
    <footer 
      id="main-footer"
      className={`border-t transition-colors duration-300 pt-14 pb-8 ${
        darkMode ? 'bg-slate-950 border-slate-800/80 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Main Grid: Brand info, Page Navigation, Socials & Back to Top */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start justify-between">
          
          {/* Col 1: Brand & Designation */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left space-y-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              {siteSettings.brandLogoUrl && !logoError ? (
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-800/40 border border-slate-700/50 flex items-center justify-center shadow-md shadow-indigo-500/10 group-hover:scale-105 transition-transform duration-200">
                  <img 
                    src={siteSettings.brandLogoUrl} 
                    alt={siteSettings.brandName || personal.fullName}
                    className="w-full h-full object-contain p-0.5"
                    onError={() => setLogoError(true)}
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                  {(siteSettings.brandName || personal.fullName).charAt(0)}
                </div>
              )}
              <span className={`font-bold tracking-tight text-lg ${
                darkMode ? 'text-white group-hover:text-indigo-400' : 'text-slate-900 group-hover:text-indigo-600'
              }`}>
                {siteSettings.brandName || personal.fullName}
              </span>
            </Link>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              {personal.designation} • {personal.location}
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {personal.headline}
            </p>
          </div>

          {/* Col 2: Multi-Page Quick Navigation Links */}
          <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${
              darkMode ? 'text-slate-300' : 'text-slate-800'
            }`}>
              Quick Navigation
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-x-6 gap-y-2.5 text-xs font-medium">
              {footerNavLinks.map((nav) => (
                <Link
                  key={nav.label}
                  id={`footer-nav-${nav.label.toLowerCase()}`}
                  to={nav.path}
                  className={`transition-colors duration-150 ${
                    darkMode 
                      ? 'text-slate-400 hover:text-indigo-400' 
                      : 'text-slate-600 hover:text-indigo-600'
                  }`}
                >
                  {nav.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 3: Social Icons & Back to top button */}
          <div className="md:col-span-3 flex flex-col items-center md:items-end text-center md:text-right space-y-4">
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2">
              {socials.filter(s => s.enabled).map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 ${
                    darkMode 
                      ? 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-indigo-500' 
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-indigo-600 hover:border-indigo-300'
                  }`}
                  title={`${social.platform} ${social.username ? `(${social.username})` : ''}`}
                >
                  <SocialIcon 
                    platformOrIcon={social.iconName || social.platform} 
                    className="w-3.5 h-3.5" 
                  />
                </a>
              ))}
            </div>

            <button
              onClick={scrollToTop}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                darkMode 
                  ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white' 
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Bottom Legal, Discreet Admin Trigger, and Copyright */}
        <div className="pt-8 border-t border-slate-800/40 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <p>{siteSettings.footerText || `© ${new Date().getFullYear()} ${personal.fullName}. All rights reserved.`}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-[11px]">Vercel Ready</span>

            <span className="text-slate-700 select-none">•</span>

            {/* Discreet Admin Login / CMS Studio Trigger disguised as a subtle small play button */}
            <div className="flex items-center gap-1">
              <button
                id="footer-admin-trigger-play"
                onClick={onOpenCms}
                aria-label="Media Player / Portal"
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  isAuthenticated
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/60'
                }`}
                title={isAuthenticated ? 'Dashboard Active' : ''}
              >
                <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
              </button>

              {/* Discreet Logout if logged in */}
              {isAuthenticated && (
                <button
                  id="footer-admin-logout-btn"
                  onClick={handleLogout}
                  className="p-1 rounded text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
