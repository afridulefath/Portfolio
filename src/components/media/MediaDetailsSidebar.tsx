import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  RefreshCw, 
  Folder, 
  Calendar, 
  Maximize2, 
  Link as LinkIcon, 
  FileText, 
  Film, 
  Layers, 
  Tag, 
  Save, 
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { MediaFile, MediaFolder } from '../../types/media';
import { MediaService } from '../../services/mediaService';

interface MediaDetailsSidebarProps {
  file: MediaFile | null;
  folders: MediaFolder[];
  onClose: () => void;
  onUpdate: (updatedFile: MediaFile) => void;
  onDelete: (fileId: string) => void;
  onPreview: (file: MediaFile) => void;
  darkMode: boolean;
}

export const MediaDetailsSidebar: React.FC<MediaDetailsSidebarProps> = ({
  file,
  folders,
  onClose,
  onUpdate,
  onDelete,
  onPreview,
  darkMode,
}) => {
  const [formData, setFormData] = useState<Partial<MediaFile>>({});
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (file) {
      setFormData({
        name: file.name,
        altText: file.altText || '',
        caption: file.caption || '',
        seoDescription: file.seoDescription || '',
        folderId: file.folderId || 'general',
        lazyLoad: file.lazyLoad ?? true,
      });
    }
  }, [file]);

  if (!file) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(file.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.originalName || `${file.name}.file`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSaveMetadata = () => {
    if (!file) return;
    const success = MediaService.updateFile(file.id, formData);
    if (success) {
      const updated = { ...file, ...formData };
      onUpdate(updated);
      setSaveStatus('Metadata saved! / সংরক্ষিত হয়েছে');
      setTimeout(() => setSaveStatus(null), 2500);
    }
  };

  const handleFolderChange = (folderId: string) => {
    setFormData(prev => ({ ...prev, folderId }));
    MediaService.updateFile(file.id, { folderId });
    onUpdate({ ...file, folderId });
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFile = e.target.files?.[0];
    if (!newFile || !file) return;

    try {
      setIsReplacing(true);
      const replaced = await MediaService.replaceFile(file.id, newFile);
      onUpdate(replaced);
      setIsReplacing(false);
      setSaveStatus('File successfully replaced! / ফাইল প্রতিস্থাপন সম্পন্ন');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: any) {
      setIsReplacing(false);
      alert(err.message || 'ফাইল প্রতিস্থাপন করতে সমস্যা হয়েছে');
    }
  };

  const formatBytes = (bytes: number): string => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const usages = file.usages || [];

  return (
    <div className={`w-80 lg:w-96 border-l h-full flex flex-col overflow-hidden shrink-0 animate-fade-in ${
      darkMode ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      {/* Header */}
      <div className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h4 className="text-sm font-bold">Media Inspector & SEO</h4>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Preview Thumbnail Box */}
        <div className="relative group aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shadow-md">
          {file.fileType === 'image' && (
            <img
              src={file.url}
              alt={file.altText || file.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain p-1"
            />
          )}

          {file.fileType === 'video' && (
            <div className="flex flex-col items-center justify-center text-indigo-400">
              <Film className="w-10 h-10 mb-2" />
              <span className="text-xs font-semibold">{file.isExternalVideo ? 'YouTube Embed' : 'MP4 Video'}</span>
            </div>
          )}

          {file.fileType === 'pdf' && (
            <div className="flex flex-col items-center justify-center text-rose-400">
              <FileText className="w-10 h-10 mb-2" />
              <span className="text-xs font-semibold">PDF Document</span>
            </div>
          )}

          {file.fileType === 'document' && (
            <div className="flex flex-col items-center justify-center text-blue-400">
              <FileText className="w-10 h-10 mb-2" />
              <span className="text-xs font-semibold">Word Document</span>
            </div>
          )}

          {/* Quick hover action bar */}
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={() => onPreview(file)}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-transform hover:scale-105 cursor-pointer"
              title="Full Preview"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyUrl}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white shadow-md transition-transform hover:scale-105 cursor-pointer"
              title="Copy URL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleDownload}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white shadow-md transition-transform hover:scale-105 cursor-pointer"
              title="Download File"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons Strip */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleCopyUrl}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              copied 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-200'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied URL!' : 'Copy URL'}</span>
          </button>

          <button
            onClick={() => onPreview(file)}
            className="py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Full View</span>
          </button>
        </div>

        {/* File Specifications Table */}
        <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span>File Size:</span>
            <span className="font-semibold text-slate-200">{formatBytes(file.sizeBytes)}</span>
          </div>

          {file.width && file.height && (
            <div className="flex justify-between items-center text-slate-400">
              <span>Dimensions:</span>
              <span className="font-semibold text-slate-200">{file.width} × {file.height} px</span>
            </div>
          )}

          <div className="flex justify-between items-center text-slate-400">
            <span>MIME Type:</span>
            <span className="font-mono text-[11px] text-slate-300">{file.mimeType}</span>
          </div>

          <div className="flex justify-between items-center text-slate-400">
            <span>Uploaded On:</span>
            <span className="text-slate-200">{new Date(file.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Usage Tracking Section (Key Requirement) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Usage Tracking ({usages.length})</span>
            </span>
          </div>

          {usages.length > 0 ? (
            <div className="space-y-1.5">
              {usages.map((u, i) => (
                <div 
                  key={i} 
                  className="p-2 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs flex items-center justify-between gap-2"
                >
                  <div className="overflow-hidden">
                    <span className="font-bold text-indigo-300 block truncate">{u.location}</span>
                    <span className="text-[11px] text-slate-400 block truncate">{u.label}</span>
                  </div>
                  {u.link && (
                    <a
                      href={u.link}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded-md bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 transition-colors"
                      title="Open page"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Unused (এই ফাইলটি বর্তমানে কোনো পেজে ব্যবহৃত হচ্ছে না)</span>
            </div>
          )}
        </div>

        {/* Move Folder Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5 text-indigo-400" />
            <span>Folder Assignment</span>
          </label>
          <select
            value={formData.folderId}
            onChange={(e) => handleFolderChange(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-indigo-500 ${
              darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          >
            {folders.map(f => (
              <option key={f.id} value={f.id}>
                📁 {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Editable Metadata Form */}
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Display Name
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-3 py-2 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-indigo-500 ${
                darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Alt Text (Image Accessibility & SEO)
            </label>
            <input
              type="text"
              placeholder="e.g. Lead Engineer presenting system architecture"
              value={formData.altText || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, altText: e.target.value }))}
              className={`w-full px-3 py-2 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-indigo-500 ${
                darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Image Caption / Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief descriptive caption..."
              value={formData.caption || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
              className={`w-full px-3 py-2 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-indigo-500 ${
                darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              SEO Meta Description
            </label>
            <textarea
              rows={2}
              placeholder="SEO crawler index description..."
              value={formData.seoDescription || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
              className={`w-full px-3 py-2 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-indigo-500 ${
                darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveMetadata}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Update Metadata & Alt Text</span>
          </button>

          {saveStatus && (
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{saveStatus}</span>
            </div>
          )}
        </div>

        {/* Replace & Delete Zone */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <input
            ref={replaceInputRef}
            type="file"
            className="hidden"
            onChange={handleReplaceFile}
          />
          <button
            onClick={() => replaceInputRef.current?.click()}
            disabled={isReplacing}
            className="w-full py-2 px-3 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReplacing ? 'animate-spin' : ''}`} />
            <span>{isReplacing ? 'Replacing...' : 'Replace File with New Upload'}</span>
          </button>

          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete "${file.name}"? ${usages.length > 0 ? `\nWarning: This file is currently used in ${usages.length} places!` : ''}`)) {
                onDelete(file.id);
              }
            }}
            className="w-full py-2 px-3 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete File Permanently</span>
          </button>
        </div>

      </div>
    </div>
  );
};
