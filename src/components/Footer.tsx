import React, { useState, useEffect } from 'react';
import { 
  ArrowUp, 
  Lock, 
  Unlock, 
  LogOut,
  Shield, 
  KeyRound 
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

  return (
    <footer 
      id="main-footer"
      className={`border-t transition-colors duration-300 py-12 ${
        darkMode ? 'bg-slate-950 border-slate-800/80 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand & Designation */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-1">
            <a href="#home" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center text-white font-bold text-sm">
                {personal.fullName.charAt(0)}
              </div>
              <span className={`font-bold tracking-tight text-base ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {siteSettings.brandName || personal.fullName}
              </span>
            </a>
            <p className="text-xs text-slate-400">
              {personal.designation} • {personal.location}
            </p>
          </div>

          {/* Social Icons (Enabled ones only) */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {socials.filter(s => s.enabled).map((social) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2.5 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 ${
                  darkMode 
                    ? 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-indigo-500' 
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-indigo-600 hover:border-indigo-300'
                }`}
                title={`${social.platform} ${social.username ? `(${social.username})` : ''}`}
              >
                <SocialIcon 
                  platformOrIcon={social.iconName || social.platform} 
                  className="w-4 h-4" 
                />
              </a>
            ))}
          </div>

          {/* Back to Top */}
          <button
            onClick={scrollToTop}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              darkMode 
                ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white' 
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>

        </div>

        {/* Bottom Legal, Admin Login Button, and Credits */}
        <div className="pt-8 border-t border-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 text-center sm:text-left">
          <p>{siteSettings.footerText}</p>
          
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            
            {/* Admin Login / Dashboard & Logout in Footer */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  id="footer-admin-dashboard-btn"
                  onClick={onOpenCms}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
                  title="অ্যাডমিন ড্যাশবোর্ড খুলুন"
                >
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ড্যাশবোর্ড খুলুন (লগইন করা)</span>
                </button>

                <button
                  id="footer-admin-logout-btn"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                  title="লগআউট করুন"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>লগআউট</span>
                </button>
              </div>
            ) : (
              <button
                id="footer-admin-login-btn"
                onClick={onOpenCms}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-indigo-500/40 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all cursor-pointer"
                title="অ্যাডমিন প্যানেলে লগইন করুন"
              >
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>অ্যাডমিন লগইন / Admin Login</span>
              </button>
            )}

            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="text-slate-500">Vercel Ready</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
