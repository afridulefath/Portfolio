import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Sparkles, 
  User, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  Camera, 
  Mail, 
  Share2, 
  Globe, 
  Sliders,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  KeyRound,
  ShieldCheck,
  Lock,
  LogOut,
  Inbox,
  Image as ImageIcon,
  Target,
  TrendingUp,
  MessageSquare,
  Users,
  HeartHandshake,
  Award,
  Zap,
  Clock,
  Compass,
  Layers,
  Star,
  Flame,
  BarChart3,
  BookOpen,
  FolderOpen,
  Eye,
  EyeOff,
  MapPin,
  Building2,
  Search,
  ExternalLink,
  Code2,
  Copy,
  FileCode,
  Check,
  HelpCircle,
  CheckCheck
} from 'lucide-react';
import { 
  PortfolioData, 
  ExperienceItem, 
  EducationItem, 
  CertificateItem, 
  SkillItem, 
  GalleryItem, 
  SocialLink,
  BlogPost,
  ProjectItem 
} from '../types/portfolio';
import { CmsService } from '../services/cmsService';
import { AuthService } from '../services/authService';
import { MessageService } from '../services/messageService';
import { ImageUploader } from './ImageUploader';
import { ResumeUploader } from './ResumeUploader';
import { SocialIcon } from './SocialIcon';
import { MessagesInboxTab } from './MessagesInboxTab';
import { AnalyticsDashboardTab } from './AnalyticsDashboardTab';
import { AdminProjectsTab } from './AdminProjectsTab';
import { AdminBlogsTab } from './AdminBlogsTab';
import { MediaLibraryTab } from './media/MediaLibraryTab';
import { TagInput } from './TagInput';
import { 
  generateSitemapXml, 
  generateRobotsTxt, 
  generatePersonSchema, 
  generateWebSiteSchema, 
  downloadTextFile, 
  getBaseUrl 
} from '../utils/seoUtils';

interface CmsStudioModalProps {
  data: PortfolioData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newData: PortfolioData) => void;
  darkMode: boolean;
  onLogout?: () => void;
}

export const CmsStudioModal: React.FC<CmsStudioModalProps> = ({
  data,
  isOpen,
  onClose,
  onSave,
  darkMode,
  onLogout,
}) => {
  const [formData, setFormData] = useState<PortfolioData>(JSON.parse(JSON.stringify(data)));
  const [activeTab, setActiveTab] = useState<string>('personal');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [sanitySyncing, setSanitySyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Security, Username & Password state
  const [currentUsername, setCurrentUsername] = useState<string>(() => AuthService.getStoredUsername());
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCurrentPass, setShowCurrentPass] = useState<boolean>(false);
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false);

  // Messages Unread Counter
  const [unreadCount, setUnreadCount] = useState<number>(() => MessageService.getUnreadCount());

  // SEO Tab state
  const [seoSubTab, setSeoSubTab] = useState<'metadata' | 'social' | 'google' | 'sitemap' | 'robots' | 'schema'>('metadata');
  const [copiedSitemap, setCopiedSitemap] = useState<boolean>(false);
  const [copiedRobots, setCopiedRobots] = useState<boolean>(false);
  const [copiedSchema, setCopiedSchema] = useState<boolean>(false);

  useEffect(() => {
    const handleMsgUpdate = () => {
      setUnreadCount(MessageService.getUnreadCount());
    };
    window.addEventListener('portfolio_messages_updated', handleMsgUpdate);
    return () => window.removeEventListener('portfolio_messages_updated', handleMsgUpdate);
  }, []);

  const prevIsOpenRef = useRef<boolean>(false);

  // Sync form data ONLY when modal transitions from closed to open
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setFormData(JSON.parse(JSON.stringify(data || CmsService.getData())));
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, data]);

  // Lock body scroll when modal is open to prevent page jumps
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    CmsService.saveData(formData);
    onSave(formData);
    setSaveStatus('Saved & Published successfully! / সফলভাবে সংরক্ষিত হয়েছে!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all portfolio content to default demo data? / আপনি কি ডিফল্ট ডেমো ডাটায় রিসেট করতে চান?')) {
      const reset = CmsService.resetToDefault();
      setFormData(JSON.parse(JSON.stringify(reset)));
      onSave(reset);
      setSaveStatus('Reset to default template');
      setTimeout(() => setSaveStatus(null), 2500);
    }
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(formData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-cms-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = CmsService.importJson(event.target?.result as string);
      if (result.success && result.data) {
        setFormData(result.data);
        onSave(result.data);
        setSaveStatus('Imported backup successfully!');
        setTimeout(() => setSaveStatus(null), 2500);
      } else {
        alert(result.error || 'Failed to import backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleTestSanitySync = async () => {
    if (!formData.cmsConfig.sanityProjectId) {
      setSyncMessage({ type: 'error', text: 'Please enter a valid Sanity Project ID.' });
      return;
    }
    setSanitySyncing(true);
    setSyncMessage(null);
    const result = await CmsService.fetchFromSanity(
      formData.cmsConfig.sanityProjectId,
      formData.cmsConfig.sanityDataset || 'production'
    );
    setSanitySyncing(false);
    if (result.success && result.data) {
      setSyncMessage({ type: 'success', text: 'Successfully connected to Sanity.io API!' });
    } else {
      setSyncMessage({ 
        type: 'error', 
        text: result.error || 'Could not connect. Ensure your dataset is public or check Project ID.' 
      });
    }
  };

  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    const result = AuthService.updateCredentials({
      currentUsername: currentUsername || AuthService.getStoredUsername(),
      currentPassword: currentPassword || undefined,
      newUsername: newUsername.trim() ? newUsername.trim() : undefined,
      newPassword: newPassword.trim() ? newPassword.trim() : undefined,
      confirmPassword,
    });

    if (result.success) {
      setPasswordStatus({ type: 'success', text: result.message });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentUsername(AuthService.getStoredUsername());
      setNewUsername('');

      // Update formData and persist to Supabase & localStorage
      const updatedSiteSettings = {
        ...formData.siteSettings,
        adminUsername: AuthService.getStoredUsername(),
        adminPassword: AuthService.getStoredPassword(),
      };
      const updatedData = { ...formData, siteSettings: updatedSiteSettings };
      setFormData(updatedData);
      CmsService.saveData(updatedData);
      onSave(updatedData);
    } else {
      setPasswordStatus({ type: 'error', text: result.message });
    }
  };

  const handleResetCredentials = () => {
    if (confirm('ইউজারনেম "admin" এবং পাসওয়ার্ড "admin" এ রিসেট করতে চান? / Reset credentials to default (admin / admin)?')) {
      AuthService.resetCredentialsToDefault();
      setCurrentUsername('admin');
      setNewUsername('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStatus({ type: 'success', text: 'ডিফল্ট রিসেট সম্পন্ন: admin / admin' });

      const updatedSiteSettings = {
        ...formData.siteSettings,
        adminUsername: 'admin',
        adminPassword: 'admin',
      };
      const updatedData = { ...formData, siteSettings: updatedSiteSettings };
      setFormData(updatedData);
      CmsService.saveData(updatedData);
      onSave(updatedData);
    }
  };

  // Safe helper updaters for collection arrays (prevents stale closure issues)
  const updateExperienceItem = (id: string, updater: (item: ExperienceItem) => ExperienceItem) => {
    setFormData((prev) => ({
      ...prev,
      experiences: (prev.experiences || []).map((item) =>
        item.id === id ? updater(item) : item
      ),
    }));
  };

  const removeExperienceItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      experiences: (prev.experiences || []).filter((item) => item.id !== id),
    }));
  };

  const addExperienceItem = () => {
    const newJob: ExperienceItem = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      company: 'New Company Inc.',
      role: 'Senior Software Engineer',
      employmentType: 'Full-time',
      location: 'San Francisco, CA',
      startDate: '2024',
      endDate: 'Present',
      current: true,
      summary: 'Lead architect directing scalable cloud systems.',
      responsibilities: ['Architected scalable cloud microservices.'],
      achievements: ['Decreased system latency by 40%.'],
      technologies: ['TypeScript', 'Next.js', 'AWS'],
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    };
    setFormData((prev) => ({
      ...prev,
      experiences: [newJob, ...(prev.experiences || [])],
    }));
  };

  const updateEducationItem = (id: string, updater: (item: EducationItem) => EducationItem) => {
    setFormData((prev) => ({
      ...prev,
      education: (prev.education || []).map((item) =>
        item.id === id ? updater(item) : item
      ),
    }));
  };

  const removeEducationItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      education: (prev.education || []).filter((item) => item.id !== id),
    }));
  };

  const addEducationItem = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      degree: 'Bachelor of Science in Software Engineering',
      institution: 'Top Tier University',
      fieldOfStudy: 'Computer Science',
      startYear: '2016',
      endYear: '2020',
      grade: '3.9 GPA',
      description: 'Core studies in algorithms, cloud systems, and discrete mathematics.',
      honors: ["Dean's List"],
    };
    setFormData((prev) => ({
      ...prev,
      education: [...(prev.education || []), newEdu],
    }));
  };

  const updateCertificateItem = (id: string, updater: (item: CertificateItem) => CertificateItem) => {
    setFormData((prev) => ({
      ...prev,
      certificates: (prev.certificates || []).map((item) =>
        item.id === id ? updater(item) : item
      ),
    }));
  };

  const removeCertificateItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      certificates: (prev.certificates || []).filter((item) => item.id !== id),
    }));
  };

  const addCertificateItem = () => {
    const newCert: CertificateItem = {
      id: `cert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      issueDate: '2024',
      credentialUrl: 'https://aws.amazon.com/verification',
      badgeUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=200&q=80',
    };
    setFormData((prev) => ({
      ...prev,
      certificates: [...(prev.certificates || []), newCert],
    }));
  };

  const updateGalleryItem = (id: string, updater: (item: GalleryItem) => GalleryItem) => {
    setFormData((prev) => ({
      ...prev,
      gallery: (prev.gallery || []).map((item) =>
        item.id === id ? updater(item) : item
      ),
    }));
  };

  const removeGalleryItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      gallery: (prev.gallery || []).filter((item) => item.id !== id),
    }));
  };

  const addGalleryItem = () => {
    const newPhoto: GalleryItem = {
      id: `gal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: 'New Gallery Snapshot',
      caption: 'High resolution visual demonstration.',
      category: 'Projects',
      imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
      date: '2024',
      tags: ['Tech', 'Architecture'],
    };
    setFormData((prev) => ({
      ...prev,
      gallery: [newPhoto, ...(prev.gallery || [])],
    }));
  };

  const handleLogoutAction = () => {
    AuthService.logout();
    if (onLogout) {
      onLogout();
    }
    onClose();
  };

  const tabs = [
    { id: 'media', label: '📁 Media Library & Assets', icon: FolderOpen },
    { id: 'analytics', label: '📊 Visitor Analytics & Traffic', icon: BarChart3 },
    { id: 'projects', label: '🚀 Projects & Case Studies', icon: Briefcase },
    { id: 'blogs', label: '✍️ Blog & Articles', icon: BookOpen },
    { id: 'personal', label: '1. Personal Info', icon: User },
    { id: 'about', label: '2. About Me', icon: FileText },
    { id: 'experience', label: '3. Experience', icon: Briefcase },
    { id: 'education', label: '4. Education & Certs', icon: GraduationCap },
    { id: 'skills', label: '5. Skills Matrix', icon: Wrench },
    { id: 'gallery', label: '6. Gallery & Photos', icon: Camera },
    { id: 'contact', label: '7. Contact Info', icon: Mail },
    { id: 'socials', label: '8. Social Links', icon: Share2 },
    { id: 'seo', label: '9. SEO Metadata', icon: Globe },
    { id: 'settings', label: '10. Site Settings & Navbar', icon: Sliders },
    { id: 'security', label: '11. Security & Credentials', icon: KeyRound },
    { id: 'messages', label: '12. Messages Inbox', icon: Inbox },
  ];

  return (
    <div 
      id="cms-studio-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden"
    >
      <div className={`w-full max-w-6xl h-[92vh] rounded-3xl border flex flex-col shadow-2xl overflow-hidden animate-fade-in ${
        darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Studio Top Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between gap-4 shrink-0 ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">CMS Studio Dashboard</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  Live Visual Editor
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Edit 100% of portfolio details and upload images directly from your device.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {saveStatus && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500 animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                {saveStatus}
              </span>
            )}

            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish</span>
            </button>

            <button
              onClick={handleLogoutAction}
              className="p-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
              title="লগআউট করুন / Logout Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                darkMode ? 'border-slate-800 bg-slate-800 text-slate-300 hover:text-white' : 'border-slate-300 bg-white text-slate-600 hover:text-slate-900'
              }`}
              title="Close CMS Studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Body: Left Tabs + Right Edit Panel */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Tab List */}
          <aside className={`w-56 sm:w-64 border-r shrink-0 overflow-y-auto p-3 space-y-1 ${
            darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50/50 border-slate-200'
          }`}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
              Content Schemas
            </div>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isSecurity = tab.id === 'security';
              const isMessages = tab.id === 'messages';
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                    isActive
                      ? isSecurity
                        ? 'bg-amber-600 text-white shadow-xs'
                        : isMessages
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-indigo-600 text-white shadow-xs'
                      : isSecurity
                        ? 'text-amber-400 hover:bg-amber-500/10'
                        : isMessages
                          ? 'text-emerald-400 hover:bg-emerald-500/10'
                          : darkMode
                            ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </div>
                  {isMessages && unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shrink-0 shadow-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Quick Actions at bottom of sidebar */}
            <div className="pt-4 mt-4 border-t border-slate-800/50 space-y-1.5 px-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                Data Management
              </div>
              <button
                onClick={handleExportJson}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-indigo-400 hover:bg-indigo-950/30 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Backup (JSON)</span>
              </button>

              <label className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-indigo-400 hover:bg-indigo-950/30 transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Import Backup (JSON)</span>
                <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
              </label>

              <button
                onClick={handleReset}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
              </button>
            </div>
          </aside>

          {/* Right Editor Area */}
          <main className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
            
            {/* 1. PERSONAL INFO TAB */}
            {activeTab === 'personal' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h3 className="text-xl font-bold">Personal Information</h3>
                  <p className="text-xs text-slate-400">Controls your Hero section, avatar photo, designation, and primary buttons.</p>
                </div>

                {/* Profile Photo Direct Device Upload */}
                <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <ImageUploader
                    label="প্রোফাইল ছবি / Profile Avatar Photo"
                    sublabel="ডিভাইস (মোবাইল/কম্পিউটার) থেকে সরাসরি ছবি আপলোড করুন অথবা ছবি লিংক দিন"
                    value={formData.personal.avatarUrl}
                    onChange={(url) => setFormData({
                      ...formData,
                      personal: { ...formData.personal, avatarUrl: url }
                    })}
                    darkMode={darkMode}
                  />
                </div>

                {/* Hero Badges & Header Texts Customization */}
                <div className={`p-5 rounded-2xl border space-y-4 ${
                  darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <h4 className="text-sm font-bold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>Hero Header Badges / হিরো সেকশনের ব্যাজসমূহ</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      হোমপেজের একদম উপরে প্রদর্শিত সবুজ অ্যাভেইল্যাবিলিটি ব্যাজ এবং স্পার্কল সাব-টাইটেল টেক্সট নিয়ন্ত্রণ করুন।
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-semibold mb-1 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                        <span>Availability Badge Text / এভেইল্যাবিলিটি স্ট্যাটাস (সবুজ ব্যাজ)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. AVAILABLE FOR EXECUTIVE & TECH OPPORTUNITIES"
                        value={formData.personal.availabilityStatus || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          personal: { ...formData.personal, availabilityStatus: e.target.value }
                        })}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                          darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Hero Role Badge / সাব-টাইটেল (স্পার্কল টেক্সট)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. EXECUTIVE & TECHNOLOGY LEADER"
                        value={formData.personal.heroBadgeTitle || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          personal: { ...formData.personal, heroBadgeTitle: e.target.value }
                        })}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                          darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/40">
                    <span className="text-xs text-slate-400">
                      হোমপেজে সবুজ অ্যাভেইল্যাবিলিটি ব্যাজ প্রদর্শন করুন:
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.siteSettings?.showAvailabilityBadge !== false}
                        onChange={(e) => setFormData({
                          ...formData,
                          siteSettings: {
                            ...formData.siteSettings,
                            showAvailabilityBadge: e.target.checked
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={formData.personal.fullName}
                      onChange={(e) => setFormData({
                        ...formData,
                        personal: { ...formData.personal, fullName: e.target.value }
                      })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Professional Designation *</label>
                    <input
                      type="text"
                      value={formData.personal.designation}
                      onChange={(e) => setFormData({
                        ...formData,
                        personal: { ...formData.personal, designation: e.target.value }
                      })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Tagline</label>
                  <input
                    type="text"
                    value={formData.personal.tagline}
                    onChange={(e) => setFormData({
                      ...formData,
                      personal: { ...formData.personal, tagline: e.target.value }
                    })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                      darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Short Introduction Bio</label>
                  <textarea
                    rows={3}
                    value={formData.personal.shortBio}
                    onChange={(e) => setFormData({
                      ...formData,
                      personal: { ...formData.personal, shortBio: e.target.value }
                    })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none resize-none ${
                      darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.personal.location}
                      onChange={(e) => setFormData({
                        ...formData,
                        personal: { ...formData.personal, location: e.target.value }
                      })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Availability Status</label>
                    <select
                      value={formData.personal.availability}
                      onChange={(e: any) => setFormData({
                        ...formData,
                        personal: { ...formData.personal, availability: e.target.value }
                      })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="Available for Hire">Available for Hire</option>
                      <option value="Open to Consulting">Open to Consulting</option>
                      <option value="Employed">Employed</option>
                      <option value="Freelance Available">Freelance Available</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Years of Experience</label>
                    <input
                      type="number"
                      value={formData.personal.yearsExperience}
                      onChange={(e) => setFormData({
                        ...formData,
                        personal: { ...formData.personal, yearsExperience: parseInt(e.target.value) || 0 }
                      })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Projects Delivered</label>
                    <input
                      type="number"
                      value={formData.personal.projectsCompleted}
                      onChange={(e) => setFormData({
                        ...formData,
                        personal: { ...formData.personal, projectsCompleted: parseInt(e.target.value) || 0 }
                      })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Primary CTA Button Label</label>
                    <input
                      type="text"
                      value={formData.personal.heroCtaPrimaryText}
                      onChange={(e) => setFormData({
                        ...formData,
                        personal: { ...formData.personal, heroCtaPrimaryText: e.target.value }
                      })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Secondary CTA Button Label</label>
                    <input
                      type="text"
                      value={formData.personal.heroCtaSecondaryText}
                      onChange={(e) => setFormData({
                        ...formData,
                        personal: { ...formData.personal, heroCtaSecondaryText: e.target.value }
                      })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* CV / Resume Section (Upload from device or URL) */}
                <div className={`p-5 rounded-2xl border space-y-4 ${
                  darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span>সিভি / রেজুমে (CV / Resume Upload & Settings)</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        ডিভাইস থেকে সরাসরি আপনার সিভি (PDF / DOCX) আপলোড করুন বা লিংক দিন। এটি হোমপেজে দেখাবে।
                      </p>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.personal.showResumeButton !== false}
                        onChange={(e) => setFormData({
                          ...formData,
                          personal: { ...formData.personal, showResumeButton: e.target.checked }
                        })}
                        className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                      />
                      <span className="text-xs font-semibold">হোমপেজে সিভি বাটন দেখান</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">সিভি বাটনের টেক্সট (Button Text)</label>
                    <input
                      type="text"
                      placeholder="যেমন: Download CV / Resume বা আমার সিভি দেখুন"
                      value={formData.personal.resumeButtonText || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        personal: { ...formData.personal, resumeButtonText: e.target.value }
                      })}
                      className={`w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border outline-none ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-2">সিভি ফাইল আপলোড (Direct Device Upload)</label>
                    <ResumeUploader
                      value={formData.personal.resumeUrl || ''}
                      fileName={formData.personal.resumeFileName}
                      darkMode={darkMode}
                      onChange={(url, fileName) => {
                        setFormData({
                          ...formData,
                          personal: {
                            ...formData.personal,
                            resumeUrl: url,
                            resumeFileName: fileName || formData.personal.resumeFileName,
                          }
                        });
                      }}
                    />
                  </div>
                </div>

              </div>
            )}

            {/* 2. ABOUT ME TAB */}
            {activeTab === 'about' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h3 className="text-xl font-bold">About & Guiding Philosophy</h3>
                  <p className="text-xs text-slate-400">Manage your detailed biographical narrative, career highlights, and core guiding pillars.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Section Main Heading</label>
                    <input
                      type="text"
                      placeholder="e.g. Strategic Vision, Impactful Leadership & Seamless Execution"
                      value={formData.about.storyTitle || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        about: { ...formData.about, storyTitle: e.target.value }
                      })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Summary Hook / Story Subtitle</label>
                    <input
                      type="text"
                      placeholder="Brief tagline or vision statement"
                      value={formData.about.storySummary}
                      onChange={(e) => setFormData({
                        ...formData,
                        about: { ...formData.about, storySummary: e.target.value }
                      })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Full Biography</label>
                  <textarea
                    rows={6}
                    value={formData.about.biography}
                    onChange={(e) => setFormData({
                      ...formData,
                      about: { ...formData.about, biography: e.target.value }
                    })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                      darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                {/* Core Pillars & Guiding Principles Section */}
                <div className={`p-5 rounded-2xl border space-y-4 ${
                  darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold flex items-center gap-2 text-indigo-400">
                        <Target className="w-4 h-4" />
                        <span>Core Pillars & Guiding Principles</span>
                      </h4>
                      <p className="text-xs text-slate-400">Customize the pillar cards displayed on your About profile.</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newPillar = {
                          title: 'New Leadership Pillar',
                          description: 'Key principle or approach driving successful project outcomes.',
                          icon: 'Target',
                        };
                        setFormData({
                          ...formData,
                          about: {
                            ...formData.about,
                            corePillars: [...(formData.about.corePillars || []), newPillar],
                          },
                        });
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Pillar</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Pillars Section Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Leadership Pillars & Guiding Principles"
                        value={formData.about.philosophyTitle}
                        onChange={(e) => setFormData({
                          ...formData,
                          about: { ...formData.about, philosophyTitle: e.target.value }
                        })}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                          darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Pillars Tagline / Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Every decision I make centers on clear communication..."
                        value={formData.about.philosophyDescription}
                        onChange={(e) => setFormData({
                          ...formData,
                          about: { ...formData.about, philosophyDescription: e.target.value }
                        })}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                          darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Pillar Cards List */}
                  <div className="space-y-3 pt-2">
                    {(formData.about.corePillars || []).map((pillar, pIdx) => (
                      <div
                        key={pIdx}
                        className={`p-4 rounded-xl border space-y-3 ${
                          darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex-1 w-full flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Pillar Title (e.g. Project Ownership)"
                              value={pillar.title}
                              onChange={(e) => {
                                const updated = [...(formData.about.corePillars || [])];
                                updated[pIdx] = { ...updated[pIdx], title: e.target.value };
                                setFormData({ ...formData, about: { ...formData.about, corePillars: updated } });
                              }}
                              className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold border outline-none ${
                                darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                              }`}
                            />

                            <select
                              value={pillar.icon || 'Target'}
                              onChange={(e) => {
                                const updated = [...(formData.about.corePillars || [])];
                                updated[pIdx] = { ...updated[pIdx], icon: e.target.value };
                                setFormData({ ...formData, about: { ...formData.about, corePillars: updated } });
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs border font-medium ${
                                darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                              }`}
                            >
                              <option value="Target">🎯 Target (Goals / Delivery)</option>
                              <option value="MessageSquare">💬 MessageSquare (Communication)</option>
                              <option value="Users">👥 Users (Team & Leadership)</option>
                              <option value="TrendingUp">📈 TrendingUp (Strategy & Growth)</option>
                              <option value="HeartHandshake">🤝 HeartHandshake (Partnership)</option>
                              <option value="Briefcase">💼 Briefcase (Management)</option>
                              <option value="ShieldCheck">🛡️ ShieldCheck (Quality & Integrity)</option>
                              <option value="Zap">⚡ Zap (Speed & Efficiency)</option>
                              <option value="Sparkles">✨ Sparkles (Excellence)</option>
                              <option value="Award">🏆 Award (Achievement)</option>
                              <option value="Clock">⏱️ Clock (Time Management)</option>
                              <option value="Compass">🧭 Compass (Direction & Vision)</option>
                              <option value="Layers">📑 Layers (Operations & Structure)</option>
                              <option value="Star">⭐ Star (Distinction)</option>
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = (formData.about.corePillars || []).filter((_, i) => i !== pIdx);
                              setFormData({ ...formData, about: { ...formData.about, corePillars: updated } });
                            }}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors"
                            title="Remove Pillar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <textarea
                          rows={2}
                          placeholder="Describe this pillar's philosophy and practical impact..."
                          value={pillar.description}
                          onChange={(e) => {
                            const updated = [...(formData.about.corePillars || [])];
                            updated[pIdx] = { ...updated[pIdx], description: e.target.value };
                            setFormData({ ...formData, about: { ...formData.about, corePillars: updated } });
                          }}
                          className={`w-full px-3 py-2 rounded-lg text-xs border outline-none ${
                            darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-700'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Highlights Editor */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                      Career Key Highlights
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...(formData.about.highlights || []), 'New major career highlight or milestone'];
                        setFormData({ ...formData, about: { ...formData.about, highlights: updated } });
                      }}
                      className="flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-400 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Highlight</span>
                    </button>
                  </div>

                  {formData.about.highlights?.map((hl, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={hl}
                        onChange={(e) => {
                          const updated = [...formData.about.highlights];
                          updated[idx] = e.target.value;
                          setFormData({ ...formData, about: { ...formData.about, highlights: updated } });
                        }}
                        className={`flex-1 px-3.5 py-2 rounded-xl text-sm border outline-none ${
                          darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.about.highlights.filter((_, i) => i !== idx);
                          setFormData({ ...formData, about: { ...formData.about, highlights: updated } });
                        }}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* 3. EXPERIENCE TAB */}
            {activeTab === 'experience' && (
              <div className="space-y-6 max-w-3xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Job Experience Timeline</h3>
                    <p className="text-xs text-slate-400">Add, reorder, or update career positions, company logos, and achievements.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addExperienceItem}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Job</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {formData.experiences.map((exp, idx) => (
                    <div 
                      key={exp.id} 
                      className={`p-6 rounded-2xl border space-y-4 ${
                        darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b pb-3 border-slate-800/60">
                        <span className="text-xs font-bold text-indigo-500">Position #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeExperienceItem(exp.id)}
                          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>

                      {/* Company Logo Device Upload */}
                      <ImageUploader
                        label="কোম্পানি লোগো / Company Logo"
                        sublabel="ডিভাইস থেকে কোম্পানি লোগো আপলোড করুন"
                        value={exp.logoUrl || ''}
                        onChange={(url) => updateExperienceItem(exp.id, (item) => ({ ...item, logoUrl: url }))}
                        darkMode={darkMode}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1">Company Name / প্রতিষ্ঠানের নাম</label>
                          <input
                            type="text"
                            placeholder="e.g. Google, Acme Inc."
                            value={exp.company}
                            onChange={(e) => updateExperienceItem(exp.id, (item) => ({ ...item, company: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-xl text-sm border outline-none ${
                              darkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1">Role Title / পদের নাম</label>
                          <input
                            type="text"
                            placeholder="e.g. Senior Software Architect"
                            value={exp.role}
                            onChange={(e) => updateExperienceItem(exp.id, (item) => ({ ...item, role: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-xl text-sm border outline-none ${
                              darkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Location / Address & Employment Type */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Location & Address / লোকেশন বা ঠিকানা *</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. San Francisco, CA / ঢাকা, বাংলাদেশ / Remote"
                            value={exp.location || ''}
                            onChange={(e) => updateExperienceItem(exp.id, (item) => ({ ...item, location: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-xl text-sm border outline-none ${
                              darkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1">Employment Type / চাকুরির ধরন</label>
                          <select
                            value={exp.employmentType || 'Full-time'}
                            onChange={(e: any) => updateExperienceItem(exp.id, (item) => ({ ...item, employmentType: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-xl text-sm border outline-none ${
                              darkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          >
                            <option value="Full-time">Full-time (ফুল-টাইম)</option>
                            <option value="Contract">Contract (চুক্তিভিত্তিক)</option>
                            <option value="Part-time">Part-time (পার্ট-টাইম)</option>
                            <option value="Remote">Remote (রিমোট)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1">Start Date / শুরুর সময়</label>
                          <input
                            type="text"
                            placeholder="e.g. 2022 / Jan 2022"
                            value={exp.startDate}
                            onChange={(e) => updateExperienceItem(exp.id, (item) => ({ ...item, startDate: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-xl text-sm border outline-none ${
                              darkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1">End Date / সমাপ্তি সময়</label>
                          <input
                            type="text"
                            placeholder="e.g. Present / Dec 2024"
                            value={exp.endDate}
                            onChange={(e) => updateExperienceItem(exp.id, (item) => ({ ...item, endDate: e.target.value }))}
                            disabled={exp.current}
                            className={`w-full px-3 py-2 rounded-xl text-sm border outline-none ${
                              exp.current 
                                ? 'opacity-50 cursor-not-allowed bg-slate-900 border-slate-800' 
                                : darkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-6">
                          <input
                            type="checkbox"
                            id={`curr-${exp.id}`}
                            checked={exp.current}
                            onChange={(e) => {
                              const isCurr = e.target.checked;
                              updateExperienceItem(exp.id, (item) => ({
                                ...item,
                                current: isCurr,
                                endDate: isCurr ? 'Present' : item.endDate === 'Present' ? '' : item.endDate
                              }));
                            }}
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                          <label htmlFor={`curr-${exp.id}`} className="text-xs font-semibold cursor-pointer">
                            Currently Working Here / বর্তমান কর্মস্থল
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1">Company Website URL (ঐচ্ছিক)</label>
                        <input
                          type="url"
                          placeholder="https://company.com"
                          value={exp.companyUrl || ''}
                          onChange={(e) => updateExperienceItem(exp.id, (item) => ({ ...item, companyUrl: e.target.value }))}
                          className={`w-full px-3 py-2 rounded-xl text-sm border outline-none ${
                            darkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1">Role Summary / সারসংক্ষেপ</label>
                        <textarea
                          rows={2}
                          placeholder="কাজের সারসংক্ষেপ বর্ণনা লিখুন..."
                          value={exp.summary}
                          onChange={(e) => updateExperienceItem(exp.id, (item) => ({ ...item, summary: e.target.value }))}
                          className={`w-full px-3 py-2 rounded-xl text-sm border outline-none resize-none ${
                            darkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      {/* Key Responsibilities & Achievements */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1">
                            Key Responsibilities (প্রতি লাইনে একটি করে)
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Architected scalable microservices&#10;Mentored 10+ junior engineers"
                            value={exp.responsibilities?.join('\n') || ''}
                            onChange={(e) => updateExperienceItem(exp.id, (item) => ({
                              ...item,
                              responsibilities: e.target.value.split('\n').filter(Boolean)
                            }))}
                            className={`w-full px-3 py-2 rounded-xl text-xs border outline-none resize-none ${
                              darkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1">
                            Key Achievements (প্রতি লাইনে একটি করে)
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Reduced cloud cost by 35%&#10;Delivered flagship project 2 weeks ahead"
                            value={exp.achievements?.join('\n') || ''}
                            onChange={(e) => updateExperienceItem(exp.id, (item) => ({
                              ...item,
                              achievements: e.target.value.split('\n').filter(Boolean)
                            }))}
                            className={`w-full px-3 py-2 rounded-xl text-xs border outline-none resize-none ${
                              darkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Tech stack tags */}
                      <div>
                        <TagInput
                          label="Technologies & Tools Used / প্রযুক্তিসমূহ"
                          sublabel="প্রযুক্তি বা টুলটির নাম লিখে 'যোগ করুন' বা Enter চাপুন"
                          placeholder="e.g. TypeScript, React, Next.js, Node.js, AWS..."
                          items={exp.technologies || []}
                          onChange={(newTechs) => updateExperienceItem(exp.id, (item) => ({ ...item, technologies: newTechs }))}
                          darkMode={darkMode}
                          colorScheme="indigo"
                          suggestions={['TypeScript', 'React', 'Node.js', 'Next.js', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'Tailwind CSS', 'GraphQL']}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. EDUCATION & CERTS TAB */}
            {activeTab === 'education' && (
              <div className="space-y-8 max-w-3xl">
                <div>
                  <h3 className="text-xl font-bold">Education & Credentials</h3>
                  <p className="text-xs text-slate-400">Manage your academic background, university degrees, and professional certifications.</p>
                </div>

                {/* Education list */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-400">Academic Degrees</h4>
                    <button
                      type="button"
                      onClick={addEducationItem}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-colors shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Degree</span>
                    </button>
                  </div>

                  {formData.education.map((edu, idx) => (
                    <div key={edu.id} className={`p-5 rounded-2xl border space-y-4 ${
                      darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Degree #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeEducationItem(edu.id)}
                          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Degree Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Bachelor of Science in Computer Science"
                            value={edu.degree}
                            onChange={(e) => updateEducationItem(edu.id, (item) => ({ ...item, degree: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-xl text-sm border outline-none ${
                              darkMode ? 'bg-slate-850 border-slate-700 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Institution / University</label>
                          <input
                            type="text"
                            placeholder="e.g. University of California, Berkeley"
                            value={edu.institution}
                            onChange={(e) => updateEducationItem(edu.id, (item) => ({ ...item, institution: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-xl text-sm border outline-none ${
                              darkMode ? 'bg-slate-850 border-slate-700 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Field of Study</label>
                          <input
                            type="text"
                            placeholder="e.g. Software Engineering"
                            value={edu.fieldOfStudy}
                            onChange={(e) => updateEducationItem(edu.id, (item) => ({ ...item, fieldOfStudy: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-xl text-sm border outline-none ${
                              darkMode ? 'bg-slate-850 border-slate-700 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Duration (Start – End)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Start (2016)"
                              value={edu.startYear}
                              onChange={(e) => updateEducationItem(edu.id, (item) => ({ ...item, startYear: e.target.value }))}
                              className={`w-1/2 px-3 py-2 rounded-xl text-sm border outline-none ${
                                darkMode ? 'bg-slate-850 border-slate-700 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500'
                              }`}
                            />
                            <input
                              type="text"
                              placeholder="End (2020)"
                              value={edu.endYear}
                              onChange={(e) => updateEducationItem(edu.id, (item) => ({ ...item, endYear: e.target.value }))}
                              className={`w-1/2 px-3 py-2 rounded-xl text-sm border outline-none ${
                                darkMode ? 'bg-slate-850 border-slate-700 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500'
                              }`}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">
                            GPA / CGPA / Grade <span className="text-slate-500 font-normal">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 3.90 / 4.00, First Class, etc."
                            value={edu.grade || ''}
                            onChange={(e) => updateEducationItem(edu.id, (item) => ({ ...item, grade: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-xl text-sm border outline-none ${
                              darkMode ? 'bg-slate-850 border-slate-700 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500'
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <TagInput
                          label="Honors & Distinctions / সম্মাননা ও অ্যাওয়ার্ড"
                          sublabel="অনার্স বা ডিসটিংশনের নাম লিখে 'যোগ করুন' বা Enter চাপুন"
                          placeholder="e.g. Magna Cum Laude, Dean's List, Merit Scholar..."
                          items={edu.honors || []}
                          onChange={(newHonors) => updateEducationItem(edu.id, (item) => ({ ...item, honors: newHonors }))}
                          darkMode={darkMode}
                          colorScheme="amber"
                          suggestions={["Dean's List", "Magna Cum Laude", "Summa Cum Laude", "First Class First", "Merit Scholarship", "Valedictorian"]}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Academic Achievements / Description</label>
                        <textarea
                          rows={2}
                          placeholder="Key coursework, thesis, research, leadership, or academic achievements..."
                          value={edu.description}
                          onChange={(e) => updateEducationItem(edu.id, (item) => ({ ...item, description: e.target.value }))}
                          className={`w-full px-3 py-2 rounded-xl text-sm border outline-none resize-none ${
                            darkMode ? 'bg-slate-850 border-slate-700 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Certificates list */}
                <div className="space-y-4 pt-4 border-t border-slate-800/60">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400">Professional Certifications</h4>
                    <button
                      type="button"
                      onClick={addCertificateItem}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white cursor-pointer transition-colors shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Certificate</span>
                    </button>
                  </div>

                  {formData.certificates.map((cert, idx) => (
                    <div key={cert.id} className={`p-4 rounded-xl border space-y-3 ${
                      darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400">Certificate #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeCertificateItem(cert.id)}
                          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>

                      {/* Certificate Badge Direct Upload */}
                      <ImageUploader
                        label="সার্টিফিকেট ব্যাজ / Certificate Badge"
                        sublabel="ডিভাইস থেকে ব্যাজ বা সার্টিফিকেট ছবি আপলোড করুন"
                        value={cert.badgeUrl || ''}
                        onChange={(url) => updateCertificateItem(cert.id, (item) => ({ ...item, badgeUrl: url }))}
                        darkMode={darkMode}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Certification Title"
                          value={cert.title}
                          onChange={(e) => updateCertificateItem(cert.id, (item) => ({ ...item, title: e.target.value }))}
                          className={`px-3 py-1.5 rounded-lg text-xs border ${
                            darkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                        <input
                          type="text"
                          placeholder="Issuer (e.g. AWS)"
                          value={cert.issuer}
                          onChange={(e) => updateCertificateItem(cert.id, (item) => ({ ...item, issuer: e.target.value }))}
                          className={`px-3 py-1.5 rounded-lg text-xs border ${
                            darkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                        <input
                          type="text"
                          placeholder="Verification URL"
                          value={cert.credentialUrl || ''}
                          onChange={(e) => updateCertificateItem(cert.id, (item) => ({ ...item, credentialUrl: e.target.value }))}
                          className={`px-3 py-1.5 rounded-lg text-xs border ${
                            darkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. SKILLS TAB */}
            {activeTab === 'skills' && (
              <div className="space-y-6 max-w-3xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold">Skills & Core Competencies Matrix</h3>
                    <p className="text-xs text-slate-400">Add, categorize, and adjust proficiency for any skill (Project Handling, Communication, Leadership, etc.).</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newSkill: SkillItem = {
                        name: 'Project Coordination & Delivery',
                        level: 90,
                        category: 'Project Management',
                        featured: true,
                      };
                      setFormData({
                        ...formData,
                        skills: [...formData.skills, newSkill],
                      });
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-colors shadow-sm w-fit"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Skill</span>
                  </button>
                </div>

                {/* Dynamic Skills Section Heading & Subtitle */}
                <div className={`p-4 rounded-2xl border space-y-3 ${
                  darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Skills Section Display Settings
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Section Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Professional Skills & Core Proficiencies"
                        value={formData.about.skillsTitle || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          about: { ...formData.about, skillsTitle: e.target.value }
                        })}
                        className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Section Subtitle / Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Breakdown of project handling, communication & leadership capabilities"
                        value={formData.about.skillsSubtitle || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          about: { ...formData.about, skillsSubtitle: e.target.value }
                        })}
                        className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Category Preset Quick Helpers */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Suggested Category Presets (or type your own):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['Project Management', 'Communication & Leadership', 'Operations & Strategy', 'Tools & Platforms', 'Client Relations', 'Strategic Planning'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          const newSkill: SkillItem = {
                            name: `New ${preset} Skill`,
                            level: 88,
                            category: preset,
                            featured: false,
                          };
                          setFormData({
                            ...formData,
                            skills: [...formData.skills, newSkill],
                          });
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                          darkMode 
                            ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-indigo-500 hover:text-white' 
                            : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600'
                        }`}
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Datalist for category autocomplete */}
                <datalist id="skill-category-presets">
                  <option value="Project Management" />
                  <option value="Communication & Leadership" />
                  <option value="Operations & Strategy" />
                  <option value="Tools & Platforms" />
                  <option value="Strategic Planning" />
                  <option value="Client Relations" />
                  <option value="Quality & Compliance" />
                  <option value="Management & Analytics" />
                </datalist>

                {/* Skills List */}
                <div className="space-y-3">
                  {formData.skills.map((skill, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3.5 rounded-2xl border flex flex-col gap-3 transition-all ${
                        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                      }`}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                        <div className="sm:col-span-6">
                          <input
                            type="text"
                            placeholder="Skill Name (e.g. Project Handling, Stakeholder Communication)"
                            value={skill.name}
                            onChange={(e) => {
                              const updated = [...formData.skills];
                              updated[idx] = { ...updated[idx], name: e.target.value };
                              setFormData({ ...formData, skills: updated });
                            }}
                            className={`w-full px-3 py-1.5 rounded-lg text-xs font-semibold border outline-none ${
                              darkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <div className="sm:col-span-4">
                          <input
                            type="text"
                            list="skill-category-presets"
                            placeholder="Category (e.g. Project Management)"
                            value={skill.category}
                            onChange={(e) => {
                              const updated = [...formData.skills];
                              updated[idx] = { ...updated[idx], category: e.target.value };
                              setFormData({ ...formData, skills: updated });
                            }}
                            className={`w-full px-3 py-1.5 rounded-lg text-xs border outline-none ${
                              darkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <div className="sm:col-span-2 flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...formData.skills];
                              updated[idx] = { ...updated[idx], featured: !updated[idx].featured };
                              setFormData({ ...formData, skills: updated });
                            }}
                            className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 border transition-colors ${
                              skill.featured
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                : darkMode
                                  ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-700'
                            }`}
                            title={skill.featured ? 'Featured on Home/Core Badge' : 'Mark as Core Skill'}
                          >
                            <Flame className="w-3 h-3" />
                            <span>{skill.featured ? 'Core' : 'Norm'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.skills.filter((_, i) => i !== idx);
                              setFormData({ ...formData, skills: updated });
                            }}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-lg cursor-pointer transition-colors"
                            title="Remove Skill"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Proficiency Slider */}
                      <div className="flex items-center gap-3 pt-1 border-t border-slate-800/40 dark:border-slate-800">
                        <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Proficiency Level:</span>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={skill.level}
                          onChange={(e) => {
                            const updated = [...formData.skills];
                            updated[idx] = { ...updated[idx], level: parseInt(e.target.value) };
                            setFormData({ ...formData, skills: updated });
                          }}
                          className="flex-1 accent-indigo-600 cursor-pointer"
                        />
                        <span className="text-xs font-mono font-bold text-indigo-500 w-12 text-right">
                          {skill.level}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. GALLERY TAB */}
            {activeTab === 'gallery' && (
              <div className="space-y-6 max-w-3xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Photo Gallery</h3>
                    <p className="text-xs text-slate-400">Upload keynote photos, project mockups, workspaces, and awards directly from your device.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addGalleryItem}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Item</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {formData.gallery.map((item, idx) => (
                    <div key={item.id} className={`p-5 rounded-2xl border space-y-4 ${
                      darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-400">Photo #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeGalleryItem(item.id)}
                          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>

                      {/* Direct Device Image Uploader for Gallery */}
                      <ImageUploader
                        label="গ্যালারি ছবি / Gallery Photo Image"
                        sublabel="ডিভাইস থেকে ফাইল নির্বাচন করুন অথবা ছবি পেস্ট করুন"
                        value={item.imageUrl}
                        onChange={(url) => updateGalleryItem(item.id, (photo) => ({ ...photo, imageUrl: url }))}
                        darkMode={darkMode}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold mb-1">Title / শিরোনাম</label>
                          <input
                            type="text"
                            placeholder="Title"
                            value={item.title}
                            onChange={(e) => updateGalleryItem(item.id, (photo) => ({ ...photo, title: e.target.value }))}
                            className={`w-full px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                              darkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1">Category / ক্যাটাগরি</label>
                          <select
                            value={item.category}
                            onChange={(e: any) => updateGalleryItem(item.id, (photo) => ({ ...photo, category: e.target.value }))}
                            className={`w-full px-3 py-1.5 rounded-lg text-xs border ${
                              darkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          >
                            <option value="Projects">Projects</option>
                            <option value="Speaking & Events">Speaking & Events</option>
                            <option value="Workspaces">Workspaces</option>
                            <option value="Awards & Life">Awards & Life</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold mb-1">Date / তারিখ বা বছর (যেমন: 2024 / Oct 2024)</label>
                          <input
                            type="text"
                            placeholder="e.g. 2024 / Oct 2024 / 12 Dec 2024"
                            value={item.date || ''}
                            onChange={(e) => updateGalleryItem(item.id, (photo) => ({ ...photo, date: e.target.value }))}
                            className={`w-full px-3 py-1.5 rounded-lg text-xs border ${
                              darkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <TagInput
                            label="Tags / ট্যাগসমূহ"
                            sublabel="ট্যাগ লিখে 'যোগ করুন' বা Enter চাপুন"
                            placeholder="Tech, Architecture, Event..."
                            items={item.tags || []}
                            onChange={(newTags) => updateGalleryItem(item.id, (photo) => ({ ...photo, tags: newTags }))}
                            darkMode={darkMode}
                            colorScheme="purple"
                            suggestions={['Architecture', 'Tech', 'Event', 'Team', 'Design', 'Award', 'Conference']}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold mb-1">Caption / Description / ক্যাপশন</label>
                          <input
                            type="text"
                            placeholder="Caption / Description"
                            value={item.caption}
                            onChange={(e) => updateGalleryItem(item.id, (photo) => ({ ...photo, caption: e.target.value }))}
                            className={`w-full px-3 py-1.5 rounded-lg text-xs border ${
                              darkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Image Alt Text (SEO & Accessibility)</label>
                          <input
                            type="text"
                            placeholder="e.g. Alex Vance speaking at Global Tech Conference"
                            value={item.alt || ''}
                            onChange={(e) => updateGalleryItem(item.id, (photo) => ({ ...photo, alt: e.target.value }))}
                            className={`w-full px-3 py-1.5 rounded-lg text-xs border ${
                              darkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. CONTACT TAB */}
            {activeTab === 'contact' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h3 className="text-xl font-bold">Contact Information</h3>
                  <p className="text-xs text-slate-400">Direct contact channels, timezone settings, and calendar scheduling.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Direct Email</label>
                    <input
                      type="email"
                      value={formData.contact.email}
                      onChange={(e) => setFormData({
                        ...formData,
                        contact: { ...formData.contact, email: e.target.value }
                      })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Phone Number / WhatsApp</label>
                    <input
                      type="text"
                      value={formData.contact.phone}
                      onChange={(e) => setFormData({
                        ...formData,
                        contact: { ...formData.contact, phone: e.target.value }
                      })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Location Description</label>
                    <input
                      type="text"
                      value={formData.contact.location}
                      onChange={(e) => setFormData({
                        ...formData,
                        contact: { ...formData.contact, location: e.target.value }
                      })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Timezone</label>
                    <input
                      type="text"
                      value={formData.contact.timezone}
                      onChange={(e) => setFormData({
                        ...formData,
                        contact: { ...formData.contact, timezone: e.target.value }
                      })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Working Hours</label>
                    <input
                      type="text"
                      value={formData.contact.workingHours}
                      onChange={(e) => setFormData({
                        ...formData,
                        contact: { ...formData.contact, workingHours: e.target.value }
                      })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Calendly / Meeting Booking Link</label>
                    <input
                      type="text"
                      value={formData.contact.calendlyUrl || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        contact: { ...formData.contact, calendlyUrl: e.target.value }
                      })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 8. SOCIALS TAB */}
            {activeTab === 'socials' && (
              <div className="space-y-6 max-w-3xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold">Social Media Profiles (সোশ্যাল মিডিয়া ও কানেক্ট লিঙ্ক)</h3>
                    <p className="text-xs text-slate-400">
                      ফেসবুক, ইন্সটাগ্রাম, হোয়াটসঅ্যাপ, টেলিগ্রাম ইত্যাদি যুক্ত করুন এবং যেকোনোটি অন/অফ (Active/Inactive) করুন।
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newSocial: SocialLink = {
                        id: `soc-${Date.now()}`,
                        platform: 'New Platform',
                        url: 'https://',
                        iconName: 'Globe',
                        username: '@username',
                        enabled: true,
                      };
                      setFormData({ ...formData, socials: [...formData.socials, newSocial] });
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs cursor-pointer shrink-0 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন লিঙ্ক যোগ করুন</span>
                  </button>
                </div>

                {/* Quick Add Presets Bar */}
                <div className={`p-4 rounded-2xl border space-y-2 ${
                  darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <p className="text-xs font-semibold text-slate-400">কুইক অ্যাড (Quick Add Popular Platforms):</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { platform: 'Facebook', iconName: 'Facebook', defaultUrl: 'https://facebook.com/', defaultUser: 'facebook.com/username' },
                      { platform: 'Instagram', iconName: 'Instagram', defaultUrl: 'https://instagram.com/', defaultUser: '@username' },
                      { platform: 'WhatsApp', iconName: 'WhatsApp', defaultUrl: 'https://wa.me/', defaultUser: '+8801...' },
                      { platform: 'Telegram', iconName: 'Telegram', defaultUrl: 'https://t.me/', defaultUser: '@username' },
                      { platform: 'YouTube', iconName: 'YouTube', defaultUrl: 'https://youtube.com/@', defaultUser: '@channel' },
                      { platform: 'LinkedIn', iconName: 'Linkedin', defaultUrl: 'https://linkedin.com/in/', defaultUser: 'in/username' },
                      { platform: 'GitHub', iconName: 'Github', defaultUrl: 'https://github.com/', defaultUser: '@username' },
                      { platform: 'Twitter', iconName: 'Twitter', defaultUrl: 'https://x.com/', defaultUser: '@username' },
                      { platform: 'TikTok', iconName: 'TikTok', defaultUrl: 'https://tiktok.com/@', defaultUser: '@username' },
                      { platform: 'Discord', iconName: 'Discord', defaultUrl: 'https://discord.gg/', defaultUser: 'Discord Server' },
                    ].map((preset) => {
                      const alreadyExists = formData.socials.some(s => s.platform.toLowerCase() === preset.platform.toLowerCase());
                      return (
                        <button
                          key={preset.platform}
                          type="button"
                          disabled={alreadyExists}
                          onClick={() => {
                            const newSocial: SocialLink = {
                              id: `soc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                              platform: preset.platform,
                              url: preset.defaultUrl,
                              iconName: preset.iconName,
                              username: preset.defaultUser,
                              enabled: true,
                            };
                            setFormData({ ...formData, socials: [...formData.socials, newSocial] });
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                            alreadyExists
                              ? 'opacity-40 cursor-not-allowed border-slate-700 bg-slate-800/40 text-slate-500'
                              : darkMode
                                ? 'border-slate-750 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white hover:border-indigo-500'
                                : 'border-slate-300 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 shadow-xs'
                          }`}
                        >
                          <SocialIcon platformOrIcon={preset.iconName} className="w-3.5 h-3.5" />
                          <span>{preset.platform}</span>
                          {alreadyExists ? <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-0.5" /> : <Plus className="w-3 h-3 text-indigo-400 ml-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Socials List */}
                <div className="space-y-4">
                  {formData.socials.map((social, idx) => (
                    <div 
                      key={social.id} 
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        social.enabled 
                          ? darkMode 
                            ? 'bg-slate-900 border-indigo-500/40 shadow-sm' 
                            : 'bg-white border-indigo-200 shadow-sm'
                          : darkMode 
                            ? 'bg-slate-950/60 border-slate-800/80 opacity-75' 
                            : 'bg-slate-100/60 border-slate-200 opacity-75'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/40">
                        
                        {/* Icon & Name Preview */}
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs transition-colors ${
                            social.enabled
                              ? 'bg-indigo-600 text-white border-indigo-500'
                              : darkMode ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-slate-200 text-slate-500 border-slate-300'
                          }`}>
                            <SocialIcon platformOrIcon={social.iconName || social.platform} className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold flex items-center gap-2">
                              <span>{social.platform}</span>
                              {social.enabled ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                                  সক্রিয় (Active)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 border border-slate-500/30 text-slate-400">
                                  নিষ্ক্রিয় (Inactive)
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-400">{social.username || 'No handle'}</p>
                          </div>
                        </div>

                        {/* Toggle Active Switch & Delete Button */}
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={social.enabled}
                            onClick={() => {
                              const updated = [...formData.socials];
                              updated[idx] = { ...updated[idx], enabled: !updated[idx].enabled };
                              setFormData({ ...formData, socials: updated });
                            }}
                            className="flex items-center gap-2 cursor-pointer select-none group focus:outline-none"
                            title={social.enabled ? 'নিষ্ক্রিয় করতে ক্লিক করুন' : 'সক্রিয় করতে ক্লিক করুন'}
                          >
                            <div
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                                social.enabled ? 'bg-emerald-600' : 'bg-slate-700'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  social.enabled ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </div>
                            <span className={`text-xs font-semibold ${
                              social.enabled ? 'text-emerald-400' : 'text-slate-400'
                            }`}>
                              {social.enabled ? 'Active' : 'Inactive'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.socials.filter((_, i) => i !== idx);
                              setFormData({ ...formData, socials: updated });
                            }}
                            className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Inputs Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">প্ল্যাটফর্ম নাম (Platform Name)</label>
                          <input
                            type="text"
                            value={social.platform}
                            onChange={(e) => {
                              const updated = [...formData.socials];
                              updated[idx].platform = e.target.value;
                              setFormData({ ...formData, socials: updated });
                            }}
                            className={`w-full px-3 py-1.5 rounded-xl text-xs border outline-none ${
                              darkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">ইউজারনেম / হ্যান্ডেল (Username/Handle)</label>
                          <input
                            type="text"
                            value={social.username}
                            onChange={(e) => {
                              const updated = [...formData.socials];
                              updated[idx].username = e.target.value;
                              setFormData({ ...formData, socials: updated });
                            }}
                            className={`w-full px-3 py-1.5 rounded-xl text-xs border outline-none ${
                              darkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">প্রোফাইল লিংক (Full URL)</label>
                          <input
                            type="text"
                            value={social.url}
                            onChange={(e) => {
                              const updated = [...formData.socials];
                              updated[idx].url = e.target.value;
                              setFormData({ ...formData, socials: updated });
                            }}
                            className={`w-full px-3 py-1.5 rounded-xl text-xs border outline-none ${
                              darkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9. SEO & GOOGLE INDEXING TAB */}
            {activeTab === 'seo' && (
              <div className="space-y-6 max-w-4xl">
                {/* Header with quick stats */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Globe className="w-5 h-5 text-indigo-500" />
                      <span>SEO & Google Search Indexing Suite</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      সার্চ ইঞ্জিন অপটিমাইজেশন, গুগল ইনডেক্সিং, সোশ্যাল শেয়ার প্রিভিউ এবং সাইটম্যাপ ম্যানেজমেন্ট।
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      SEO Engine Active
                    </span>
                  </div>
                </div>

                {/* Sub-tabs Navigation */}
                <div className={`flex flex-wrap items-center gap-1.5 p-1 rounded-2xl border ${
                  darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  {[
                    { id: 'metadata', label: '1. Meta & Titles', icon: FileText },
                    { id: 'social', label: '2. Social & OG Cards', icon: Share2 },
                    { id: 'google', label: '3. Google Console & GA4', icon: Search },
                    { id: 'sitemap', label: '4. XML Sitemap', icon: FileCode },
                    { id: 'robots', label: '5. robots.txt', icon: Code2 },
                    { id: 'schema', label: '6. Schema.org (JSON-LD)', icon: Sparkles },
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = seoSubTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSeoSubTab(tab.id as any)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : darkMode
                            ? 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* SUBTAB 1: META & TITLES */}
                {seoSubTab === 'metadata' && (
                  <div className="space-y-5">
                    {/* SEO Health Quick Audit */}
                    <div className={`p-4 rounded-2xl border ${
                      darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-indigo-50/50 border-indigo-100'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                          SEO Readiness Audit
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-400">
                          Title: {(formData.seo.metaTitle || '').length}/60 chars | Desc: {(formData.seo.metaDescription || '').length}/160 chars
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Dynamic Meta tags</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Canonical URLs</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Schema JSON-LD</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${formData.seo.ogImageUrl ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {formData.seo.ogImageUrl ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                          <span>OG Share Image</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold">
                          Meta Title (Google Search Result Heading)
                        </label>
                        <span className={`text-[11px] font-mono ${
                          (formData.seo.metaTitle || '').length > 60 ? 'text-amber-400' : 'text-slate-400'
                        }`}>
                          {(formData.seo.metaTitle || '').length} / 60 characters (Optimal: 50-60)
                        </span>
                      </div>
                      <input
                        type="text"
                        value={formData.seo.metaTitle}
                        onChange={(e) => setFormData({
                          ...formData,
                          seo: { ...formData.seo, metaTitle: e.target.value }
                        })}
                        placeholder="e.g. Alex Vance | Senior Solutions Architect & Staff Engineer"
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                          darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
                        }`}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold">
                          Meta Description (Google Search Snippet)
                        </label>
                        <span className={`text-[11px] font-mono ${
                          (formData.seo.metaDescription || '').length > 160 ? 'text-amber-400' : 'text-slate-400'
                        }`}>
                          {(formData.seo.metaDescription || '').length} / 160 characters (Optimal: 140-160)
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={formData.seo.metaDescription}
                        onChange={(e) => setFormData({
                          ...formData,
                          seo: { ...formData.seo, metaDescription: e.target.value }
                        })}
                        placeholder="Comprehensive 1-2 sentence overview of your skillset, background, and enterprise achievements."
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none resize-none ${
                          darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5">
                          Canonical Base URL (Website Domain)
                        </label>
                        <input
                          type="text"
                          placeholder="https://alexvance.dev or https://yourname.vercel.app"
                          value={formData.seo.canonicalUrl}
                          onChange={(e) => setFormData({
                            ...formData,
                            seo: { ...formData.seo, canonicalUrl: e.target.value }
                          })}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                            darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                        <span className="block text-[11px] text-slate-400 mt-1">
                          সাইটম্যাপ এবং ক্যানোনিকাল ট্যাগ তৈরিতে ব্যবহৃত হবে।
                        </span>
                      </div>

                      <div>
                        <TagInput
                          label="Focus Keywords / এসইও কি-ওয়ার্ডসমূহ"
                          sublabel="একটি কি-ওয়ার্ড লিখে 'যোগ করুন' বা Enter চাপুন"
                          placeholder="Solutions Architect, Staff Engineer, TypeScript, Cloud..."
                          items={formData.seo.keywords || []}
                          onChange={(newKeywords) => {
                            setFormData({
                              ...formData,
                              seo: { ...formData.seo, keywords: newKeywords }
                            });
                          }}
                          darkMode={darkMode}
                          colorScheme="emerald"
                          suggestions={['Full-Stack Engineer', 'Solutions Architect', 'Cloud Architecture', 'React & TypeScript', 'System Design', 'DevOps']}
                        />
                      </div>
                    </div>

                    {/* Directives Toggles */}
                    <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="index-follow-toggle"
                          checked={formData.seo.indexFollow !== false}
                          onChange={(e) => setFormData({
                            ...formData,
                            seo: { ...formData.seo, indexFollow: e.target.checked }
                          })}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <div>
                          <label htmlFor="index-follow-toggle" className="text-xs font-bold cursor-pointer">
                            Search Engine Indexing & Robot Following (index, follow)
                          </label>
                          <p className="text-[11px] text-slate-400">
                            গুগল ও বিং সার্চ ইঞ্জিনকে সাইটের সব পেজ ক্রল ও ইনডেক্স করার অনুমতি দেয়।
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="structured-data-toggle"
                          checked={formData.seo.structuredDataEnabled !== false}
                          onChange={(e) => setFormData({
                            ...formData,
                            seo: { ...formData.seo, structuredDataEnabled: e.target.checked }
                          })}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <div>
                          <label htmlFor="structured-data-toggle" className="text-xs font-bold cursor-pointer">
                            Schema.org JSON-LD Structured Data
                          </label>
                          <p className="text-[11px] text-slate-400">
                            গুগল সার্চে Rich Snippet ও Person Card পাওয়ার জন্য।
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB 2: SOCIAL & OPEN GRAPH */}
                {seoSubTab === 'social' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: Uploader */}
                      <div className="space-y-4">
                        <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                          <ImageUploader
                            label="সোশ্যাল শেয়ার ইমেজ / Open Graph Share Image (1200x630)"
                            sublabel="লিংক ফেসবুকে, হোয়াটসঅ্যাপে বা লিঙ্কডইনে শেয়ার করার সময় যে ব্যানার ছবি দেখাবে"
                            value={formData.seo.ogImageUrl}
                            onChange={(url) => setFormData({
                              ...formData,
                              seo: { ...formData.seo, ogImageUrl: url }
                            })}
                            darkMode={darkMode}
                            aspectRatio="landscape"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1">Twitter / X Handle (e.g. @username)</label>
                          <input
                            type="text"
                            placeholder="@alexvance_dev"
                            value={formData.seo.twitterHandle || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              seo: { ...formData.seo, twitterHandle: e.target.value }
                            })}
                            className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                              darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Right: Live Social Card Simulator */}
                      <div className="space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Live Social Share Card Preview (Facebook, LinkedIn, Discord)
                        </span>

                        <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl max-w-sm mx-auto">
                          <div className="aspect-[1.91/1] w-full bg-slate-900 relative overflow-hidden flex items-center justify-center">
                            {formData.seo.ogImageUrl ? (
                              <img
                                src={formData.seo.ogImageUrl}
                                alt="OG Preview"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="p-4 text-center">
                                <Share2 className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                                <span className="text-xs text-slate-500">No OG image selected</span>
                              </div>
                            )}
                          </div>
                          <div className="p-4 bg-slate-900/90 border-t border-slate-800 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              {formData.seo.canonicalUrl ? new URL(formData.seo.canonicalUrl.startsWith('http') ? formData.seo.canonicalUrl : `https://${formData.seo.canonicalUrl}`).hostname : 'alexvance.dev'}
                            </span>
                            <h4 className="text-xs font-bold text-white line-clamp-1">
                              {formData.seo.metaTitle || `${formData.personal.fullName} - Portfolio`}
                            </h4>
                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                              {formData.seo.metaDescription || formData.personal.tagline}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB 3: GOOGLE CONSOLE & GA4 */}
                {seoSubTab === 'google' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Google Site Verification */}
                      <div className={`p-5 rounded-2xl border space-y-3 ${
                        darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                            <Search className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold">Google Search Console</h4>
                            <span className="text-[10px] text-slate-400">Site Verification Token</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">
                            Verification Token / HTML Tag Content
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. dGVzdC12ZXJpZmljYXRpb24tdG9rZW4..."
                            value={formData.seo.googleSiteVerification || ''}
                            onChange={(e) => {
                              let val = e.target.value;
                              // If user pastes whole meta tag: <meta name="google-site-verification" content="XYZ" />
                              const match = val.match(/content=["'](.*?)["']/);
                              if (match && match[1]) val = match[1];
                              setFormData({
                                ...formData,
                                seo: { ...formData.seo, googleSiteVerification: val }
                              });
                            }}
                            className={`w-full px-3 py-2 rounded-xl text-xs font-mono border outline-none ${
                              darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                          <span className="block text-[10px] text-slate-400 mt-1">
                            গুগল সার্চ কনসোল থেকে প্রাপ্ত HTML Tag এর <code>content="..."</code> টোকেন এখানে দিন।
                          </span>
                        </div>
                      </div>

                      {/* Google Analytics 4 */}
                      <div className={`p-5 rounded-2xl border space-y-3 ${
                        darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                            <BarChart3 className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold">Google Analytics 4 (GA4)</h4>
                            <span className="text-[10px] text-slate-400">Measurement ID</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">
                            GA4 Measurement ID (G-XXXXXXXXXX)
                          </label>
                          <input
                            type="text"
                            placeholder="G-ABC123XYZ"
                            value={formData.seo.googleAnalyticsId || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              seo: { ...formData.seo, googleAnalyticsId: e.target.value.trim() }
                            })}
                            className={`w-full px-3 py-2 rounded-xl text-xs font-mono border outline-none ${
                              darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                          <span className="block text-[10px] text-slate-400 mt-1">
                            গুগল অ্যানালিটিক্স প্রোপার্টি থেকে <code>G-XXXXXX</code> আইডি দিলে স্বয়ংক্রিয়ভাবে ট্র্যাকিং চালু হবে।
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Submission Guidelines in Bengali & English */}
                    <div className={`p-5 rounded-2xl border space-y-3 ${
                      darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                    }`}>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4" />
                        <span>গুগল সার্চে আপনার সাইট দ্রুত ইনডেক্স করার উপায় / Google Indexing Guide</span>
                      </h4>
                      <ol className="list-decimal list-inside text-xs space-y-2 text-slate-300 leading-relaxed">
                        <li>
                          <strong>Google Search Console</strong> (<a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="text-indigo-400 underline">search.google.com</a>)-এ যান এবং আপনার ডোমেইন যুক্ত করুন।
                        </li>
                        <li>
                          যাচাইকরণের (Verification) জন্য <strong>HTML Tag</strong> অপশন বেছে নিন এবং টোকেনটি উপরের ঘরে পেস্ট করুন।
                        </li>
                        <li>
                          সাইট পাবলিশ হওয়ার পর সার্চ কনসোলে <strong>Sitemaps</strong> সেকশনে গিয়ে <code>sitemap.xml</code> সাবমিট করুন।
                        </li>
                        <li>
                          ২৪-৪৮ ঘণ্টার মধ্যে গুগল রোবট আপনার সব পেজ, প্রজেক্ট এবং ব্লগ ইনডেক্স করে সার্চ ফলাফলে যুক্ত করবে।
                        </li>
                      </ol>
                    </div>
                  </div>
                )}

                {/* SUBTAB 4: XML SITEMAP */}
                {seoSubTab === 'sitemap' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-indigo-400" />
                          <span>Live Dynamic XML Sitemap</span>
                        </h4>
                        <p className="text-xs text-slate-400">
                          আপনার সব পেজ, {formData.projects?.length || 0} টি প্রজেক্ট এবং {formData.blogs?.length || 0} টি ব্লগের ইউআরএল সহ তৈরি।
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const xml = generateSitemapXml(formData);
                            navigator.clipboard.writeText(xml);
                            setCopiedSitemap(true);
                            setTimeout(() => setCopiedSitemap(false), 2500);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                            copiedSitemap
                              ? 'bg-emerald-600 text-white border-emerald-500'
                              : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {copiedSitemap ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedSitemap ? 'Copied XML!' : 'Copy XML'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const xml = generateSitemapXml(formData);
                            downloadTextFile(xml, 'sitemap.xml', 'application/xml');
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download sitemap.xml</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950 font-mono text-[11px] text-slate-300 max-h-72 overflow-y-auto">
                      <pre className="whitespace-pre-wrap">{generateSitemapXml(formData)}</pre>
                    </div>
                  </div>
                )}

                {/* SUBTAB 5: ROBOTS.TXT */}
                {seoSubTab === 'robots' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold flex items-center gap-2">
                          <Code2 className="w-4 h-4 text-emerald-400" />
                          <span>Live robots.txt Configuration</span>
                        </h4>
                        <p className="text-xs text-slate-400">
                          Crawler directives for Googlebot, Bingbot, and other verified web crawlers.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const txt = generateRobotsTxt(formData);
                            navigator.clipboard.writeText(txt);
                            setCopiedRobots(true);
                            setTimeout(() => setCopiedRobots(false), 2500);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                            copiedRobots
                              ? 'bg-emerald-600 text-white border-emerald-500'
                              : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {copiedRobots ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedRobots ? 'Copied!' : 'Copy robots.txt'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const txt = generateRobotsTxt(formData);
                            downloadTextFile(txt, 'robots.txt', 'text/plain');
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download robots.txt</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950 font-mono text-xs text-emerald-400">
                      <pre className="whitespace-pre-wrap">{generateRobotsTxt(formData)}</pre>
                    </div>
                  </div>
                )}

                {/* SUBTAB 6: SCHEMA.ORG JSON-LD */}
                {seoSubTab === 'schema' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>Schema.org JSON-LD Structured Data Preview</span>
                        </h4>
                        <p className="text-xs text-slate-400">
                          Person, Profile, and WebSite schemas automatically injected on all pages.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href="https://search.google.com/test/rich-results"
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Test in Google Rich Results</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            const schema = generatePersonSchema(formData);
                            navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
                            setCopiedSchema(true);
                            setTimeout(() => setCopiedSchema(false), 2500);
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedSchema ? 'Copied JSON!' : 'Copy Schema'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950 font-mono text-[11px] text-amber-300 max-h-72 overflow-y-auto">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(generatePersonSchema(formData), null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 10. SITE SETTINGS & SANITY SYNC TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h3 className="text-xl font-bold">Site Settings & Branding</h3>
                  <p className="text-xs text-slate-400">ন্যাভবার লোগো, ব্র্যান্ড নাম, ট্যাগলাইন এবং ফুটার টেক্সট কাস্টমাইজ করুন।</p>
                </div>

                {/* Direct Device Logo Upload */}
                <div className={`p-5 rounded-2xl border space-y-3 ${
                  darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                      ন্যাভবার ব্র্যান্ড লোগো / Navbar Brand Logo
                    </label>
                    <p className="text-xs text-slate-400 mb-2">
                      সরাসরি আপনার কম্পিউটার বা মোবাইল ডিভাইস থেকে লোগো ছবি আপলোড করুন অথবা ইমেজ লিঙ্ক দিন।
                    </p>
                  </div>
                  <ImageUploader
                    id="brand-logo-uploader"
                    label="Brand Logo Image"
                    value={formData.siteSettings.brandLogoUrl || ''}
                    onChange={(url) => setFormData({
                      ...formData,
                      siteSettings: { ...formData.siteSettings, brandLogoUrl: url }
                    })}
                    darkMode={darkMode}
                    aspectRatio="square"
                    placeholder="Upload your brand or personal logo..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Brand Name / নাম</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={formData.siteSettings.brandName}
                      onChange={(e) => setFormData({
                        ...formData,
                        siteSettings: { ...formData.siteSettings, brandName: e.target.value }
                      })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Brand Subtitle / ট্যাগলাইন (Portfolio & CMS)</label>
                    <input
                      type="text"
                      placeholder="e.g. Portfolio & CMS, Software Architect"
                      value={formData.siteSettings.brandSubtitle || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        siteSettings: { ...formData.siteSettings, brandSubtitle: e.target.value }
                      })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Footer Copyright Text / ফুটার কপিরাইট</label>
                    <input
                      type="text"
                      value={formData.siteSettings.footerText}
                      onChange={(e) => setFormData({
                        ...formData,
                        siteSettings: { ...formData.siteSettings, footerText: e.target.value }
                      })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Initial Site Loading Text / সাইট লোডিং মেসেজ
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Portfolio Loading... বা লোড হচ্ছে..."
                      value={formData.siteSettings.loadingText || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        siteSettings: { ...formData.siteSettings, loadingText: e.target.value }
                      })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
                      }`}
                    />
                    <span className="block text-[11px] text-slate-400 mt-1">
                      সাইট প্রথমবার ওপেন হওয়ার সময় এই লেখাটি স্পিনারের সাথে প্রদর্শিত হবে।
                    </span>
                  </div>
                </div>

                {/* Dynamic Navbar Menu Labels Customizer */}
                <div className={`p-6 rounded-3xl border space-y-4 ${
                  darkMode ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-indigo-50/60 border-indigo-200'
                }`}>
                  <div>
                    <h4 className="text-sm font-bold flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-indigo-400" />
                      <span>ন্যাভবার মেনু কাস্টমাইজেশন / Navbar Menu Labels</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ওয়েবসাইটের সকল নেভিগেশন মেনুর নাম (Home, About, Projects, Blog ইত্যাদি) আপনার পছন্দমতো বাংলায় বা ইংরেজিতে পরিবর্তন করুন।
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { key: 'home', defaultLabel: 'Home', bengaliHint: 'হোম' },
                      { key: 'about', defaultLabel: 'About', bengaliHint: 'পরিচিতি / সম্পর্কে' },
                      { key: 'projects', defaultLabel: 'Projects', bengaliHint: 'প্রজেক্টস / কাজসমূহ' },
                      { key: 'blogs', defaultLabel: 'Blog', bengaliHint: 'ব্লগ / আর্টিকেল' },
                      { key: 'experience', defaultLabel: 'Experience', bengaliHint: 'অভিজ্ঞতা' },
                      { key: 'education', defaultLabel: 'Education', bengaliHint: 'শিক্ষা ও সনদ' },
                      { key: 'gallery', defaultLabel: 'Gallery', bengaliHint: 'গ্যালারি' },
                      { key: 'contact', defaultLabel: 'Contact', bengaliHint: 'যোগাযোগ' },
                    ].map((navItem) => {
                      const currentVal = formData.siteSettings.navCustomLabels?.[navItem.key] ?? '';
                      return (
                        <div key={navItem.key} className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-300">
                            {navItem.defaultLabel} ({navItem.bengaliHint})
                          </label>
                          <input
                            type="text"
                            placeholder={navItem.defaultLabel}
                            value={currentVal}
                            onChange={(e) => {
                              const updatedLabels = {
                                ...(formData.siteSettings.navCustomLabels || {}),
                                [navItem.key]: e.target.value
                              };
                              setFormData({
                                ...formData,
                                siteSettings: {
                                  ...formData.siteSettings,
                                  navCustomLabels: updatedLabels
                                }
                              });
                            }}
                            className={`w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-1 focus:ring-indigo-500 ${
                              darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sanity Cloud Project Connection Box */}
                <div className={`p-6 rounded-3xl border space-y-4 ${
                  darkMode ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-indigo-50/60 border-indigo-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      S
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Sanity.io Cloud CMS Link (Optional)</h4>
                      <p className="text-xs text-slate-400">Connect to your real Sanity studio for team collaboration.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Sanity Project ID</label>
                      <input
                        type="text"
                        placeholder="e.g. v3x9zp1a"
                        value={formData.cmsConfig.sanityProjectId || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          cmsConfig: { ...formData.cmsConfig, sanityProjectId: e.target.value }
                        })}
                        className={`w-full px-3 py-2 rounded-xl text-xs border font-mono ${
                          darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">Sanity Dataset</label>
                      <input
                        type="text"
                        placeholder="production"
                        value={formData.cmsConfig.sanityDataset || 'production'}
                        onChange={(e) => setFormData({
                          ...formData,
                          cmsConfig: { ...formData.cmsConfig, sanityDataset: e.target.value }
                        })}
                        className={`w-full px-3 py-2 rounded-xl text-xs border font-mono ${
                          darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleTestSanitySync}
                      disabled={sanitySyncing}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${sanitySyncing ? 'animate-spin' : ''}`} />
                      <span>Test Sanity.io Query</span>
                    </button>

                    {syncMessage && (
                      <span className={`text-xs font-semibold flex items-center gap-1 ${
                        syncMessage.type === 'success' ? 'text-emerald-500' : 'text-amber-500'
                      }`}>
                        {syncMessage.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        {syncMessage.text}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* 11. SECURITY & CREDENTIALS (USERNAME & PASSWORD) MANAGEMENT TAB */}
            {activeTab === 'security' && (
              <div className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-amber-400" />
                      <span>ইউজারনেম ও পাসওয়ার্ড সিকিউরিটি / Admin Credentials Security</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      এডমিন প্যানেলে প্রবেশের ইউজারনেম এবং পাসওয়ার্ড উভয়ই এখান থেকে নিরাপদভাবে পরিবর্তন করুন।
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>ইউজার: {AuthService.getStoredUsername()}</span>
                  </div>
                </div>

                <form onSubmit={handleUpdateCredentials} className={`p-6 rounded-3xl border space-y-5 ${
                  darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  
                  {/* Current Credentials Verification */}
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        বর্তমান লগইন তথ্য যাচাই / Verify Current Credentials
                      </div>
                      <span className="text-[11px] text-amber-300/80">বর্তমান ইউজার: <strong>{AuthService.getStoredUsername()}</strong></span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          বর্তমান ইউজারনেম / Current Username *
                        </label>
                        <input
                          type="text"
                          placeholder="বর্তমান ইউজারনেম (e.g. admin)..."
                          value={currentUsername}
                          onChange={(e) => setCurrentUsername(e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                            darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          বর্তমান পাসওয়ার্ড / Current Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPass ? 'text' : 'password'}
                            placeholder="বর্তমান পাসওয়ার্ড..."
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className={`w-full px-3 py-2 pr-9 rounded-xl text-xs border outline-none ${
                              darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                          >
                            {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* New Credentials to Update */}
                  <div className="space-y-4 pt-1">
                    <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      নতুন লগইন তথ্য (যা পরিবর্তন করতে চান) / New Credentials to Set
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        নতুন ইউজারনেম / New Username (ঐচ্ছিক / অপরিবর্তিত রাখতে ফাঁকা রাখুন)
                      </label>
                      <input
                        type="text"
                        placeholder="নতুন ইউজারনেম লিখুন (যেমন: superadmin)..."
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                          darkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-300">
                          নতুন পাসওয়ার্ড / New Password (ঐচ্ছিক)
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPass ? 'text' : 'password'}
                            placeholder="কমপক্ষে ৪ অক্ষরের নতুন পাসওয়ার্ড..."
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={`w-full px-3.5 py-2.5 pr-9 rounded-xl text-sm border outline-none ${
                              darkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPass(!showNewPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                          >
                            {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-300">
                          নতুন পাসওয়ার্ড নিশ্চিতকরণ / Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPass ? 'text' : 'password'}
                            placeholder="পুনরায় নতুন পাসওয়ার্ড লিখুন..."
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full px-3.5 py-2.5 pr-9 rounded-xl text-sm border outline-none ${
                              darkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPass(!showConfirmPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                          >
                            {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {passwordStatus && (
                    <div className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
                      passwordStatus.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                      {passwordStatus.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      )}
                      <span>{passwordStatus.text}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
                    <button
                      type="submit"
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md cursor-pointer transition-all"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>পরিবর্তন সংরক্ষণ করুন / Save Changes</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetCredentials}
                      className="text-xs text-slate-400 hover:text-red-400 hover:underline cursor-pointer"
                    >
                      ডিফল্ট রিসেট (admin / admin)
                    </button>
                  </div>
                </form>

                {/* Session Logout card */}
                <div className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${
                  darkMode ? 'bg-red-950/20 border-red-500/20' : 'bg-red-50/80 border-red-200'
                }`}>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-red-400">অ্যাডমিন সেশন লগআউট</h4>
                    <p className="text-xs text-slate-400">বর্তমান ব্রাউজার সেশন থেকে বের হয়ে এডমিন প্যানেল সুরক্ষিত করুন।</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogoutAction}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-sm cursor-pointer shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>লগআউট করুন</span>
                  </button>
                </div>

              </div>
            )}

            {/* MEDIA LIBRARY & ASSETS TAB */}
            {activeTab === 'media' && (
              <MediaLibraryTab 
                portfolioData={formData} 
                darkMode={darkMode} 
              />
            )}

            {/* 12. MESSAGES INBOX TAB */}
            {activeTab === 'messages' && (
              <MessagesInboxTab darkMode={darkMode} />
            )}

            {/* ANALYTICS INTELLIGENCE TAB */}
            {activeTab === 'analytics' && (
              <AnalyticsDashboardTab darkMode={darkMode} />
            )}

            {/* PROJECTS & CASE STUDIES TAB */}
            {activeTab === 'projects' && (
              <AdminProjectsTab
                projects={formData.projects || []}
                onChange={(newProjects) => {
                  const updated = { ...formData, projects: newProjects };
                  setFormData(updated);
                  CmsService.saveData(updated);
                  onSave(updated);
                }}
                darkMode={darkMode}
              />
            )}

            {/* BLOGS & ARTICLES TAB */}
            {activeTab === 'blogs' && (
              <AdminBlogsTab
                blogs={formData.blogs || []}
                onChange={(newBlogs) => {
                  const updated = { ...formData, blogs: newBlogs };
                  setFormData(updated);
                  CmsService.saveData(updated);
                  onSave(updated);
                }}
                darkMode={darkMode}
              />
            )}

            {/* Sticky Bottom Save Action Bar */}
            <div className={`sticky bottom-0 mt-8 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-4 border-t flex flex-wrap items-center justify-between gap-3 backdrop-blur-md z-20 ${
              darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                {saveStatus ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 animate-pulse">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{saveStatus}</span>
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">
                    💡 পরিবর্তন করার পর &quot;Save &amp; Publish&quot; বাটনে চাপুন।
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-all shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/40"
                >
                  <Save className="w-4 h-4" />
                  <span>Save &amp; Publish / সংরক্ষণ করুন</span>
                </button>
              </div>
            </div>

          </main>
        </div>

      </div>
    </div>
  );
};
