import React, { useState, useEffect } from 'react';
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = ['home', 'about', 'experience', 'education', 'gallery', 'contact'];
      const scrollPosition = window.scrollY + 120;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Experience', href: '#experience' },
    { label: 'Education', href: '#education' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Contact', href: '#contact' },
  ];

  const brandName = data.siteSettings.brandName || data.personal.fullName || 'Portfolio';
  const brandSubtitle = data.siteSettings.brandSubtitle || 'Portfolio & CMS';
  const brandLogo = data.siteSettings.brandLogoUrl;

  return (
    <header 
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? darkMode 
            ? 'bg-slate-950/85 backdrop-blur-md border-b border-slate-800 shadow-lg shadow-black/20' 
            : 'bg-white/85 backdrop-blur-md border-b border-slate-200 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand with Direct Uploaded Logo Support */}
        <a 
          id="brand-logo-link"
          href="#home" 
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
        </a>

        {/* Desktop Navigation */}
        <nav id="desktop-nav" className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.substring(1);
            return (
              <a
                key={link.label}
                id={`nav-link-${link.label.toLowerCase()}`}
                href={link.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? darkMode
                      ? 'text-indigo-400 bg-indigo-950/60 font-semibold'
                      : 'text-indigo-600 bg-indigo-50 font-semibold'
                    : darkMode
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </a>
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div 
          id="mobile-nav-drawer"
          className={`md:hidden border-b px-4 pt-3 pb-6 space-y-2 transition-all ${
            darkMode 
              ? 'bg-slate-950/95 border-slate-800 text-slate-200' 
              : 'bg-white/95 border-slate-200 text-slate-800'
          }`}
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              id={`mobile-link-${link.label.toLowerCase()}`}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeSection === link.href.substring(1)
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
            </a>
          ))}
        </div>
      )}
    </header>
  );
};
