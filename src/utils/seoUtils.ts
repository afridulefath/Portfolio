import { PortfolioData, BlogPost, ProjectItem } from '../types/portfolio';

export interface SeoMetadataOptions {
  title: string;
  description: string;
  keywords?: string[];
  author?: string;
  ogImage?: string;
  canonicalUrl?: string;
  twitterHandle?: string;
  type?: 'website' | 'article' | 'profile';
  indexFollow?: boolean;
  googleSiteVerification?: string;
  googleAnalyticsId?: string;
  structuredData?: object | object[];
}

/**
 * Clean & normalize base URL
 */
export function getBaseUrl(data?: PortfolioData, customUrl?: string): string {
  if (customUrl && customUrl.startsWith('http')) {
    return customUrl.replace(/\/+$/, '');
  }
  if (data?.seo?.canonicalUrl && data.seo.canonicalUrl.startsWith('http')) {
    return data.seo.canonicalUrl.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }
  return 'https://example.com';
}

/**
 * Generate standard compliant sitemap.xml covering all static and dynamic routes
 */
export function generateSitemapXml(data: PortfolioData, customBaseUrl?: string): string {
  const baseUrl = getBaseUrl(data, customBaseUrl);
  const now = new Date().toISOString().split('T')[0];

  const staticRoutes = [
    { path: '', priority: '1.0', changefreq: 'daily' },
    { path: '/about', priority: '0.9', changefreq: 'weekly' },
    { path: '/projects', priority: '0.95', changefreq: 'daily' },
    { path: '/blogs', priority: '0.95', changefreq: 'daily' },
    { path: '/experience', priority: '0.85', changefreq: 'monthly' },
    { path: '/education', priority: '0.8', changefreq: 'monthly' },
    { path: '/gallery', priority: '0.8', changefreq: 'weekly' },
    { path: '/contact', priority: '0.85', changefreq: 'monthly' },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  // Static Routes
  for (const route of staticRoutes) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${route.path}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Dynamic Project Routes
  if (Array.isArray(data.projects)) {
    for (const proj of data.projects) {
      if (proj.slug || proj.id) {
        const slug = proj.slug || proj.id;
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/project/${encodeURIComponent(slug)}</loc>\n`;
        xml += `    <lastmod>${now}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.9</priority>\n`;
        if (proj.thumbnailUrl) {
          xml += `    <image:image>\n`;
          xml += `      <image:loc>${escapeXml(proj.thumbnailUrl)}</image:loc>\n`;
          xml += `      <image:title>${escapeXml(proj.title)}</image:title>\n`;
          xml += `    </image:image>\n`;
        }
        xml += `  </url>\n`;
      }
    }
  }

  // Dynamic Blog Routes
  if (Array.isArray(data.blogs)) {
    for (const blog of data.blogs) {
      if (blog.status !== 'draft' && (blog.slug || blog.id)) {
        const slug = blog.slug || blog.id;
        const lastMod = blog.publishDate ? blog.publishDate.split('T')[0] : now;
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/blog/${encodeURIComponent(slug)}</loc>\n`;
        xml += `    <lastmod>${lastMod}</lastmod>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.85</priority>\n`;
        if (blog.coverImageUrl) {
          xml += `    <image:image>\n`;
          xml += `      <image:loc>${escapeXml(blog.coverImageUrl)}</image:loc>\n`;
          xml += `      <image:title>${escapeXml(blog.title)}</image:title>\n`;
          xml += `    </image:image>\n`;
        }
        xml += `  </url>\n`;
      }
    }
  }

  xml += `</urlset>`;
  return xml;
}

/**
 * Generate standard robots.txt
 */
export function generateRobotsTxt(data?: PortfolioData, customBaseUrl?: string): string {
  const baseUrl = getBaseUrl(data, customBaseUrl);
  return `# Googlebot and standard crawler directives
User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/
Disallow: /dist/

# Host & Sitemap location for Google Search Console
Host: ${baseUrl}
Sitemap: ${baseUrl}/sitemap.xml
`;
}

/**
 * Helper to escape XML special characters
 */
function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Schema.org: Person & ProfilePage Schema
 */
export function generatePersonSchema(data: PortfolioData, customBaseUrl?: string): object {
  const baseUrl = getBaseUrl(data, customBaseUrl);
  const socials = (data.socials || []).filter(s => s.enabled && s.url).map(s => s.url);
  const skills = (data.skills || []).map(s => s.name);
  const alumni = (data.education || []).map(e => ({
    '@type': 'EducationalOrganization',
    'name': e.institution,
  }));
  const worksFor = data.experiences && data.experiences.length > 0 ? {
    '@type': 'Organization',
    'name': data.experiences[0].company,
    'url': data.experiences[0].companyUrl || undefined
  } : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${baseUrl}/#person`,
    'name': data.personal.fullName,
    'jobTitle': data.personal.designation,
    'description': data.personal.shortBio || data.personal.tagline,
    'image': data.personal.avatarUrl,
    'url': baseUrl,
    'sameAs': socials,
    'knowsAbout': skills,
    'alumniOf': alumni.length > 0 ? alumni : undefined,
    'worksFor': worksFor,
    'address': data.personal.location ? {
      '@type': 'PostalAddress',
      'addressLocality': data.personal.location,
    } : undefined,
    'email': data.contact?.email ? `mailto:${data.contact.email}` : undefined,
    'telephone': data.contact?.phone || undefined,
  };
}

/**
 * Schema.org: WebSite Schema with SearchAction
 */
export function generateWebSiteSchema(data: PortfolioData, customBaseUrl?: string): object {
  const baseUrl = getBaseUrl(data, customBaseUrl);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    'url': baseUrl,
    'name': data.siteSettings.brandName || data.personal.fullName,
    'description': data.seo.metaDescription,
    'publisher': {
      '@id': `${baseUrl}/#person`
    },
    'inLanguage': data.seo.siteLanguage || 'en',
  };
}

/**
 * Schema.org: BlogPosting Schema
 */
export function generateBlogPostingSchema(blog: BlogPost, authorName: string, siteUrl: string): object {
  const blogUrl = `${siteUrl}/blog/${encodeURIComponent(blog.slug || blog.id)}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': blogUrl,
    },
    'headline': blog.title,
    'alternativeHeadline': blog.subtitle,
    'description': blog.summary || blog.seoDescription,
    'image': blog.coverImageUrl ? [blog.coverImageUrl] : undefined,
    'datePublished': blog.publishDate,
    'dateModified': blog.publishDate,
    'author': {
      '@type': 'Person',
      'name': blog.authorName || authorName,
      'jobTitle': blog.authorRole || undefined,
    },
    'publisher': {
      '@type': 'Person',
      'name': authorName,
    },
    'keywords': blog.tags?.join(', ') || undefined,
    'url': blogUrl,
  };
}

/**
 * Schema.org: SoftwareSourceCode / CreativeWork Schema for Projects
 */
export function generateProjectSchema(project: ProjectItem, authorName: string, siteUrl: string): object {
  const projectUrl = `${siteUrl}/project/${encodeURIComponent(project.slug || project.id)}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': project.title,
    'headline': project.subtitle,
    'description': project.summary || project.seoDescription,
    'image': project.thumbnailUrl ? [project.thumbnailUrl] : undefined,
    'applicationCategory': project.category,
    'operatingSystem': 'Web, Cloud, All',
    'author': {
      '@type': 'Person',
      'name': authorName,
    },
    'url': projectUrl,
    'codeRepository': project.githubUrl || undefined,
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
  };
}

/**
 * Schema.org: BreadcrumbList Schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url,
    })),
  };
}

/**
 * Helper to update/create meta tag
 */
function setMetaTag(nameOrProperty: string, value: string, isProperty: boolean = false) {
  if (typeof document === 'undefined') return;
  const attribute = isProperty ? 'property' : 'name';
  let meta = document.querySelector(`meta[${attribute}="${nameOrProperty}"]`) as HTMLMetaElement | null;
  
  if (!value) {
    if (meta) meta.remove();
    return;
  }

  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, nameOrProperty);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', value);
}

/**
 * Helper to update/create link tag (canonical)
 */
function setCanonicalLink(url: string) {
  if (typeof document === 'undefined') return;
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!url) {
    if (link) link.remove();
    return;
  }
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

/**
 * Inject or update Google Analytics tag
 */
export function injectGoogleAnalytics(gaId?: string) {
  if (typeof document === 'undefined' || !gaId || !gaId.startsWith('G-')) return;
  
  const scriptId = 'google-analytics-script';
  if (document.getElementById(scriptId)) return;

  // External gtag.js
  const scriptTag = document.createElement('script');
  scriptTag.id = scriptId;
  scriptTag.async = true;
  scriptTag.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(scriptTag);

  // Inline configuration
  const inlineScript = document.createElement('script');
  inlineScript.id = 'google-analytics-inline';
  inlineScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gaId}', { page_path: window.location.pathname });
  `;
  document.head.appendChild(inlineScript);
}

/**
 * Inject Google Search Console Verification Meta Tag
 */
export function injectGoogleSiteVerification(token?: string) {
  if (typeof document === 'undefined') return;
  setMetaTag('google-site-verification', token || '');
}

/**
 * Inject Schema.org JSON-LD structured data into <head>
 */
export function injectStructuredData(schemaData?: object | object[]) {
  if (typeof document === 'undefined') return;
  const scriptId = 'portfolio-schema-ld-json';
  let script = document.getElementById(scriptId) as HTMLScriptElement | null;

  if (!schemaData) {
    if (script) script.remove();
    return;
  }

  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(schemaData, null, 2);
}

/**
 * Update dynamic head metadata on client route changes
 */
export function updateHtmlHeadMetadata(options: SeoMetadataOptions) {
  if (typeof document === 'undefined') return;

  // 1. Document Title
  if (options.title) {
    document.title = options.title;
  }

  // 2. Standard Meta Tags
  setMetaTag('description', options.description);
  if (options.keywords && options.keywords.length > 0) {
    setMetaTag('keywords', options.keywords.join(', '));
  }
  if (options.author) {
    setMetaTag('author', options.author);
  }
  
  // Robots
  const robotsValue = options.indexFollow === false 
    ? 'noindex, nofollow' 
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  setMetaTag('robots', robotsValue);

  // Canonical Link
  if (options.canonicalUrl) {
    setCanonicalLink(options.canonicalUrl);
  }

  // 3. Open Graph Tags (Facebook, LinkedIn, Discord)
  setMetaTag('og:title', options.title, true);
  setMetaTag('og:description', options.description, true);
  setMetaTag('og:type', options.type || 'website', true);
  if (options.ogImage) {
    setMetaTag('og:image', options.ogImage, true);
  }
  if (options.canonicalUrl) {
    setMetaTag('og:url', options.canonicalUrl, true);
  }

  // 4. Twitter Card Tags
  setMetaTag('twitter:card', 'summary_large_image');
  setMetaTag('twitter:title', options.title);
  setMetaTag('twitter:description', options.description);
  if (options.ogImage) {
    setMetaTag('twitter:image', options.ogImage);
  }
  if (options.twitterHandle) {
    setMetaTag('twitter:site', options.twitterHandle);
    setMetaTag('twitter:creator', options.twitterHandle);
  }

  // 5. Google Site Verification
  if (options.googleSiteVerification) {
    injectGoogleSiteVerification(options.googleSiteVerification);
  }

  // 6. Google Analytics
  if (options.googleAnalyticsId) {
    injectGoogleAnalytics(options.googleAnalyticsId);
  }

  // 7. Structured Data (JSON-LD)
  if (options.structuredData) {
    injectStructuredData(options.structuredData);
  }
}

/**
 * Utility to trigger browser file download (e.g. sitemap.xml, robots.txt)
 */
export function downloadTextFile(filename: string, content: string, mimeType: string = 'text/plain') {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
