import { PortfolioData } from '../types/portfolio';
import { initialPortfolioData } from '../data/defaultPortfolioData';

const STORAGE_KEY = 'DYNAMIC_PORTFOLIO_DATA_V1';

export class CmsService {
  public static getData(): PortfolioData {
    if (typeof window === 'undefined') {
      return initialPortfolioData;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure all top-level keys exist by merging with default
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

  public static saveData(data: PortfolioData): void {
    if (typeof window === 'undefined') return;
    try {
      const updated = {
        ...data,
        cmsConfig: {
          ...data.cmsConfig,
          lastSynced: new Date().toISOString(),
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('portfolio_data_updated', { detail: updated }));
    } catch (err) {
      console.error('Failed to save portfolio data to storage:', err);
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
   * Fetch from live Sanity.io API if project ID is provided
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
