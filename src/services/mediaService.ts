import { MediaFile, MediaFolder, MediaStats, MediaFilterOptions, MediaUsage, MediaType } from '../types/media';
import { PortfolioData } from '../types/portfolio';

const MEDIA_STORAGE_KEY = 'PORTFOLIO_MEDIA_LIBRARY_V2';
const FOLDERS_STORAGE_KEY = 'PORTFOLIO_MEDIA_FOLDERS_V2';

export const DEFAULT_MEDIA_FOLDERS: MediaFolder[] = [
  { id: 'all', name: 'All Media', slug: 'all', icon: 'FolderOpen', isSystem: true, color: 'indigo', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'hero', name: 'Hero & Avatars', slug: 'hero', icon: 'User', isSystem: false, color: 'sky', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'projects', name: 'Project Screenshots', slug: 'projects', icon: 'Briefcase', isSystem: false, color: 'emerald', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'blog', name: 'Blog Images', slug: 'blog', icon: 'BookOpen', isSystem: false, color: 'amber', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'certificates', name: 'Certificates', slug: 'certificates', icon: 'Award', isSystem: false, color: 'purple', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'resume', name: 'Resume & Documents', slug: 'resume', icon: 'FileText', isSystem: false, color: 'rose', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'seo', name: 'SEO & Social Cards', slug: 'seo', icon: 'Globe', isSystem: false, color: 'teal', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'logos', name: 'Brand & Client Logos', slug: 'logos', icon: 'Building', isSystem: false, color: 'orange', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'general', name: 'General Media', slug: 'general', icon: 'Folder', isSystem: false, color: 'slate', createdAt: '2026-01-01T00:00:00.000Z' },
];

export class MediaService {
  /**
   * Get all media folders
   */
  public static getFolders(): MediaFolder[] {
    if (typeof window === 'undefined') return DEFAULT_MEDIA_FOLDERS;
    try {
      const stored = localStorage.getItem(FOLDERS_STORAGE_KEY);
      if (stored) {
        const parsed: MediaFolder[] = JSON.parse(stored);
        // Ensure default system folders exist
        const hasAll = parsed.some(f => f.id === 'all');
        if (!hasAll) {
          parsed.unshift(DEFAULT_MEDIA_FOLDERS[0]);
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse media folders:', e);
    }
    return DEFAULT_MEDIA_FOLDERS;
  }

  /**
   * Save media folders
   */
  public static saveFolders(folders: MediaFolder[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
      window.dispatchEvent(new CustomEvent('portfolio_media_updated'));
    } catch (e) {
      console.error('Failed to save media folders:', e);
    }
  }

  /**
   * Add a new folder
   */
  public static addFolder(name: string, color: string = 'indigo'): MediaFolder {
    const folders = this.getFolders();
    const cleanName = name.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newFolder: MediaFolder = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: cleanName,
      slug,
      icon: 'Folder',
      isSystem: false,
      color,
      createdAt: new Date().toISOString(),
    };
    folders.push(newFolder);
    this.saveFolders(folders);
    return newFolder;
  }

  /**
   * Rename or update a folder
   */
  public static updateFolder(id: string, updates: Partial<MediaFolder>): boolean {
    const folders = this.getFolders();
    const index = folders.findIndex(f => f.id === id);
    if (index === -1 || folders[index].isSystem) return false;
    folders[index] = { ...folders[index], ...updates };
    this.saveFolders(folders);
    return true;
  }

  /**
   * Delete a folder and optionally reassign its files
   */
  public static deleteFolder(id: string, moveToFolderId: string = 'general'): boolean {
    const folders = this.getFolders();
    const target = folders.find(f => f.id === id);
    if (!target || target.isSystem) return false;

    // Remove folder
    const filtered = folders.filter(f => f.id !== id);
    this.saveFolders(filtered);

    // Reassign files
    const files = this.getAllFiles();
    let updated = false;
    const newFiles = files.map(file => {
      if (file.folderId === id) {
        updated = true;
        return { ...file, folderId: moveToFolderId };
      }
      return file;
    });

    if (updated) {
      this.saveFiles(newFiles);
    }
    return true;
  }

  /**
   * Get all raw files from storage
   */
  public static getAllFiles(): MediaFile[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(MEDIA_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse media files:', e);
    }
    return [];
  }

  /**
   * Save all files to storage
   */
  public static saveFiles(files: MediaFile[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(files));
      window.dispatchEvent(new CustomEvent('portfolio_media_updated'));
    } catch (e) {
      console.error('Failed to save media files:', e);
    }
  }

  /**
   * Scan usage across the entire portfolio data for a given URL or File ID
   */
  public static scanUsagesForUrl(url: string, data?: PortfolioData): MediaUsage[] {
    if (!url || !data) return [];
    const usages: MediaUsage[] = [];
    const target = url.trim();

    // 1. Personal & Hero
    if (data.personal) {
      if (data.personal.avatarUrl === target) {
        usages.push({ location: 'Home / Hero', field: 'avatarUrl', label: 'Hero Profile Avatar', link: '/' });
      }
      if (data.personal.resumeUrl === target) {
        usages.push({ location: 'Home / Hero', field: 'resumeUrl', label: 'Download Resume Document', link: '/' });
      }
    }

    // 2. About Info
    if (data.about) {
      if (data.about.corePillars) {
        data.about.corePillars.forEach((p, idx) => {
          if (p.icon === target) {
            usages.push({ location: 'About Me', field: `corePillar[${idx}]`, label: `Guiding Principle #${idx + 1}: ${p.title}`, link: '/about' });
          }
        });
      }
    }

    // 3. Experience Logos
    if (Array.isArray(data.experiences)) {
      data.experiences.forEach((exp) => {
        if (exp.logoUrl === target) {
          usages.push({ location: 'Experience', field: 'logoUrl', label: `Company Logo: ${exp.company}`, link: '/experience' });
        }
      });
    }

    // 4. Education Logos
    if (Array.isArray(data.education)) {
      data.education.forEach((edu) => {
        if (edu.logoUrl === target) {
          usages.push({ location: 'Education', field: 'logoUrl', label: `Institution Logo: ${edu.institution}`, link: '/education' });
        }
      });
    }

    // 5. Certificates
    if (Array.isArray(data.certificates)) {
      data.certificates.forEach((cert) => {
        if (cert.badgeUrl === target || cert.credentialUrl === target) {
          usages.push({ location: 'Certificates', field: 'badgeUrl', label: `Certificate Badge: ${cert.title}`, link: '/education' });
        }
      });
    }

    // 6. Gallery Photos
    if (Array.isArray(data.gallery)) {
      data.gallery.forEach((g) => {
        if (g.imageUrl === target) {
          usages.push({ location: 'Gallery', field: 'imageUrl', label: `Photo: ${g.title}`, link: '/gallery' });
        }
      });
    }

    // 7. Projects
    if (Array.isArray(data.projects)) {
      data.projects.forEach((proj) => {
        if (proj.thumbnailUrl === target) {
          usages.push({ location: 'Projects', field: 'thumbnailUrl', label: `Cover: ${proj.title}`, link: `/project/${proj.slug || proj.id}` });
        }
        if (proj.bannerUrl === target) {
          usages.push({ location: 'Projects', field: 'bannerUrl', label: `Banner: ${proj.title}`, link: `/project/${proj.slug || proj.id}` });
        }
        if (proj.gallery && Array.isArray(proj.gallery)) {
          proj.gallery.forEach((item, idx) => {
            if (item.url === target || item.beforeImageUrl === target || item.afterImageUrl === target || item.videoUrl === target) {
              usages.push({ location: 'Projects', field: `gallery[${idx}]`, label: `Project Gallery Item: ${proj.title}`, link: `/project/${proj.slug || proj.id}` });
            }
          });
        }
        if (proj.testimonial?.clientPhotoUrl === target) {
          usages.push({ location: 'Projects', field: 'testimonial.photo', label: `Client Testimonial: ${proj.title}`, link: `/project/${proj.slug || proj.id}` });
        }
      });
    }

    // 8. Blogs
    if (Array.isArray(data.blogs)) {
      data.blogs.forEach((b) => {
        if (b.coverImageUrl === target) {
          usages.push({ location: 'Blogs', field: 'coverImageUrl', label: `Blog Cover: ${b.title}`, link: `/blog/${b.slug || b.id}` });
        }
        if (b.galleryImages && Array.isArray(b.galleryImages)) {
          b.galleryImages.forEach((img, idx) => {
            if (img.url === target) {
              usages.push({ location: 'Blogs', field: `gallery[${idx}]`, label: `Blog Diagram #${idx + 1}: ${b.title}`, link: `/blog/${b.slug || b.id}` });
            }
          });
        }
        if (b.content && typeof b.content === 'string' && b.content.includes(target)) {
          usages.push({ location: 'Blogs', field: 'content', label: `Inline in Content: ${b.title}`, link: `/blog/${b.slug || b.id}` });
        }
      });
    }

    // 9. SEO & Social
    if (data.seo && data.seo.ogImageUrl === target) {
      usages.push({ location: 'SEO Settings', field: 'ogImageUrl', label: 'Open Graph Social Share Card', link: '/' });
    }

    // 10. Site Settings & Brand
    if (data.siteSettings && data.siteSettings.brandLogoUrl === target) {
      usages.push({ location: 'Site Settings', field: 'brandLogoUrl', label: 'Website Main Brand Logo', link: '/' });
    }

    return usages;
  }

  /**
   * Sync existing portfolio data into Media Library so no existing images are lost
   */
  public static seedInitialMediaFromPortfolio(data: PortfolioData): void {
    if (!data) return;
    const existingFiles = this.getAllFiles();
    const existingUrls = new Set(existingFiles.map(f => f.url.trim()));
    const newFiles: MediaFile[] = [...existingFiles];

    const addIfNew = (url: string, name: string, folderId: string, fileType: MediaType = 'image') => {
      if (!url || typeof url !== 'string' || !url.trim() || existingUrls.has(url.trim())) return;
      existingUrls.add(url.trim());

      const ext = url.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';
      let mime = 'image/jpeg';
      if (ext === 'png') mime = 'image/png';
      else if (ext === 'webp') mime = 'image/webp';
      else if (ext === 'svg') mime = 'image/svg+xml';
      else if (ext === 'gif') mime = 'image/gif';
      else if (ext === 'pdf') mime = 'application/pdf';

      newFiles.push({
        id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        name,
        originalName: name,
        url: url.trim(),
        fileType: ext === 'pdf' ? 'pdf' : fileType,
        mimeType: mime,
        sizeBytes: 150 * 1024, // approx placeholder
        folderId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        altText: name,
        caption: name,
        lazyLoad: true,
      });
    };

    // Hero Avatar
    if (data.personal?.avatarUrl) {
      addIfNew(data.personal.avatarUrl, `${data.personal.fullName || 'Profile'} Avatar`, 'hero');
    }
    // Resume
    if (data.personal?.resumeUrl) {
      addIfNew(data.personal.resumeUrl, `${data.personal.fullName || 'User'} Resume Document`, 'resume', 'pdf');
    }
    // Brand Logo
    if (data.siteSettings?.brandLogoUrl) {
      addIfNew(data.siteSettings.brandLogoUrl, 'Main Brand Logo', 'logos');
    }
    // SEO OG Image
    if (data.seo?.ogImageUrl) {
      addIfNew(data.seo.ogImageUrl, 'SEO Social Share Banner', 'seo');
    }
    // Experience Logos
    data.experiences?.forEach((exp) => {
      if (exp.logoUrl) addIfNew(exp.logoUrl, `${exp.company} Logo`, 'logos');
    });
    // Education Logos
    data.education?.forEach((edu) => {
      if (edu.logoUrl) addIfNew(edu.logoUrl, `${edu.institution} Logo`, 'logos');
    });
    // Certificates
    data.certificates?.forEach((cert) => {
      if (cert.badgeUrl) addIfNew(cert.badgeUrl, `${cert.title} Badge`, 'certificates');
      if (cert.credentialUrl && (cert.credentialUrl.endsWith('.pdf') || cert.credentialUrl.startsWith('data:application/pdf'))) {
        addIfNew(cert.credentialUrl, `${cert.title} PDF Document`, 'certificates', 'pdf');
      }
    });
    // Gallery
    data.gallery?.forEach((g) => {
      if (g.imageUrl) addIfNew(g.imageUrl, g.title || 'Gallery Image', 'general');
    });
    // Projects
    data.projects?.forEach((p) => {
      if (p.thumbnailUrl) addIfNew(p.thumbnailUrl, `${p.title} Cover`, 'projects');
      if (p.bannerUrl) addIfNew(p.bannerUrl, `${p.title} Banner`, 'projects');
      p.gallery?.forEach((g, i) => {
        if (g.url) addIfNew(g.url, `${p.title} Showcase #${i + 1}`, 'projects', g.type === 'video' ? 'video' : 'image');
      });
    });
    // Blogs
    data.blogs?.forEach((b) => {
      if (b.coverImageUrl) addIfNew(b.coverImageUrl, `${b.title} Cover`, 'blog');
      b.galleryImages?.forEach((img, i) => {
        if (img.url) addIfNew(img.url, `${b.title} Diagram #${i + 1}`, 'blog');
      });
    });

    if (newFiles.length > existingFiles.length) {
      this.saveFiles(newFiles);
    }
  }

  /**
   * Query & filter files with live usage scan
   */
  public static getFiles(filter?: Partial<MediaFilterOptions>, portfolioData?: PortfolioData): MediaFile[] {
    let files = this.getAllFiles();

    // Auto seed if empty and portfolioData provided
    if (files.length === 0 && portfolioData) {
      this.seedInitialMediaFromPortfolio(portfolioData);
      files = this.getAllFiles();
    }

    // Attach usages
    if (portfolioData) {
      files = files.map(file => ({
        ...file,
        usages: this.scanUsagesForUrl(file.url, portfolioData),
      }));
    }

    if (!filter) return files;

    // Filter by Folder
    if (filter.selectedFolderId && filter.selectedFolderId !== 'all') {
      files = files.filter(f => f.folderId === filter.selectedFolderId);
    }

    // Filter by Type
    if (filter.typeFilter && filter.typeFilter !== 'all') {
      if (filter.typeFilter === 'image') {
        files = files.filter(f => f.fileType === 'image');
      } else if (filter.typeFilter === 'document') {
        files = files.filter(f => f.fileType === 'document' || f.fileType === 'pdf');
      } else if (filter.typeFilter === 'video') {
        files = files.filter(f => f.fileType === 'video');
      } else if (filter.typeFilter === 'pdf') {
        files = files.filter(f => f.fileType === 'pdf' || f.mimeType.includes('pdf'));
      }
    }

    // Search Query
    if (filter.searchQuery && filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase().trim();
      files = files.filter(f => 
        f.name.toLowerCase().includes(q) ||
        (f.altText && f.altText.toLowerCase().includes(q)) ||
        (f.caption && f.caption.toLowerCase().includes(q)) ||
        (f.tags && f.tags.some(t => t.toLowerCase().includes(q))) ||
        (f.originalName && f.originalName.toLowerCase().includes(q)) ||
        f.mimeType.toLowerCase().includes(q)
      );
    }

    // Sort By
    if (filter.sortBy) {
      switch (filter.sortBy) {
        case 'date_desc':
          files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'date_asc':
          files.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case 'name_asc':
          files.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name_desc':
          files.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'size_desc':
          files.sort((a, b) => (b.sizeBytes || 0) - (a.sizeBytes || 0));
          break;
        case 'size_asc':
          files.sort((a, b) => (a.sizeBytes || 0) - (b.sizeBytes || 0));
          break;
      }
    } else {
      // Default: newest first
      files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return files;
  }

  /**
   * Add / Upload a new file with optional auto-compression and dimensions extraction
   */
  public static async uploadFile(
    file: File, 
    folderId: string = 'general',
    metadata?: Partial<MediaFile>,
    options?: { autoCompress?: boolean; convertToWebP?: boolean; maxWidth?: number }
  ): Promise<MediaFile> {
    // 1. File Type and Size Validation
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.webm');
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isDoc = file.name.endsWith('.doc') || file.name.endsWith('.docx') || file.type.includes('word') || file.type.includes('officedocument');

    let fileType: MediaType = 'other';
    if (isImage) fileType = 'image';
    else if (isVideo) fileType = 'video';
    else if (isPdf) fileType = 'pdf';
    else if (isDoc) fileType = 'document';

    // Disallow dangerous files (.exe, .bat, .sh, .php, etc.)
    const forbiddenExts = ['.exe', '.bat', '.cmd', '.sh', '.bin', '.dll', '.scr', '.vbs', '.php', '.phtml', '.cgi'];
    const fileNameLower = file.name.toLowerCase();
    if (forbiddenExts.some(ext => fileNameLower.endsWith(ext))) {
      throw new Error('Security Error: Executable or script files are strictly blocked for security.');
    }

    // Size limit check (25MB max)
    if (file.size > 25 * 1024 * 1024) {
      throw new Error('File exceeds maximum allowable size (25 MB). Please select a smaller file.');
    }

    let finalDataUrl = '';
    let width: number | undefined;
    let height: number | undefined;
    let finalSizeBytes = file.size;

    if (isImage) {
      // Process image with Canvas compression & WebP support
      const processed = await this.processImage(file, options);
      finalDataUrl = processed.dataUrl;
      width = processed.width;
      height = processed.height;
      finalSizeBytes = processed.sizeBytes;
    } else {
      // Read as base64 Data URL
      finalDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file from disk'));
        reader.readAsDataURL(file);
      });
    }

    // Clean file name
    const cleanOriginal = file.name.replace(/[^a-zA-Z0-9._\-\s]/g, '_');
    const cleanDisplayName = cleanOriginal.replace(/\.[^/.]+$/, "");

    const newMediaFile: MediaFile = {
      id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
      name: metadata?.name || cleanDisplayName,
      originalName: cleanOriginal,
      url: finalDataUrl,
      fileType,
      mimeType: file.type || (isPdf ? 'application/pdf' : 'application/octet-stream'),
      sizeBytes: finalSizeBytes,
      width,
      height,
      folderId: folderId || 'general',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      altText: metadata?.altText || cleanDisplayName,
      caption: metadata?.caption || '',
      seoDescription: metadata?.seoDescription || '',
      tags: metadata?.tags || [fileType],
      lazyLoad: true,
    };

    const files = this.getAllFiles();
    files.unshift(newMediaFile);
    this.saveFiles(files);

    return newMediaFile;
  }

  /**
   * Add external video (YouTube / MP4 URL)
   */
  public static addExternalVideo(url: string, title: string, folderId: string = 'projects'): MediaFile {
    let youtubeId: string | undefined;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match && match[1]) {
        youtubeId = match[1];
      }
    }

    const newMedia: MediaFile = {
      id: `media_video_${Date.now()}`,
      name: title || 'External Video Embed',
      originalName: title || 'External Video',
      url,
      fileType: 'video',
      mimeType: youtubeId ? 'video/youtube' : 'video/mp4',
      sizeBytes: 0,
      folderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isExternalVideo: true,
      youtubeId,
      altText: title,
      caption: title,
      tags: ['video', youtubeId ? 'youtube' : 'stream'],
    };

    const files = this.getAllFiles();
    files.unshift(newMedia);
    this.saveFiles(files);
    return newMedia;
  }

  /**
   * Update existing media file (Name, Alt Text, Caption, SEO, Folder)
   */
  public static updateFile(id: string, updates: Partial<MediaFile>): boolean {
    const files = this.getAllFiles();
    const idx = files.findIndex(f => f.id === id);
    if (idx === -1) return false;

    files[idx] = {
      ...files[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveFiles(files);
    return true;
  }

  /**
   * Delete single media file
   */
  public static deleteFile(id: string): boolean {
    const files = this.getAllFiles();
    const filtered = files.filter(f => f.id !== id);
    this.saveFiles(filtered);
    return true;
  }

  /**
   * Delete multiple media files
   */
  public static deleteMultipleFiles(ids: string[]): boolean {
    const idSet = new Set(ids);
    const files = this.getAllFiles();
    const filtered = files.filter(f => !idSet.has(f.id));
    this.saveFiles(filtered);
    return true;
  }

  /**
   * Move multiple files to target folder
   */
  public static moveFilesToFolder(fileIds: string[], targetFolderId: string): boolean {
    const idSet = new Set(fileIds);
    const files = this.getAllFiles();
    const updated = files.map(file => {
      if (idSet.has(file.id)) {
        return { ...file, folderId: targetFolderId, updatedAt: new Date().toISOString() };
      }
      return file;
    });
    this.saveFiles(updated);
    return true;
  }

  /**
   * Replace file data with a new uploaded file while preserving ID, URL references, and SEO tags
   */
  public static async replaceFile(id: string, newFile: File): Promise<MediaFile> {
    const files = this.getAllFiles();
    const idx = files.findIndex(f => f.id === id);
    if (idx === -1) throw new Error('File not found to replace');

    const existing = files[idx];
    const isImage = newFile.type.startsWith('image/');
    let finalUrl = '';
    let width: number | undefined;
    let height: number | undefined;
    let sizeBytes = newFile.size;

    if (isImage) {
      const proc = await this.processImage(newFile);
      finalUrl = proc.dataUrl;
      width = proc.width;
      height = proc.height;
      sizeBytes = proc.sizeBytes;
    } else {
      finalUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read replacement file'));
        reader.readAsDataURL(newFile);
      });
    }

    files[idx] = {
      ...existing,
      url: finalUrl,
      sizeBytes,
      width: width || existing.width,
      height: height || existing.height,
      mimeType: newFile.type || existing.mimeType,
      updatedAt: new Date().toISOString(),
    };

    this.saveFiles(files);
    return files[idx];
  }

  /**
   * Calculate stats for Media Library dashboard
   */
  public static getStats(): MediaStats {
    const files = this.getAllFiles();
    let totalImages = 0;
    let totalDocuments = 0;
    let totalVideos = 0;
    let totalPdfs = 0;
    let totalStorageBytes = 0;

    files.forEach(f => {
      totalStorageBytes += f.sizeBytes || 0;
      if (f.fileType === 'image') totalImages++;
      else if (f.fileType === 'video') totalVideos++;
      else if (f.fileType === 'pdf') totalPdfs++;
      else if (f.fileType === 'document') totalDocuments++;
    });

    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return '0 KB';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return {
      totalFiles: files.length,
      totalImages,
      totalDocuments: totalDocuments + totalPdfs,
      totalVideos,
      totalPdfs,
      totalStorageBytes,
      formattedStorage: formatBytes(totalStorageBytes),
    };
  }

  /**
   * Internal image processing & compression with WebP support
   */
  private static async processImage(
    file: File, 
    options?: { autoCompress?: boolean; convertToWebP?: boolean; maxWidth?: number; quality?: number }
  ): Promise<{ dataUrl: string; width: number; height: number; sizeBytes: number }> {
    return new Promise((resolve, reject) => {
      // If SVG, handle directly
      if (file.type === 'image/svg+xml') {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            dataUrl: e.target?.result as string,
            width: 800,
            height: 800,
            sizeBytes: file.size,
          });
        };
        reader.onerror = () => reject(new Error('Failed to read SVG file'));
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        const img = new Image();

        img.onload = () => {
          const maxWidth = options?.maxWidth || 1440;
          const maxHeight = 1440;
          let width = img.width;
          let height = img.height;

          // Aspect ratio scaling
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve({ dataUrl: src, width: img.width, height: img.height, sizeBytes: file.size });
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // WebP or high quality JPEG
          let outputType = 'image/jpeg';
          if (options?.convertToWebP || file.type === 'image/webp') {
            outputType = 'image/webp';
          } else if (file.type === 'image/png' && file.size < 500 * 1024) {
            outputType = 'image/png';
          }

          const quality = options?.quality !== undefined ? options.quality : 0.88;
          const compressedDataUrl = canvas.toDataURL(outputType, quality);
          
          // Approx size in bytes of base64
          const approxBytes = Math.round((compressedDataUrl.length * 3) / 4);

          resolve({
            dataUrl: compressedDataUrl,
            width,
            height,
            sizeBytes: approxBytes,
          });
        };

        img.onerror = () => {
          resolve({ dataUrl: src, width: 0, height: 0, sizeBytes: file.size });
        };

        img.src = src;
      };

      reader.onerror = () => reject(new Error('Failed to load image for processing'));
      reader.readAsDataURL(file);
    });
  }
}
