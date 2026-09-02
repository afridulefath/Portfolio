/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ExperiencePage } from './pages/ExperiencePage';
import { EducationPage } from './pages/EducationPage';
import { GalleryPage } from './pages/GalleryPage';
import { ContactPage } from './pages/ContactPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { BlogsPage } from './pages/BlogsPage';
import { CmsStudioModal } from './components/CmsStudioModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { PortfolioData } from './types/portfolio';
import { CmsService } from './services/cmsService';
import { AuthService } from './services/authService';
import { AnalyticsService } from './services/analyticsService';

/**
 * 100% Real-Time Page View Tracker
 * Automatically tracks page visits on every route change
 */
function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    // Read route title if possible
    let pageTitle = document.title || 'Alex Vance Portfolio';
    const path = location.pathname;
    
    if (path === '/') pageTitle = 'Home | Alex Vance Portfolio';
    else if (path === '/about') pageTitle = 'About | Alex Vance Portfolio';
    else if (path === '/projects') pageTitle = 'Projects Showcase | Alex Vance';
    else if (path === '/blogs') pageTitle = 'Articles & Engineering Insights';
    else if (path === '/experience') pageTitle = 'Professional Experience';
    else if (path === '/education') pageTitle = 'Education & Certifications';
    else if (path === '/gallery') pageTitle = 'Life & Workspace Gallery';
    else if (path === '/contact') pageTitle = 'Contact & Consultations';

    AnalyticsService.trackPageView(path, pageTitle);
  }, [location.pathname]);

  return null;
}

export default function App() {
  const [data, setData] = useState<PortfolioData>(() => CmsService.getData());
  const [isLoading, setIsLoading] = useState<boolean>(true); // ফায়ারফক্স লোডিং প্রোটেকশন
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [isCmsOpen, setIsCmsOpen] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Supabase থেকে রিয়েল ডাটা ব্যাকগ্রাউন্ডে লোড হওয়া পর্যন্ত সেফটি বাফার
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

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

  // ক্লাউড ডাটাবেজ থেকে ডাটা আসার আগে স্ক্রিন লক করে রাখবে, ডেমো ডাটা দেখাতে দেবে না
  if (isLoading) {
    const loadingMessage = data?.siteSettings?.loadingText || 'Portfolio Loading...';
    const brandName = data?.siteSettings?.brandName || 'Portfolio';
    const brandLogo = data?.siteSettings?.brandLogoUrl;

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 font-sans p-6">
        <div className="relative flex flex-col items-center max-w-sm text-center">
          {/* Subtle Ambient Glow */}
          <div className="absolute -inset-8 bg-indigo-600/10 blur-2xl rounded-full pointer-events-none" />

          {brandLogo ? (
            <div className="relative mb-5">
              <img 
                src={brandLogo} 
                alt={brandName} 
                className="w-14 h-14 rounded-2xl object-cover shadow-lg border border-slate-800"
              />
              <div className="absolute -inset-1 border-2 border-indigo-500 border-t-transparent rounded-2xl animate-spin" />
            </div>
          ) : (
            <div className="relative w-12 h-12 mb-5 flex items-center justify-center">
              <div className="w-12 h-12 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <div className="absolute w-6 h-6 border-2 border-sky-400/30 border-b-sky-400 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
            </div>
          )}

          <h2 className="text-base font-semibold text-white tracking-wide mb-1.5">
            {brandName}
          </h2>
          <p className="tracking-wide text-xs sm:text-sm text-slate-400 animate-pulse">
            {loadingMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <PageViewTracker />
      <ScrollToTop />
      <div 
        className={`min-h-screen font-sans transition-colors duration-300 flex flex-col justify-between ${
          darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
        }`}
      >
        {/* Top Navbar with Route Navigation Links */}
        <Navbar
          data={data}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />

        {/* Multi-Page Route Views */}
        <main className="relative flex-grow">
          <Routes>
            <Route 
              path="/" 
              element={
                <HomePage 
                  data={data} 
                  darkMode={darkMode} 
                  onOpenCms={handleRequestCmsOpen} 
                />
              } 
            />
            <Route 
              path="/about" 
              element={
                <AboutPage 
                  data={data} 
                  darkMode={darkMode} 
                />
              } 
            />
            <Route 
              path="/projects" 
              element={
                <ProjectsPage 
                  data={data} 
                  darkMode={darkMode} 
                />
              } 
            />
            <Route 
              path="/project/:slug" 
              element={
                <ProjectsPage 
                  data={data} 
                  darkMode={darkMode} 
                />
              } 
            />
            <Route 
              path="/blogs" 
              element={
                <BlogsPage 
                  data={data} 
                  darkMode={darkMode} 
                />
              } 
            />
            <Route 
              path="/blog/:slug" 
              element={
                <BlogsPage 
                  data={data} 
                  darkMode={darkMode} 
                />
              } 
            />
            <Route 
              path="/experience" 
              element={
                <ExperiencePage 
                  data={data} 
                  darkMode={darkMode} 
                />
              } 
            />
            <Route 
              path="/education" 
              element={
                <EducationPage 
                  data={data} 
                  darkMode={darkMode} 
                />
              } 
            />
            <Route 
              path="/gallery" 
              element={
                <GalleryPage 
                  data={data} 
                  darkMode={darkMode} 
                />
              } 
            />
            <Route 
              path="/contact" 
              element={
                <ContactPage 
                  data={data} 
                  darkMode={darkMode} 
                />
              } 
            />
            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer with Admin Login & Social links */}
        <Footer 
          data={data} 
          darkMode={darkMode} 
          onOpenCms={handleRequestCmsOpen} 
          onLogout={handleLogout}
        />

        {/* Admin Login Authentication Modal */}
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
    </BrowserRouter>
  );
}
