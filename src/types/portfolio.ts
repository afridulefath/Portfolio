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
}

export interface AboutInfo {
  biography: string;
  storySummary: string;
  philosophyTitle: string;
  philosophyDescription: string;
  corePillars: {
    title: string;
    description: string;
    icon: string;
  }[];
  highlights: string[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  employmentType: 'Full-time' | 'Contract' | 'Part-time' | 'Remote';
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  summary: string;
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
  category: 'Frontend' | 'Backend' | 'Cloud & DevOps' | 'Architecture & Design' | 'Management & Tools';
  featured?: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  category: 'Projects' | 'Speaking & Events' | 'Workspaces' | 'Awards & Life';
  imageUrl: string;
  aspectRatio?: 'landscape' | 'portrait' | 'square';
  date?: string;
  tags: string[];
}

export interface ContactInfo {
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
}

export interface CmsConfig {
  provider: 'local' | 'sanity';
  sanityProjectId?: string;
  sanityDataset?: string;
  sanityApiToken?: string;
  sanityUseCdn?: boolean;
  lastSynced?: string;
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
}
