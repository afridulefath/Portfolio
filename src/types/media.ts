export type MediaType = 'image' | 'document' | 'video' | 'pdf' | 'audio' | 'other';

export interface MediaUsage {
  location: string;
  field: string;
  label: string;
  link?: string;
}

export interface MediaFolder {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  isSystem?: boolean;
  color?: string;
  createdAt: string;
  fileCount?: number;
}

export interface MediaFile {
  id: string;
  name: string;
  originalName: string;
  url: string;
  fileType: MediaType;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  folderId: string; // references MediaFolder.id or 'all' / 'general'
  createdAt: string;
  updatedAt: string;
  
  // SEO & Metadata
  altText?: string;
  caption?: string;
  seoDescription?: string;
  tags?: string[];
  lazyLoad?: boolean;
  
  // Video specific
  durationSeconds?: number;
  isExternalVideo?: boolean;
  youtubeId?: string;
  
  // Usages cache
  usages?: MediaUsage[];
}

export interface MediaStats {
  totalFiles: number;
  totalImages: number;
  totalDocuments: number;
  totalVideos: number;
  totalPdfs: number;
  totalStorageBytes: number;
  formattedStorage: string;
}

export interface MediaFilterOptions {
  searchQuery: string;
  selectedFolderId: string;
  typeFilter: 'all' | 'image' | 'document' | 'video' | 'pdf';
  sortBy: 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc' | 'size_desc' | 'size_asc';
}

export interface NavbarItemConfig {
  id: string;
  key: string;
  label: string;
  customLabel?: string;
  path: string;
  enabled: boolean;
  order: number;
}
