import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Link as LinkIcon, 
  Trash2, 
  Image as ImageIcon, 
  Check, 
  AlertCircle,
  RefreshCw,
  Eye,
  FileImage,
  Layers,
  FolderOpen
} from 'lucide-react';
import { PortfolioData } from '../types/portfolio';
import { MediaPickerModal } from './media/MediaPickerModal';
import { CmsService } from '../services/cmsService';

interface ImageUploaderProps {
  id?: string;
  value: string;
  onChange: (url: string) => void;
  label?: string;
  sublabel?: string;
  darkMode?: boolean;
  aspectRatio?: 'square' | 'banner' | 'auto' | 'video' | 'wide' | 'landscape';
  previewHeight?: string;
  placeholder?: string;
  portfolioData?: PortfolioData;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  id,
  value,
  onChange,
  label = 'ছবি আপলোড / Image Upload',
  sublabel = 'ডিভাইস থেকে সরাসরি ফাইল আপলোড করুন অথবা লিংক দিন',
  darkMode = true,
  aspectRatio = 'auto',
  previewHeight = 'h-32',
  portfolioData,
}) => {
  const [mode, setMode] = useState<'device' | 'url'>('device');
  const [urlInput, setUrlInput] = useState<string>(value && !value.startsWith('data:') ? value : '');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePortfolioData = portfolioData || CmsService.getData();

  // Helper to compress / resize large device images using HTML Canvas before base64 saving
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল আপলোড করুন (PNG, JPG, WebP, GIF, SVG)');
      return;
    }

    setError(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;

      // If SVG vector file, use directly
      if (file.type === 'image/svg+xml') {
        onChange(src);
        setIsProcessing(false);
        return;
      }

      // Optimize and compress raster images so storage remains fast and never hits quota limits
      const img = new Image();
      img.onload = () => {
        const maxWidth = aspectRatio === 'square' ? 600 : 1080;
        const maxHeight = aspectRatio === 'square' ? 600 : 1080;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        try {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
            
            // Try webp first for maximum compression, fallback to jpeg
            let compressedDataUrl = '';
            try {
              compressedDataUrl = canvas.toDataURL('image/webp', 0.80);
              if (!compressedDataUrl.startsWith('data:image/webp')) {
                compressedDataUrl = canvas.toDataURL('image/jpeg', 0.80);
              }
            } catch {
              compressedDataUrl = canvas.toDataURL('image/jpeg', 0.80);
            }

            onChange(compressedDataUrl || src);
          } else {
            onChange(src);
          }
        } catch {
          onChange(src);
        }
        setIsProcessing(false);
      };
      img.onerror = () => {
        onChange(src);
        setIsProcessing(false);
      };
      img.src = src;
    };
    reader.onerror = () => {
      setError('ছবি পড়তে সমস্যা হয়েছে। অন্য একটি ফাইল চেষ্টা করুন।');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setError(null);
    }
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2 w-full">
      {/* Label and Mode Switcher */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <label className="block text-xs font-semibold text-slate-300">
            {label}
          </label>
          {sublabel && (
            <p className="text-[11px] text-slate-400">{sublabel}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition-all cursor-pointer shadow-xs"
            title="মিডিয়া লাইব্রেরি থেকে ছবি নির্বাচন করুন"
          >
            <FolderOpen className="w-3 h-3 text-indigo-400" />
            <span>মিডিয়া লাইব্রেরি</span>
          </button>

          <div className="flex items-center gap-1 p-0.5 rounded-lg border border-slate-700 bg-slate-900/60">
            <button
              type="button"
              onClick={() => setMode('device')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                mode === 'device'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3 h-3" />
              <span>ডিভাইস</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                mode === 'url'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LinkIcon className="w-3 h-3" />
              <span>লিংক</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Upload Box */}
      {mode === 'device' ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml, image/gif"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 ${
              isDragging
                ? 'border-indigo-500 bg-indigo-500/10'
                : darkMode
                  ? 'border-slate-700 bg-slate-900/60 hover:border-indigo-500 hover:bg-slate-900'
                  : 'border-slate-300 bg-slate-50 hover:border-indigo-500 hover:bg-white'
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 py-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>ছবি প্রসেস হচ্ছে... / Processing image...</span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <FileImage className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-200">
                    <span className="text-indigo-400 underline">ক্লিক করে ডিভাইস থেকে ছবি পছন্দ করুন</span> অথবা ড্র্যাগ করুন
                  </p>
                  <p className="text-[10px] text-slate-400">
                    PNG, JPG, WebP, SVG, GIF (মোবাইল ও পিসি থেকে যেকোনো ছবি)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyUrl()}
            className={`flex-1 px-3 py-2 rounded-xl text-xs border outline-none font-mono ${
              darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
            }`}
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
          >
            Apply
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 p-2 rounded-xl border border-red-500/20">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Image Preview & Details */}
      {value && (
        <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-12 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shrink-0 flex items-center justify-center`}>
              <img
                src={value}
                alt="Uploaded preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Check className="w-2.5 h-2.5" />
                  সংযুক্ত ছবি / Attached
                </span>
                {value.startsWith('data:') && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    (ডিভাইস ফাইল)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                {value.startsWith('data:') ? 'Local Device Image (Base64 ready)' : value}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer"
              title="নতুন ছবি পরিবর্তন করুন / Change image"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="ছবি মুছে ফেলুন / Remove image"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(selectedUrl) => {
          onChange(selectedUrl);
          setUrlInput(selectedUrl);
        }}
        portfolioData={activePortfolioData}
        darkMode={darkMode}
        title={`Select Image for ${label}`}
      />
    </div>
  );
};
