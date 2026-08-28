import { createClient } from '@supabase/supabase-js';
import { PortfolioData } from '../types/portfolio';
import { initialPortfolioData } from '../data/defaultPortfolioData';

const STORAGE_KEY = 'DYNAMIC_PORTFOLIO_DATA_V1';

// Vercel Environment Variables থেকে Supabase কানেক্ট করা হচ্ছে
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);

export class CmsService {
  // ১. ডাটা লোড করার মেথড (সুরক্ষিত ক্লাউড সিঙ্ক সহ)
  public static getData(): PortfolioData {
    if (typeof window !== 'undefined') {
      this.syncFromSupabase();
      
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return {
            ...initialPortfolioData,
            ...parsed,
            personal: { ...initialPortfolioData.personal, ...(parsed.personal || {}) },
            about: { ...initialPortfolioData.about, ...(parsed.about || {}) },
            contact: { ...initialPortfolioData.contact, ...(parsed.contact || {}) },
            seo: { ...initialPortfolioData.seo, ...(parsed.seo || {}) },
            siteSettings: { ...initialPortfolioData.siteSettings, ...(parsed.siteSettings || {}) },
            cmsConfig: { ...initialPortfolioData.cmsConfig, ...(parsed.cmsConfig || {}) },
            projects: Array.isArray(parsed.projects) ? parsed.projects : (initialPortfolioData.projects || []),
            blogs: Array.isArray(parsed.blogs) ? parsed.blogs : (initialPortfolioData.blogs || []),
            gallery: Array.isArray(parsed.gallery) ? parsed.gallery : initialPortfolioData.gallery,
            experiences: Array.isArray(parsed.experiences) ? parsed.experiences : initialPortfolioData.experiences,
            education: Array.isArray(parsed.education) ? parsed.education : initialPortfolioData.education,
            certificates: Array.isArray(parsed.certificates) ? parsed.certificates : initialPortfolioData.certificates,
            skills: Array.isArray(parsed.skills) ? parsed.skills : initialPortfolioData.skills,
            socials: Array.isArray(parsed.socials) ? parsed.socials : initialPortfolioData.socials,
            mediaLibrary: Array.isArray(parsed.mediaLibrary) ? parsed.mediaLibrary : (initialPortfolioData.mediaLibrary || []),
            mediaFolders: Array.isArray(parsed.mediaFolders) ? parsed.mediaFolders : (initialPortfolioData.mediaFolders || []),
          };
        } catch (e) {
          console.error('Failed to parse portfolio data from storage:', e);
        }
      }
    }
    return initialPortfolioData;
  }

  // ২. ড্যাশবোর্ড থেকে "Save & Publish" চাপলে সরাসরি Supabase-এ সেভ হবে
  public static async saveData(data: PortfolioData): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const currentStoredPass = localStorage.getItem('DYNAMIC_PORTFOLIO_ADMIN_PASSWORD_V1');
      const currentStoredUser = localStorage.getItem('DYNAMIC_PORTFOLIO_ADMIN_USERNAME_V1');

      const updated: PortfolioData = {
        ...data,
        siteSettings: {
          ...data.siteSettings,
          adminUsername: currentStoredUser || data.siteSettings.adminUsername,
          adminPassword: currentStoredPass || data.siteSettings.adminPassword,
        },
        cmsConfig: {
          ...data.cmsConfig,
          lastSynced: new Date().toISOString(),
        },
      };

      // লোকাল ক্যাশে সেভ (যাতে সাইট ফাস্ট থাকে)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('portfolio_data_updated', { detail: updated }));

      // Supabase ক্লাউড ডাটাবেজে সম্পূর্ণ পোর্টফোলিও ডাটা পাঠানো হচ্ছে
      if (supabaseUrl && supabaseAnonKey) {
        const { error } = await supabase
          .from('portfolio_configs')
          .upsert({ id: 1, content: updated });

        if (error) console.error('Supabase save error:', error.message);
      }
    } catch (err) {
      console.error('Failed to save portfolio data to storage:', err);
    }
  }

  // ৩. ব্যাকগ্রাউন্ড সিঙ্ক (সুরক্ষিত মেকানিজম - যাতে ডেমো ডাটা দিয়ে ওভাররাইট না হয়)
  private static async syncFromSupabase() {
    if (typeof window === 'undefined') return;
    try {
      if (!supabaseUrl || !supabaseAnonKey) return;
      const { data, error } = await supabase
        .from('portfolio_configs')
        .select('content')
        .eq('id', 1)
        .single();

      // সুপাবেসে যদি আসল ডাটা থাকে এবং তা ডেমো ডাটা (Alex Vance) না হয়, তবেই লোকাল মেমোরি আপডেট করবে
      if (data && data.content && data.content.personal?.fullName !== "Alex Vance") {
        const cloudDataStr = JSON.stringify(data.content);
        if (localStorage.getItem(STORAGE_KEY) !== cloudDataStr) {
          localStorage.setItem(STORAGE_KEY, cloudDataStr);

          // Sync cloud credentials to local auth storage if present
          if (data.content.siteSettings?.adminPassword) {
            localStorage.setItem('DYNAMIC_PORTFOLIO_ADMIN_PASSWORD_V1', data.content.siteSettings.adminPassword);
          }
          if (data.content.siteSettings?.adminUsername) {
            localStorage.setItem('DYNAMIC_PORTFOLIO_ADMIN_USERNAME_V1', data.content.siteSettings.adminUsername);
          }

          window.dispatchEvent(new CustomEvent('portfolio_data_updated', { detail: data.content }));
        }
      }
    } catch (err) {
      console.warn('Supabase fetch failed, using offline data');
    }
  }

  public static resetToDefault(): PortfolioData {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('portfolio_data_updated', { detail: initialPortfolioData }));
    }
    return initialPortfolioData;
  }

  public static exportJson(): string {
    const data = this.getData();
    return JSON.stringify(data, null, 2);
  }

  public static importJson(jsonString: string): { success: boolean; data?: PortfolioData; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.personal || !parsed.personal.fullName) {
        return { success: false, error: 'Invalid schema: Missing required personal fields' };
      }
      this.saveData(parsed);
      return { success: true, data: parsed };
    } catch (err: any) {
      return { success: false, error: err.message || 'Invalid JSON format' };
    }
  }

  /**
   * Helper method for Sanity testing if configured
   */
  public static async fetchFromSanity(projectId: string, dataset: string = 'production'): Promise<{ success: boolean; data?: Partial<PortfolioData>; error?: string }> {
    try {
      const groqQuery = encodeURIComponent(`{
        "personal": *[_type == "personalInfo"][0],
        "about": *[_type == "aboutMe"][0],
        "experiences": *[_type == "experience"] | order(startDate desc),
        "education": *[_type == "education"] | order(startYear desc),
        "certificates": *[_type == "certificate"] | order(issueDate desc),
        "skills": *[_type == "skill"] | order(level desc),
        "gallery": *[_type == "galleryItem"] | order(_createdAt desc),
        "contact": *[_type == "contactInfo"][0],
        "socials": *[_type == "socialLink"] | order(_createdAt asc),
        "seo": *[_type == "seoSettings"][0],
        "siteSettings": *[_type == "siteSettings"][0]
      }`);

      const url = `https://${projectId}.api.sanity.io/v2023-08-01/data/query/${dataset}?query=${groqQuery}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Sanity API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (result.result) {
        return { success: true, data: result.result };
      }
      return { success: false, error: 'No data returned from Sanity query.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to connect to Sanity.io' };
    }
  }
}
