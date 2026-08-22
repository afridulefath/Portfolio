import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Link as LinkIcon, 
  Trash2, 
  Download, 
  Eye, 
  Check, 
  AlertCircle,
  RefreshCw,
  FileCheck
} from 'lucide-react';

interface ResumeUploaderProps {
  value: string;
  fileName?: string;
  onChange: (url: string, fileName?: string) => void;
  darkMode?: boolean;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  value,
  fileName,
  onChange,
  darkMode = true,
}) => {
  const [mode, setMode] = useState<'device' | 'url'>('device');
  const [urlInput, setUrlInput] = useState<string>(value && !value.startsWith('data:') ? value : '');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasResume = Boolean(value && value.trim() && value !== '#contact' && value !== '#');

  const processFile = (file: File) => {
    // Validate file type (PDF, DOC, DOCX, images, text)
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
    const nameLower = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some(ext => nameLower.endsWith(ext)) || file.type === 'application/pdf';

    if (!isAllowed) {
      setError('অনুগ্রহ করে PDF, DOC, DOCX বা ছবি ফাইল আপলোড করুন');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('ফাইলের আকার সর্বোচ্চ ৮MB হতে পারবে');
      return;
    }

    setError(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      onChange(src, file.name);
      setIsProcessing(false);
    };
    reader.onerror = () => {
      setError('ফাইল পড়তে সমস্যা হয়েছে। অন্য একটি ফাইল চেষ্টা করুন।');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
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
      processFile(file);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      const name = urlInput.split('/').pop()?.split('?')[0] || 'Resume_Document.pdf';
      onChange(urlInput.trim(), name);
      setError(null);
    }
  };

  const handleClear = () => {
    onChange('', '');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Current File Status Card if file exists */}
      {hasResume && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
          darkMode ? 'bg-indigo-950/40 border-indigo-500/30' : 'bg-indigo-50/80 border-indigo-200'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className={`text-xs font-bold truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {fileName || (value.startsWith('data:') ? 'Uploaded_CV.pdf' : 'External_Resume_Link')}
              </p>
              <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>সিভি সংযুক্ত আছে / CV Ready</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={value}
              download={fileName || 'Resume.pdf'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs cursor-pointer transition-all"
              title="টেস্ট ডাউনলোড বা ভিউ করুন"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ডাউনলোড টেস্ট</span>
            </a>

            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
              title="সিভি মুছে ফেলুন / Remove CV"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mode Selector */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMode('device')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mode === 'device'
              ? 'bg-indigo-600 text-white shadow-xs'
              : darkMode 
                ? 'bg-slate-800 text-slate-400 hover:text-slate-200' 
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>ডিভাইস থেকে আপলোড (PDF/DOC)</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mode === 'url'
              ? 'bg-indigo-600 text-white shadow-xs'
              : darkMode 
                ? 'bg-slate-800 text-slate-400 hover:text-slate-200' 
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>ড্রাইভ বা অনলাইন লিঙ্ক</span>
        </button>
      </div>

      {/* Device Mode: Drag & Drop Zone */}
      {mode === 'device' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
                : darkMode
                  ? 'border-slate-700 hover:border-indigo-500/60 bg-slate-900/50 hover:bg-slate-900'
                  : 'border-slate-300 hover:border-indigo-400 bg-white hover:bg-slate-50'
            }`}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center gap-2 py-4 text-indigo-400">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <p className="text-xs font-semibold">ফাইল প্রসেসিং হচ্ছে...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <p className={`text-xs sm:text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  এখানে ক্লিক করে আপনার <span className="text-indigo-400 font-bold">সিভি (PDF / DOCX)</span> সিলেক্ট করুন
                </p>
                <p className="text-[11px] text-slate-400">
                  বা ফাইল ড্র্যাগ করে এখানে এনে ছেড়ে দিন (Max 8MB)
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* URL Mode */}
      {mode === 'url' && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="https://drive.google.com/file/d/... বা https://mywebsite.com/resume.pdf"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border outline-none ${
              darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
            }`}
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md cursor-pointer transition-all shrink-0"
          >
            লিংক যুক্ত করুন
          </button>
        </div>
      )}

      {/* Error display */}
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
