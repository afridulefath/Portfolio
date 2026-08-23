import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Film, 
  Image as ImageIcon, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Folder, 
  Sliders, 
  Play,
  Layers,
  ArrowRight,
  FileCheck
} from 'lucide-react';
import { MediaFolder, MediaFile } from '../../types/media';
import { MediaService } from '../../services/mediaService';

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (uploadedFiles: MediaFile[]) => void;
  folders: MediaFolder[];
  defaultFolderId?: string;
  darkMode: boolean;
}

export const MediaUploadModal: React.FC<MediaUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  folders,
  defaultFolderId = 'general',
  darkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'files' | 'video'>('files');
  const [selectedFolder, setSelectedFolder] = useState<string>(defaultFolderId);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number>(0);

  // Settings
  const [autoCompress, setAutoCompress] = useState<boolean>(true);
  const [convertToWebP, setConvertToWebP] = useState<boolean>(true);

  // External Video Form
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoTitle, setVideoTitle] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    setIsUploading(true);
    setUploadProgress(10);
    setSuccessCount(0);

    const uploadedList: MediaFile[] = [];
    const totalFiles = fileList.length;

    try {
      for (let i = 0; i < totalFiles; i++) {
        const file = fileList[i];
        const uploaded = await MediaService.uploadFile(
          file,
          selectedFolder,
          undefined,
          { autoCompress, convertToWebP }
        );
        uploadedList.push(uploaded);
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
        setSuccessCount(i + 1);
      }

      setTimeout(() => {
        setIsUploading(false);
        onSuccess(uploadedList);
        onClose();
      }, 600);
    } catch (err: any) {
      setIsUploading(false);
      setError(err.message || 'ফাইল আপলোড করতে সমস্যা হয়েছে।');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleExternalVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) {
      setError('ভিডিও URL প্রদান করুন / Please provide a video URL');
      return;
    }

    try {
      const added = MediaService.addExternalVideo(
        videoUrl.trim(),
        videoTitle.trim() || 'External Video Asset',
        selectedFolder
      );
      onSuccess([added]);
      onClose();
    } catch (err: any) {
      setError(err.message || 'ভিডিও যুক্ত করতে ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className={`w-full max-w-2xl rounded-3xl border flex flex-col overflow-hidden shadow-2xl ${
        darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Media Upload Center</h3>
              <p className="text-xs text-slate-400">
                Single, Multiple, Drag & Drop এবং YouTube/Video ইন্টিগ্রেশন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className={`px-6 pt-3 flex gap-2 border-b ${
          darkMode ? 'border-slate-800/80 bg-slate-900/40' : 'border-slate-200 bg-slate-50/50'
        }`}>
          <button
            type="button"
            onClick={() => setActiveTab('files')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'files'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Upload Files & Images</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'video'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>External Video / YouTube</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          
          {/* Folder Target Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold flex items-center gap-1.5 text-slate-300">
              <Folder className="w-3.5 h-3.5 text-indigo-400" />
              <span>টার্গেট ফোল্ডার নির্বাচন করুন / Target Folder</span>
            </label>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${
                darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              {folders.map(f => (
                <option key={f.id} value={f.id}>
                  📁 {f.name} {f.id === 'all' ? '(Default All)' : ''}
                </option>
              ))}
            </select>
          </div>

          {activeTab === 'files' ? (
            <>
              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer group flex flex-col items-center justify-center ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
                    : darkMode
                      ? 'border-slate-800 bg-slate-900/50 hover:border-indigo-500/50 hover:bg-slate-900/80'
                      : 'border-slate-300 bg-slate-50/80 hover:border-indigo-400 hover:bg-slate-100/80'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif,application/pdf,video/mp4,video/webm,.doc,.docx"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />

                <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-md">
                  <Upload className="w-8 h-8" />
                </div>

                <h4 className="text-base font-bold mb-1">
                  Drag & Drop Files Here or <span className="text-indigo-400 underline">Browse</span>
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mb-4">
                  একসাথে একাধিক ফাইল বা পুরো ফোল্ডারের ফাইল নির্বাচন করে আপলোড করতে পারেন (Bulk & Multiple Upload Supported)
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60">JPG, PNG, WebP, SVG, GIF</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60">PDF, DOC, DOCX</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60">MP4, WEBM</span>
                </div>
              </div>

              {/* Image Optimization Checkboxes */}
              <div className={`p-4 rounded-2xl border space-y-3 ${
                darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Image Optimization Engine (Active)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2.5 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={autoCompress}
                      onChange={(e) => setAutoCompress(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-800"
                    />
                    <span>Auto Compress & Resize (HD 1440px)</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={convertToWebP}
                      onChange={(e) => setConvertToWebP(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-800"
                    />
                    <span>Convert to Next-Gen WebP format</span>
                  </label>
                </div>
              </div>
            </>
          ) : (
            /* External Video Link Form */
            <form onSubmit={handleExternalVideoSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Video or YouTube Embed URL *
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${
                    darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Video Title / Caption (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Product Demo Walkthrough"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${
                    darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Play className="w-4 h-4" />
                <span>Add Video Asset to Library</span>
              </button>
            </form>
          )}

          {/* Progress / Status feedback */}
          {isUploading && (
            <div className="space-y-2 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-300">
                <span className="flex items-center gap-2">
                  <Upload className="w-4 h-4 animate-bounce" />
                  Uploading & Optimizing Media Files... ({successCount} completed)
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-sky-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className={`px-6 py-3.5 border-t flex items-center justify-between ${
          darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <span className="text-xs">
            Supported: Images, Documents, PDFs, MP4s, YouTube
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
