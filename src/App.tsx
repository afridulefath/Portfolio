/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { ExperienceSection } from './components/ExperienceSection';
import { EducationSection } from './components/EducationSection';
import { GallerySection } from './components/GallerySection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { CmsStudioModal } from './components/CmsStudioModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { PortfolioData } from './types/portfolio';
import { CmsService } from './services/cmsService';
import { AuthService } from './services/authService';

export default function App() {
  const [data, setData] = useState<PortfolioData>(() => CmsService.getData());
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [isCmsOpen, setIsCmsOpen] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Sync SEO metadata to browser document title
  useEffect(() => {
    if (data?.seo?.metaTitle) {
      document.title = data.seo.metaTitle;
    }
  }, [data]);

  // Initial auth status & listeners
  useEffect(() => {
    setIsAuthenticated(AuthService.isAuthenticated());

    const handleAuthChanged = (e: any) => {
      setIsAuthenticated(Boolean(e.detail?.authenticated));
    };
    window.addEventListener('portfolio_auth_changed', handleAuthChanged);
    return () => window.removeEventListener('portfolio_auth_changed', handleAuthChanged);
  }, []);

  // Listen for storage / cross-tab updates
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setData(e.detail);
      }
    };
    window.addEventListener('portfolio_data_updated', handleUpdate);
    return () => window.removeEventListener('portfolio_data_updated', handleUpdate);
  }, []);

  const handleSaveData = (newData: PortfolioData) => {
    setData(newData);
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Protected trigger to open CMS Studio (from Footer Admin Button)
  const handleRequestCmsOpen = () => {
    if (AuthService.isAuthenticated()) {
      setIsAuthenticated(true);
      setIsCmsOpen(true);
    } else {
      setIsLoginOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setIsLoginOpen(false);
    setIsCmsOpen(true);
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setIsCmsOpen(false);
  };

  return (
    <div 
      className={`min-h-screen font-sans transition-colors duration-300 ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Navbar with Dynamic Brand Logo & Subtitle */}
      <Navbar
        data={data}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Content Sections */}
      <main className="relative">
        <HeroSection 
          data={data} 
          darkMode={darkMode} 
          onOpenCms={handleRequestCmsOpen} 
        />

        <AboutSection 
          data={data} 
          darkMode={darkMode} 
        />

        <ExperienceSection 
          data={data} 
          darkMode={darkMode} 
        />

        <EducationSection 
          data={data} 
          darkMode={darkMode} 
        />

        <GallerySection 
          data={data} 
          darkMode={darkMode} 
        />

        <ContactSection 
          data={data} 
          darkMode={darkMode} 
        />
      </main>

      {/* Footer with small Admin Login Button */}
      <Footer 
        data={data} 
        darkMode={darkMode} 
        onOpenCms={handleRequestCmsOpen} 
        onLogout={handleLogout}
      />

      {/* Admin Login Authentication Modal (Username & Password) */}
      <AdminLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={handleLoginSuccess}
        darkMode={darkMode}
      />

      {/* In-Browser CMS Studio Modal */}
      <CmsStudioModal
        data={data}
        isOpen={isCmsOpen}
        onClose={() => setIsCmsOpen(false)}
        onSave={handleSaveData}
        darkMode={darkMode}
        onLogout={handleLogout}
      />
    </div>
  );
}
