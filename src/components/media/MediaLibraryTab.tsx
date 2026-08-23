import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  Plus, 
  Upload, 
  Search, 
  Filter, 
  Grid, 
  List as ListIcon, 
  Trash2, 
  Copy, 
  Check, 
  Download, 
  Maximize2, 
  Image as ImageIcon, 
  FileText, 
  Film, 
  File, 
  FolderPlus, 
  Edit3, 
  MoreVertical, 
  HardDrive, 
  Layers, 
  Sparkles, 
  Calendar, 
  Tag, 
  RefreshCw,
  ExternalLink,
  ChevronRight,
  MoveRight,
  SlidersHorizontal,
  CheckSquare,
  Square,
  AlertCircle
} from 'lucide-react';
import { MediaFile, MediaFolder, MediaStats, MediaFilterOptions } from '../../types/media';
import { PortfolioData } from '../../types/portfolio';
import { MediaService, DEFAULT_MEDIA_FOLDERS } from '../../services/mediaService';
import { MediaUploadModal } from './MediaUploadModal';
import { MediaPreviewModal } from './MediaPreviewModal';
import { MediaDetailsSidebar } from './MediaDetailsSidebar';

interface MediaLibraryTabProps {
  portfolioData: PortfolioData;
  darkMode: boolean;
  onSelectMedia?: (file: MediaFile) => void;
  isPickerMode?: boolean;
}

export const MediaLibraryTab: React.FC<MediaLibraryTabProps> = ({
  portfolioData,
  darkMode,
  onSelectMedia,
  isPickerMode = false,
}) => {
  const [folders, setFolders] = useState<MediaFolder[]>(() => MediaService.getFolders());
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'document' | 'video' | 'pdf'>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'name_asc' | 'name_desc' | 'size_desc' | 'size_asc'>('date_desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [files, setFiles] = useState<MediaFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [stats, setStats] = useState<MediaStats>(() => MediaService.getStats());

  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [targetMoveFolder, setTargetMoveFolder] = useState<string>('general');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load and refresh files
  const refreshMedia = () => {
    const currentFolders = MediaService.getFolders();
    setFolders(currentFolders);

    const loadedFiles = MediaService.getFiles({
      selectedFolderId,
      searchQuery,
      typeFilter,
      sortBy,
    }, portfolioData);

    setFiles(loadedFiles);
    setStats(MediaService.getStats());

    // Update selected file if still in list
    if (selectedFile) {
      const updatedSelected = loadedFiles.find(f => f.id === selectedFile.id) || null;
      setSelectedFile(updatedSelected);
    }
  };

  useEffect(() => {
    refreshMedia();
  }, [selectedFolderId, searchQuery, typeFilter, sortBy, portfolioData]);

  // Handle new folder
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const added = MediaService.addFolder(newFolderName.trim());
    setFolders(MediaService.getFolders());
    setNewFolderName('');
    setShowNewFolderInput(false);
    setSelectedFolderId(added.id);
  };

  // Handle rename folder
  const handleRenameFolder = (id: string) => {
    if (!editingFolderName.trim()) return;
    MediaService.updateFolder(id, { name: editingFolderName.trim() });
    setFolders(MediaService.getFolders());
    setEditingFolderId(null);
    setEditingFolderName('');
  };

  // Handle delete folder
  const handleDeleteFolder = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete folder "${name}"? Files inside will be moved to General folder.`)) {
      MediaService.deleteFolder(id, 'general');
      setFolders(MediaService.getFolders());
      if (selectedFolderId === id) {
        setSelectedFolderId('all');
      }
      refreshMedia();
    }
  };

  // Single file delete
  const handleDeleteFile = (id: string) => {
    MediaService.deleteFile(id);
    setSelectedFileIds(prev => prev.filter(i => i !== id));
    if (selectedFile?.id === id) {
      setSelectedFile(null);
    }
    refreshMedia();
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (selectedFileIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedFileIds.length} selected files?`)) {
      MediaService.deleteMultipleFiles(selectedFileIds);
      setSelectedFileIds([]);
      setSelectedFile(null);
      refreshMedia();
    }
  };

  // Bulk move
  const handleBulkMove = () => {
    if (selectedFileIds.length === 0) return;
    MediaService.moveFilesToFolder(selectedFileIds, targetMoveFolder);
    setSelectedFileIds([]);
    setMoveModalOpen(false);
    refreshMedia();
  };

  // Toggle selection
  const handleToggleSelectFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFileIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedFileIds.length === files.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(files.map(f => f.id));
    }
  };

  const handleCopyUrl = (file: MediaFile, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(file.url);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatBytes = (bytes: number): string => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Count files per folder
  const allRawFiles = MediaService.getAllFiles();
  const getFolderCount = (folderId: string) => {
    if (folderId === 'all') return allRawFiles.length;
    return allRawFiles.filter(f => f.folderId === folderId).length;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden space-y-4">
      
      {/* 1. Storage & Statistics Summary Bar */}
      {!isPickerMode && (
        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 rounded-3xl border shrink-0 ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Total Files</span>
              <strong className="text-base font-bold">{stats.totalFiles}</strong>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Images</span>
              <strong className="text-base font-bold">{stats.totalImages}</strong>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Documents & PDFs</span>
              <strong className="text-base font-bold">{stats.totalDocuments}</strong>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Videos</span>
              <strong className="text-base font-bold">{stats.totalVideos}</strong>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Storage Size</span>
              <strong className="text-base font-bold">{stats.formattedStorage}</strong>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer transition-all hover:scale-102"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Media</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace: Left Folder Tree + Center Grid/List + Right Details Sidebar */}
      <div className="flex-1 flex overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/40">
        
        {/* LEFT: Folder Navigation Tree */}
        <div className={`w-56 sm:w-64 border-r flex flex-col shrink-0 overflow-y-auto ${
          darkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50/80 border-slate-200'
        }`}>
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-indigo-400" />
              <span>Media Folders</span>
            </span>

            <button
              onClick={() => setShowNewFolderInput(true)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors"
              title="Create New Folder"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>

          {/* New Folder Form */}
          {showNewFolderInput && (
            <form onSubmit={handleCreateFolder} className="p-3 border-b border-slate-800 bg-indigo-950/20 space-y-2">
              <input
                type="text"
                placeholder="Folder Name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs border outline-none focus:ring-1 focus:ring-indigo-500 ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              <div className="flex gap-1.5">
                <button
                  type="submit"
                  className="flex-1 py-1 rounded-md bg-indigo-600 text-white text-[11px] font-semibold"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewFolderInput(false)}
                  className="px-2 py-1 rounded-md bg-slate-800 text-slate-400 text-[11px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Folder List */}
          <div className="p-2 space-y-1 flex-1 overflow-y-auto">
            {folders.map((f) => {
              const isSelected = selectedFolderId === f.id;
              const isEditing = editingFolderId === f.id;
              const count = getFolderCount(f.id);

              return (
                <div
                  key={f.id}
                  onClick={() => !isEditing && setSelectedFolderId(f.id)}
                  className={`group px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md'
                      : darkMode
                        ? 'text-slate-300 hover:bg-slate-800/80'
                        : 'text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingFolderName}
                        onChange={(e) => setEditingFolderName(e.target.value)}
                        autoFocus
                        className="w-full px-2 py-1 rounded bg-slate-800 text-white text-xs border border-indigo-500"
                      />
                      <button
                        onClick={() => handleRenameFolder(f.id)}
                        className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px]"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 truncate">
                        <Folder className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-indigo-400'}`} />
                        <span className="truncate">{f.name}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                          isSelected ? 'bg-indigo-700/80 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {count}
                        </span>

                        {!f.isSystem && !isSelected && (
                          <div className="hidden group-hover:flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setEditingFolderId(f.id);
                                setEditingFolderName(f.name);
                              }}
                              className="p-1 text-slate-400 hover:text-white"
                              title="Rename"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteFolder(f.id, f.name)}
                              className="p-1 text-slate-400 hover:text-red-400"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick upload drop trigger */}
          <div className="p-3 border-t border-slate-800">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="w-full py-2 px-3 rounded-xl border border-dashed border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to this Folder</span>
            </button>
          </div>
        </div>

        {/* CENTER: Main Explorer (Search, Filter, Grid/Table) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Top Search & Filter Bar */}
          <div className={`p-3.5 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
            darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            
            {/* Search input */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search media by name, tag, or format..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border outline-none focus:ring-2 focus:ring-indigo-500 ${
                  darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            {/* Type Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All' },
                { id: 'image', label: 'Images' },
                { id: 'document', label: 'Documents' },
                { id: 'pdf', label: 'PDFs' },
                { id: 'video', label: 'Videos' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setTypeFilter(pill.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    typeFilter === pill.id
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : darkMode
                        ? 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* View Switcher & Sort */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={`px-3 py-1.5 rounded-xl border text-xs outline-none ${
                  darkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-700'
                }`}
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="size_desc">Size (Largest)</option>
                <option value="size_asc">Size (Smallest)</option>
              </select>

              <div className="flex items-center bg-slate-800/60 p-0.5 rounded-xl border border-slate-700">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="List View"
                >
                  <ListIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Selection Action Bar */}
          {selectedFileIds.length > 0 && (
            <div className="px-4 py-2 bg-indigo-950/60 border-b border-indigo-500/30 flex items-center justify-between text-xs animate-fade-in">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                <CheckSquare className="w-4 h-4 text-indigo-400" />
                <span>{selectedFileIds.length} items selected</span>
                <button
                  onClick={() => setSelectedFileIds([])}
                  className="text-slate-400 hover:text-slate-200 underline ml-2"
                >
                  Deselect all
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMoveModalOpen(true)}
                  className="px-3 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 flex items-center gap-1.5 font-medium cursor-pointer"
                >
                  <Folder className="w-3.5 h-3.5" />
                  <span>Move to Folder</span>
                </button>

                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 flex items-center gap-1.5 font-medium cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected</span>
                </button>
              </div>
            </div>
          )}

          {/* Media Content Grid / List */}
          <div className="flex-1 overflow-y-auto p-4">
            {files.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-300">No media files found</h4>
                <p className="text-xs max-w-sm">
                  {searchQuery ? 'No media matching your search terms.' : 'Upload photos, PDFs, documents or embed YouTube videos to populate your Media Library.'}
                </p>
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md inline-flex items-center gap-2 cursor-pointer mt-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Now</span>
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* GRID VIEW */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
                {files.map((file) => {
                  const isSelected = selectedFile?.id === file.id;
                  const isChecked = selectedFileIds.includes(file.id);
                  const isCopied = copiedId === file.id;
                  const usageCount = file.usages?.length || 0;

                  return (
                    <div
                      key={file.id}
                      onClick={() => {
                        setSelectedFile(file);
                        if (isPickerMode && onSelectMedia) {
                          onSelectMedia(file);
                        }
                      }}
                      className={`group relative rounded-2xl border overflow-hidden transition-all duration-200 flex flex-col cursor-pointer ${
                        isSelected
                          ? 'ring-2 ring-indigo-500 border-transparent shadow-xl scale-[1.01]'
                          : darkMode
                            ? 'bg-slate-900/60 border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-900'
                            : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md'
                      }`}
                    >
                      {/* Checkbox overlay for bulk selection */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleSelectFile(file.id, e)}
                        className={`absolute top-2 left-2 z-20 p-1 rounded-lg backdrop-blur-md transition-all ${
                          isChecked
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-950/60 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white'
                        }`}
                      >
                        {isChecked ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                      </button>

                      {/* Usage Count Badge */}
                      {usageCount > 0 && (
                        <div className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950/80 backdrop-blur-md border border-indigo-500/30 text-indigo-300">
                          {usageCount} {usageCount === 1 ? 'use' : 'uses'}
                        </div>
                      )}

                      {/* Media Thumbnail */}
                      <div className="aspect-square w-full bg-slate-950 flex items-center justify-center overflow-hidden relative">
                        {file.fileType === 'image' && (
                          <img
                            src={file.url}
                            alt={file.altText || file.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}

                        {file.fileType === 'video' && (
                          <div className="flex flex-col items-center justify-center text-indigo-400">
                            <Film className="w-8 h-8 mb-1" />
                            <span className="text-[10px] font-mono">{file.isExternalVideo ? 'YouTube' : 'Video'}</span>
                          </div>
                        )}

                        {file.fileType === 'pdf' && (
                          <div className="flex flex-col items-center justify-center text-rose-400">
                            <FileText className="w-8 h-8 mb-1" />
                            <span className="text-[10px] font-mono">PDF</span>
                          </div>
                        )}

                        {file.fileType === 'document' && (
                          <div className="flex flex-col items-center justify-center text-blue-400">
                            <File className="w-8 h-8 mb-1" />
                            <span className="text-[10px] font-mono">DOC</span>
                          </div>
                        )}

                        {/* Quick action buttons on hover */}
                        <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewFile(file);
                            }}
                            className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
                            title="Preview"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleCopyUrl(file, e)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
                            title="Copy URL"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* File Details footer */}
                      <div className="p-2.5 flex flex-col justify-between flex-1">
                        <span className="text-xs font-semibold truncate text-slate-200 group-hover:text-indigo-400 transition-colors">
                          {file.name}
                        </span>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                          <span>{formatBytes(file.sizeBytes)}</span>
                          <span className="uppercase font-mono">{file.fileType}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* LIST / TABLE VIEW */
              <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold">
                    <tr>
                      <th className="p-3 w-10">
                        <button onClick={handleSelectAll}>
                          {selectedFileIds.length === files.length && files.length > 0 ? (
                            <CheckSquare className="w-4 h-4 text-indigo-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </th>
                      <th className="p-3">File Name</th>
                      <th className="p-3">Folder</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Size</th>
                      <th className="p-3">Usages</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {files.map((file) => {
                      const isSelected = selectedFile?.id === file.id;
                      const isChecked = selectedFileIds.includes(file.id);
                      const usages = file.usages?.length || 0;

                      return (
                        <tr
                          key={file.id}
                          onClick={() => setSelectedFile(file)}
                          className={`cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-indigo-950/40' 
                              : darkMode 
                                ? 'hover:bg-slate-800/40' 
                                : 'hover:bg-slate-100'
                          }`}
                        >
                          <td className="p-3" onClick={(e) => e.stopPropagation()}>
                            <button onClick={(e) => handleToggleSelectFile(file.id, e)}>
                              {isChecked ? <CheckSquare className="w-4 h-4 text-indigo-400" /> : <Square className="w-4 h-4 text-slate-400" />}
                            </button>
                          </td>
                          <td className="p-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-800 flex items-center justify-center">
                              {file.fileType === 'image' ? (
                                <img src={file.url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <FileText className="w-4 h-4 text-indigo-400" />
                              )}
                            </div>
                            <div className="overflow-hidden">
                              <span className="font-semibold block truncate">{file.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono block truncate">{file.mimeType}</span>
                            </div>
                          </td>
                          <td className="p-3 capitalize text-slate-400">{file.folderId}</td>
                          <td className="p-3 uppercase font-mono text-[11px]">{file.fileType}</td>
                          <td className="p-3 text-slate-300">{formatBytes(file.sizeBytes)}</td>
                          <td className="p-3">
                            {usages > 0 ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                                {usages} uses
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[11px]">Unused</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewFile(file);
                                }}
                                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
                                title="Preview"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleCopyUrl(file, e)}
                                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
                                title="Copy URL"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Delete "${file.name}"?`)) handleDeleteFile(file.id);
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Detail Inspector Sidebar */}
        {selectedFile && !isPickerMode && (
          <MediaDetailsSidebar
            file={selectedFile}
            folders={folders}
            onClose={() => setSelectedFile(null)}
            onUpdate={(updated) => {
              setSelectedFile(updated);
              refreshMedia();
            }}
            onDelete={(id) => handleDeleteFile(id)}
            onPreview={(f) => setPreviewFile(f)}
            darkMode={darkMode}
          />
        )}

      </div>

      {/* Upload Modal */}
      <MediaUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={(uploaded) => {
          refreshMedia();
          if (uploaded.length > 0) {
            setSelectedFile(uploaded[0]);
          }
        }}
        folders={folders}
        defaultFolderId={selectedFolderId === 'all' ? 'general' : selectedFolderId}
        darkMode={darkMode}
      />

      {/* Preview Player Modal */}
      <MediaPreviewModal
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        darkMode={darkMode}
      />

      {/* Move Files Modal */}
      {moveModalOpen && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
            darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h4 className="text-base font-bold flex items-center gap-2">
              <Folder className="w-4 h-4 text-indigo-400" />
              <span>Move {selectedFileIds.length} Selected Files</span>
            </h4>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Select Target Folder:</label>
              <select
                value={targetMoveFolder}
                onChange={(e) => setTargetMoveFolder(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                }`}
              >
                {folders.filter(f => f.id !== 'all').map(f => (
                  <option key={f.id} value={f.id}>📁 {f.name}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setMoveModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkMove}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Confirm Move
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
