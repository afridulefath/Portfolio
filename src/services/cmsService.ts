import { createClient } from '@supabase/supabase-js';
import { PortfolioData } from '../types/portfolio';
import { initialPortfolioData } from '../data/defaultPortfolioData';

const STORAGE_KEY = 'DYNAMIC_PORTFOLIO_DATA_V1';

// Vercel Environment Variables থেকে Supabase কানেক্ট করা হচ্ছে
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class CmsService {
  // ১. ডাটা লোড করার মেথড (ক্লাউড থেকে ব্যাকগ্রাউন্ড সিঙ্ক সহ)
  public static getData(): PortfolioData {
    this.syncFromSupabase();

    if (typeof window === 'undefined') {
      return initialPortfolioData;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
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
        };
      }
    } catch (err) {
      console.error('Failed to parse portfolio data from storage:', err);
    }
    return initialPortfolioData;
  }

  // ২. ড্যাশবোর্ড থেকে "Save & Publish" চাপলে সরাসরি Supabase-এ সেভ হবে
  public static async saveData(data: PortfolioData): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const updated = {
        ...data,
        cmsConfig: {
          ...data.cmsConfig,
          lastSynced: new Date().toISOString(),
        },
      };

      // লোকাল ক্যাশে সেভ (যাতে সাইট ফাস্ট থাকে)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('portfolio_data_updated', { detail: updated }));

      // Supabase ক্লাউড ডাটাবেজে সম্পূর্ণ পোর্টফোলিও ডাটা পাঠানো হচ্ছে
      const { error } = await supabase
        .from('portfolio_configs')
        .upsert({ id: 1, content: updated });

      if (error) console.error('Supabase save error:', error.message);
    } catch (err) {
      console.error('Failed to save portfolio data to storage:', err);
    }
  }

  // ৩. ব্যাকগ্রাউন্ড সিঙ্ক (যাতে অন্য যেকোনো ডিভাইসে লেটেস্ট ডাটা শো করে)
  private static async syncFromSupabase() {
    if (typeof window === 'undefined') return;
    try {
      const { data, error } = await supabase
        .from('portfolio_configs')
        .select('content')
        .eq('id', 1)
        .single();

      if (data && data.content) {
        const cloudDataStr = JSON.stringify(data.content);
        if (localStorage.getItem(STORAGE_KEY) !== cloudDataStr) {
          localStorage.setItem(STORAGE_KEY, cloudDataStr);
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
}
