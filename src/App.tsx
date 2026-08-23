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
  const [isLoading, setIsLoading] = useState<boolean>(true); // ফায়ারফক্স লোডিং প্রোটেকশন
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [isCmsOpen, setIsCmsOpen] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Supabase থেকে রিয়েল ডাটা ব্যাকগ্রাউন্ডে লোড হওয়া পর্যন্ত ২ সেকেন্ড অপেক্ষা করবে
  useEffect(() => {
    const timer = setTimeout(() => {
      setData(CmsService.getData());
      setIsLoading(false);
    }, 2000); // ২ সেকেন্ডের সেফটি বাফার

    return () => clearTimeout(timer);
  }, []);

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
        setIsLoading(false);
      }
    };
    window.addEventListener('portfolio_data_updated', handleUpdate);
    return () => window.removeEventListener('portfolio_data_updated', handleUpdate);
  }, []);

  const handleSaveData = (newData: PortfolioData) => {
    setData(newData);
    CmsService.saveData(newData);
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

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

  // ক্লাউড ডাটাবেজ থেকে ডাটা আসার আগে স্ক্রিন লক করে রাখবে, ডেমো ডাটা দেখাতে দেবে না
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-sans">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="tracking-wide text-sm">Loading Portfolio Ecosystem...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen font-sans transition-colors duration-300 ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <Navbar data={data} darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

      <main className="relative">
        <HeroSection data={data} darkMode={darkMode} onOpenCms={handleRequestCmsOpen} />
        <AboutSection data={data} darkMode={darkMode} />
        <ExperienceSection data={data} darkMode={darkMode} />
        <EducationSection data={data} darkMode={darkMode} />
        <GallerySection data={data} darkMode={darkMode} />
        <ContactSection data={data} darkMode={darkMode} />
      </main>

      <Footer data={data} darkMode={darkMode} onOpenCms={handleRequestCmsOpen} onLogout={handleLogout} />

      <AdminLoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSuccess={handleLoginSuccess} darkMode={darkMode} />
      <CmsStudioModal data={data} isOpen={isCmsOpen} onClose={() => setIsCmsOpen(false)} onSave={handleSaveData} darkMode={darkMode} onLogout={handleLogout} />
    </div>
  );
}
