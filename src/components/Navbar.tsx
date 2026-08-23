import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ChevronRight
} from 'lucide-react';
import { PortfolioData } from '../types/portfolio';

interface NavbarProps {
  data: PortfolioData;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  data,
  darkMode,
  onToggleDarkMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Experience', path: '/experience' },
    { label: 'Education', path: '/education' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Contact', path: '/contact' },
  ];

  const brandName = data.siteSettings.brandName || data.personal.fullName || 'Portfolio';
  const brandSubtitle = data.siteSettings.brandSubtitle || 'Portfolio & CMS';
  const brandLogo = data.siteSettings.brandLogoUrl;

  return (
    <header 
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        darkMode 
          ? 'bg-slate-950/85 backdrop-blur-md border-b border-slate-800 shadow-lg shadow-black/20' 
          : 'bg-white/85 backdrop-blur-md border-b border-slate-200 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand with Direct Uploaded Logo Support */}
        <Link 
          id="brand-logo-link"
          to="/" 
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1"
        >
          {brandLogo && !logoError ? (
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800/40 border border-slate-700/50 flex items-center justify-center shadow-md shadow-indigo-500/10 group-hover:scale-105 transition-transform duration-200">
              <img 
                src={brandLogo} 
                alt={brandName}
                className="w-full h-full object-contain p-0.5"
                onError={() => setLogoError(true)}
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              {brandName.charAt(0)}
            </div>
          )}

          <div className="flex flex-col">
            <span className={`font-bold tracking-tight text-lg leading-tight transition-colors ${
              darkMode ? 'text-slate-100 group-hover:text-indigo-400' : 'text-slate-900 group-hover:text-indigo-600'
            }`}>
              {brandName}
            </span>
            <span className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {brandSubtitle}
            </span>
          </div>
        </Link>

        {/* Desktop Multi-Page Route Navigation */}
        <nav id="desktop-nav" className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.label}
                id={`nav-link-${link.label.toLowerCase()}`}
                to={link.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? darkMode
                      ? 'text-indigo-400 bg-indigo-950/60 font-semibold shadow-xs'
                      : 'text-indigo-600 bg-indigo-50 font-semibold shadow-xs'
                    : darkMode
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
              darkMode
                ? 'border-slate-800 bg-slate-900 text-amber-300 hover:bg-slate-800 hover:border-slate-700'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-300 shadow-xs'
            }`}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2.5 rounded-xl border transition-colors cursor-pointer ${
              darkMode
                ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 shadow-xs'
            }`}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div 
          id="mobile-nav-drawer"
          className={`md:hidden border-b px-4 pt-3 pb-6 space-y-2 transition-all ${
            darkMode 
              ? 'bg-slate-950/95 border-slate-800 text-slate-200 backdrop-blur-md' 
              : 'bg-white/95 border-slate-200 text-slate-800 backdrop-blur-md'
          }`}
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.label}
                id={`mobile-link-${link.label.toLowerCase()}`}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? darkMode
                      ? 'bg-indigo-950/70 text-indigo-400 font-semibold'
                      : 'bg-indigo-50 text-indigo-600 font-semibold'
                    : darkMode
                      ? 'hover:bg-slate-900 text-slate-300'
                      : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
