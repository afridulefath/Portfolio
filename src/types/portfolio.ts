import { MediaFile, MediaFolder } from './media';
export * from './media';

export interface PersonalInfo {
  fullName: string;
  designation: string;
  tagline: string;
  shortBio: string;
  avatarUrl: string;
  location: string;
  availability: 'Available for Hire' | 'Open to Consulting' | 'Employed' | 'Freelance Available';
  yearsExperience: number;
  projectsCompleted: number;
  clientSatisfaction: number;
  resumeUrl: string;
  resumeFileName?: string;
  showResumeButton?: boolean;
  resumeButtonText?: string;
  heroCtaPrimaryText: string;
  heroCtaPrimaryLink: string;
  heroCtaSecondaryText: string;
  heroCtaSecondaryLink: string;
  email?: string;
  headline?: string;
  subHeadline?: string;
  bio?: string;
  availabilityStatus?: string;
  heroBadgeTitle?: string;
}

export interface CorePillarItem {
  title: string;
  description: string;
  icon: string;
}

export interface AboutInfo {
  title?: string;
  summary?: string;
  storyTitle?: string;
  storySummary: string;
  biography: string;
  philosophyTitle: string;
  philosophyDescription: string;
  corePillars: CorePillarItem[];
  highlights: string[];
  skillsTitle?: string;
  skillsSubtitle?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  position?: string;
  employmentType: 'Full-time' | 'Contract' | 'Part-time' | 'Remote';
  location: string;
  address?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  isCurrent?: boolean;
  summary: string;
  description?: string;
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
  companyUrl?: string;
  logoUrl?: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  grade?: string;
  description: string;
  honors?: string[];
  logoUrl?: string;
}

export interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  badgeUrl?: string;
}

export interface SkillItem {
  name: string;
  level: number; // 1 - 100
  category: string; // Dynamic category: 'Project Management', 'Communication & Leadership', 'Operations & Strategy', etc.
  featured?: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  category: 'Projects' | 'Speaking & Events' | 'Workspaces' | 'Awards & Life';
  imageUrl: string;
  imageAlt?: string;
  alt?: string;
  aspectRatio?: 'landscape' | 'portrait' | 'square';
  date?: string;
  tags: string[];
}

export interface ContactInfo {
  title?: string;
  subtitle?: string;
  email: string;
  phone: string;
  location: string;
  timezone: string;
  workingHours: string;
  calendlyUrl?: string;
  preferredContactMethod: 'Email' | 'Phone' | 'LinkedIn' | 'Calendly';
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  iconName: string;
  username: string;
  enabled: boolean;
}

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  author: string;
  ogImageUrl: string;
  twitterHandle: string;
  canonicalUrl: string;
  googleSiteVerification?: string;
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  siteLanguage?: string;
  indexFollow?: boolean;
  structuredDataEnabled?: boolean;
}

export interface SiteSettings {
  brandName: string;
  brandSubtitle?: string;
  brandLogoUrl?: string;
  themePreset: 'modern-slate' | 'deep-indigo' | 'warm-amber' | 'emerald-forest';
  enableDarkMode: boolean;
  footerText: string;
  enableConfetti: boolean;
  showAvailabilityBadge: boolean;
  loadingText?: string;
  adminUsername?: string;
  adminPassword?: string;
  navCustomLabels?: Record<string, string>; // e.g. { home: "হোম", about: "আমার সম্পর্কে", projects: "প্রজেক্টসমূহ", blogs: "ব্লগ ও আর্টিকেল", experience: "অভিজ্ঞতা", education: "শিক্ষা", gallery: "গ্যালারি", contact: "যোগাযোগ" }
  navLinksConfig?: Array<{
    id: string;
    key: string;
    defaultLabel: string;
    customLabel: string;
    path: string;
    enabled: boolean;
    order: number;
  }>;
}

export interface CmsConfig {
  provider: 'local' | 'sanity';
  sanityProjectId?: string;
  sanityDataset?: string;
  sanityApiToken?: string;
  sanityUseCdn?: boolean;
  lastSynced?: string;
}

// ==========================================
// 1. BLOG SYSTEM TYPES
// ==========================================
export interface BlogImage {
  id: string;
  url: string;
  caption?: string;
  order: number;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  summary: string;
  content: string; // Rich markdown or HTML content
  coverImageUrl: string;
  coverImageAlt?: string;
  galleryImages?: BlogImage[];
  category: string;
  tags: string[];
  authorName: string;
  authorAvatarUrl?: string;
  authorRole?: string;
  publishDate: string;
  scheduledDate?: string;
  status: 'published' | 'draft' | 'scheduled';
  featured: boolean;
  views: number;
  readTimeMinutes: number;
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  canonicalUrl?: string;
  ogImageUrl?: string;
}

// ==========================================
// 2. PROJECT SHOWCASE SYSTEM TYPES
// ==========================================
export interface ProjectTechnology {
  name: string;
  category?: string; // Frontend, Backend, Database, Cloud, Tool, etc.
  iconName?: string;
}

export interface ProjectClientInfo {
  name: string;
  company: string;
  industry?: string;
  country?: string;
  website?: string;
}

export interface ProjectGalleryItem {
  id: string;
  url: string;
  caption?: string;
  type: 'image' | 'video' | 'youtube' | 'before_after';
  beforeImageUrl?: string;
  afterImageUrl?: string;
  videoUrl?: string;
}

export interface ProjectMetric {
  label: string;
  value: string;
  description?: string;
}

export interface ProjectTestimonial {
  clientName: string;
  clientRole?: string;
  clientCompany?: string;
  clientPhotoUrl?: string;
  rating: number; // 1 - 5
  comment: string;
}

export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category: string; // e.g. Web Development, Project Management, Mobile App, UI/UX, Cloud Solution
  status: 'Completed' | 'In Progress' | 'Maintenance' | 'Planning';
  duration?: string; // e.g. "3 Months", "Jan 2024 - Apr 2024"
  completionDate?: string;
  featured: boolean;
  order?: number;
  views?: number;
  
  // Cover & Visuals
  thumbnailUrl: string;
  thumbnailAlt?: string;
  bannerUrl?: string;
  bannerAlt?: string;
  gallery: ProjectGalleryItem[];
  
  // Client
  client: ProjectClientInfo;
  
  // Role
  myRole: string; // e.g. "Project Manager", "Full Stack Developer", "Lead Architect", "UI/UX Designer"
  roleResponsibilities?: string[];
  
  // Overview
  summary: string;
  objectives?: string[];
  challenges?: string[];
  solutions?: string[];
  outcomes?: string[];
  keyAchievements?: string[];
  
  // Tech Stack
  technologies: ProjectTechnology[];
  
  // Links
  liveUrl?: string;
  demoUrl?: string;
  githubUrl?: string;
  caseStudyUrl?: string;
  
  // Metrics & Stats
  metrics?: ProjectMetric[];
  
  // Testimonial
  testimonial?: ProjectTestimonial;
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  ogImageUrl?: string;
}

// ==========================================
// 3. VISITOR ANALYTICS TYPES
// ==========================================
export interface PageViewEvent {
  id: string;
  path: string;
  title: string;
  timestamp: string;
  sessionId: string;
  referrer: string;
  source: 'Google' | 'Facebook' | 'LinkedIn' | 'Twitter' | 'Direct' | 'Referral';
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  browser: string;
  os: string;
  country: string;
  countryCode: string;
  city: string;
  durationSeconds?: number;
  projectId?: string;
  blogSlug?: string;
}

export interface AnalyticsSummary {
  totalVisitors: number;
  uniqueVisitors: number;
  todayVisitors: number;
  weeklyVisitors: number;
  monthlyVisitors: number;
  returningVisitors: number;
  totalPageViews: number;
  avgSessionDuration: number; // in seconds
  topPages: { path: string; title: string; views: number }[];
  topProjects: { id: string; title: string; views: number }[];
  topBlogs: { slug: string; title: string; views: number }[];
  sources: { name: string; count: number; percentage: number }[];
  devices: { name: string; count: number; percentage: number }[];
  browsers: { name: string; count: number; percentage: number }[];
  countries: { name: string; code: string; count: number; flag?: string }[];
  cities: { name: string; country: string; count: number }[];
  dailyViews: { date: string; visitors: number; pageViews: number }[];
  weeklyViews: { week: string; visitors: number; pageViews: number }[];
  monthlyViews: { month: string; visitors: number; pageViews: number }[];
}

export interface SectionHeaderConfig {
  badge?: string;
  title?: string;
  subtitle?: string;
}

export interface EducationSectionHeaderConfig extends SectionHeaderConfig {
  degreesTitle?: string;
  degreesSubtitle?: string;
  educationSubtitle?: string;
  certificationsTitle?: string;
  certificationsSubtitle?: string;
}

export interface PageHeadersConfig {
  experience?: SectionHeaderConfig;
  education?: EducationSectionHeaderConfig;
  blogs?: SectionHeaderConfig;
  projects?: SectionHeaderConfig;
  gallery?: SectionHeaderConfig;
  about?: SectionHeaderConfig;
  contact?: SectionHeaderConfig;
}

export interface PortfolioData {
  personal: PersonalInfo;
  about: AboutInfo;
  experiences: ExperienceItem[];
  education: EducationItem[];
  certificates: CertificateItem[];
  skills: SkillItem[];
  gallery: GalleryItem[];
  contact: ContactInfo;
  socials: SocialLink[];
  seo: SeoSettings;
  siteSettings: SiteSettings;
  cmsConfig: CmsConfig;
  blogs?: BlogPost[];
  projects?: ProjectItem[];
  mediaLibrary?: MediaFile[];
  mediaFolders?: MediaFolder[];
  pageHeaders?: PageHeadersConfig;
}
