import React, { useEffect } from 'react';
import { PortfolioData } from '../types/portfolio';
import { 
  updateHtmlHeadMetadata, 
  generatePersonSchema, 
  generateWebSiteSchema, 
  generateBreadcrumbSchema,
  getBaseUrl 
} from '../utils/seoUtils';

export interface SeoHeadProps {
  data: PortfolioData;
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalPath?: string;
  type?: 'website' | 'article' | 'profile';
  breadcrumbs?: Array<{ name: string; url: string }>;
  customSchema?: object | object[];
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  data,
  title,
  description,
  keywords,
  ogImage,
  canonicalPath = '',
  type = 'website',
  breadcrumbs,
  customSchema,
}) => {
  useEffect(() => {
    if (!data) return;

    const baseUrl = getBaseUrl(data);
    const fullCanonicalUrl = canonicalPath 
      ? `${baseUrl}${canonicalPath.startsWith('/') ? '' : '/'}${canonicalPath}`
      : baseUrl;

    // Fallback title formatting: [Page Title] | [Full Name] - [Designation]
    const finalTitle = title 
      ? (title.includes(data.personal.fullName) ? title : `${title} | ${data.personal.fullName} - ${data.personal.designation}`)
      : (data.seo.metaTitle || `${data.personal.fullName} | ${data.personal.designation} Portfolio`);

    const finalDescription = description || data.seo.metaDescription || data.personal.shortBio || data.personal.tagline;
    const finalKeywords = keywords && keywords.length > 0 ? keywords : (data.seo.keywords || []);
    const finalOgImage = ogImage || data.seo.ogImageUrl || data.personal.avatarUrl;

    // Structured JSON-LD Data aggregation
    const schemaList: object[] = [];

    if (data.seo.structuredDataEnabled !== false) {
      // 1. Person Schema
      schemaList.push(generatePersonSchema(data, baseUrl));
      // 2. WebSite Schema
      schemaList.push(generateWebSiteSchema(data, baseUrl));

      // 3. Breadcrumbs Schema
      if (breadcrumbs && breadcrumbs.length > 0) {
        schemaList.push(generateBreadcrumbSchema(breadcrumbs));
      }

      // 4. Custom Page/Project/Article Schema
      if (customSchema) {
        if (Array.isArray(customSchema)) {
          schemaList.push(...customSchema);
        } else {
          schemaList.push(customSchema);
        }
      }
    }

    // Apply to Head
    updateHtmlHeadMetadata({
      title: finalTitle,
      description: finalDescription,
      keywords: finalKeywords,
      author: data.seo.author || data.personal.fullName,
      ogImage: finalOgImage,
      canonicalUrl: fullCanonicalUrl,
      twitterHandle: data.seo.twitterHandle,
      type,
      indexFollow: data.seo.indexFollow !== false,
      googleSiteVerification: data.seo.googleSiteVerification,
      googleAnalyticsId: data.seo.googleAnalyticsId,
      structuredData: schemaList,
    });
  }, [
    data, 
    title, 
    description, 
    keywords, 
    ogImage, 
    canonicalPath, 
    type, 
    breadcrumbs, 
    customSchema
  ]);

  return null;
};
