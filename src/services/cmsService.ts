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
            about: {
              ...initialPortfolioData.about,
              ...(parsed.about || {}),
              highlights: Array.isArray(parsed.about?.highlights) ? parsed.about.highlights : (initialPortfolioData.about.highlights || []),
              corePillars: Array.isArray(parsed.about?.corePillars) ? parsed.about.corePillars : (initialPortfolioData.about.corePillars || []),
            },
            contact: { ...initialPortfolioData.contact, ...(parsed.contact || {}) },
            seo: { ...initialPortfolioData.seo, ...(parsed.seo || {}) },
            siteSettings: { ...initialPortfolioData.siteSettings, ...(parsed.siteSettings || {}) },
            cmsConfig: { ...initialPortfolioData.cmsConfig, ...(parsed.cmsConfig || {}) },
            projects: Array.isArray(parsed.projects) ? parsed.projects : [],
            blogs: Array.isArray(parsed.blogs) ? parsed.blogs : [],
            gallery: Array.isArray(parsed.gallery) ? parsed.gallery : [],
            experiences: Array.isArray(parsed.experiences) ? parsed.experiences : [],
            education: Array.isArray(parsed.education) ? parsed.education : [],
            certificates: Array.isArray(parsed.certificates) ? parsed.certificates : [],
            skills: Array.isArray(parsed.skills) ? parsed.skills : [],
            socials: Array.isArray(parsed.socials) ? parsed.socials : [],
            mediaLibrary: Array.isArray(parsed.mediaLibrary) ? parsed.mediaLibrary : [],
            mediaFolders: Array.isArray(parsed.mediaFolders) ? parsed.mediaFolders : [],
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
      const nowIso = new Date().toISOString();

      const updated: PortfolioData = {
        ...data,
        siteSettings: {
          ...data.siteSettings,
          adminUsername: currentStoredUser || data.siteSettings.adminUsername,
          adminPassword: currentStoredPass || data.siteSettings.adminPassword,
        },
        cmsConfig: {
          ...data.cmsConfig,
          lastSynced: nowIso,
        },
        // Explicitly preserve clean arrays even if emptied by the user
        projects: Array.isArray(data.projects) ? data.projects : [],
        blogs: Array.isArray(data.blogs) ? data.blogs : [],
        gallery: Array.isArray(data.gallery) ? data.gallery : [],
        experiences: Array.isArray(data.experiences) ? data.experiences : [],
        education: Array.isArray(data.education) ? data.education : [],
        certificates: Array.isArray(data.certificates) ? data.certificates : [],
        skills: Array.isArray(data.skills) ? data.skills : [],
        socials: Array.isArray(data.socials) ? data.socials : [],
        mediaLibrary: Array.isArray(data.mediaLibrary) ? data.mediaLibrary : [],
        mediaFolders: Array.isArray(data.mediaFolders) ? data.mediaFolders : [],
      };

      // লোকাল ক্যাশে সেভ (যাতে সাইট ফাস্ট থাকে এবং ডাটা লস না হয়)
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

  // ৩. ব্যাকগ্রাউন্ড সিঙ্ক (টাইমস্ট্যাম্প ভ্যালিডেশন সহ - যাতে লোকাল ডিলিট বা এডিট ওভাররাইট না হয়)
  private static async syncFromSupabase() {
    if (typeof window === 'undefined') return;
    try {
      if (!supabaseUrl || !supabaseAnonKey) return;
      const { data, error } = await supabase
        .from('portfolio_configs')
        .select('content')
        .eq('id', 1)
        .single();

      if (data && data.content && typeof data.content === 'object') {
        const storedStr = localStorage.getItem(STORAGE_KEY);
        let shouldOverwriteLocal = true;

        if (storedStr) {
          try {
            const localObj = JSON.parse(storedStr);
            const localTime = localObj.cmsConfig?.lastSynced ? new Date(localObj.cmsConfig.lastSynced).getTime() : 0;
            const cloudTime = data.content.cmsConfig?.lastSynced ? new Date(data.content.cmsConfig.lastSynced).getTime() : 0;

            // যদি লোকাল ডাটা ক্লাউডের চেয়ে নতুন হয় বা সমান হয়, তবে ক্লাউডের পুরনো ডাটা দিয়ে লোকাল ওভাররাইট করা যাবে না
            if (localTime > 0 && localTime >= cloudTime) {
              shouldOverwriteLocal = false;
              // ব্যাকগ্রাউন্ডে ক্লাউডকে আপডেট করে রাখা হচ্ছে যাতে ক্লাউডও আপ-টু-ডেট থাকে
              if (localTime > cloudTime) {
                supabase
                  .from('portfolio_configs')
                  .upsert({ id: 1, content: localObj })
                  .then(({ error }) => {
                    if (error) console.warn('Background Supabase sync error:', error);
                  });
              }
            }
          } catch (e) {
            // If local parse error, allow cloud recovery
          }
        }

        if (shouldOverwriteLocal) {
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
