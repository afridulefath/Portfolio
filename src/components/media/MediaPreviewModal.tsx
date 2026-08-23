import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  FileText, 
  Film, 
  File, 
  Calendar, 
  Folder, 
  Tag, 
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCw
} from 'lucide-react';
import { MediaFile } from '../../types/media';

interface MediaPreviewModalProps {
  file: MediaFile | null;
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
  file,
  isOpen,
  onClose,
  darkMode,
}) => {
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen || !file) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(file.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.originalName || `${file.name}.${file.fileType === 'pdf' ? 'pdf' : 'png'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isImage = file.fileType === 'image';
  const isVideo = file.fileType === 'video';
  const isPdf = file.fileType === 'pdf' || file.mimeType.includes('pdf');
  const isDoc = file.fileType === 'document';

  const formatBytes = (bytes: number): string => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-fade-in">
      <div className={`w-full max-w-5xl max-h-[94vh] rounded-3xl border flex flex-col overflow-hidden shadow-2xl ${
        darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Top Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between gap-4 shrink-0 ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
              {isImage && <Layers className="w-5 h-5" />}
              {isVideo && <Film className="w-5 h-5" />}
              {isPdf && <FileText className="w-5 h-5" />}
              {isDoc && <File className="w-5 h-5" />}
            </div>
            <div className="overflow-hidden">
              <h3 className="text-base font-bold truncate">{file.name}</h3>
              <p className="text-xs text-slate-400 truncate">
                {file.originalName} • {formatBytes(file.sizeBytes)} {file.width ? `• ${file.width}×${file.height}px` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isImage && (
              <div className="hidden sm:flex items-center gap-1 bg-slate-800/40 p-1 rounded-xl border border-slate-700/50">
                <button
                  onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))}
                  className="p-1.5 rounded-lg hover:bg-slate-700/60 text-slate-300 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono px-1 text-slate-300">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom(prev => Math.min(3, prev + 0.25))}
                  className="p-1.5 rounded-lg hover:bg-slate-700/60 text-slate-300 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                  className="p-1.5 rounded-lg hover:bg-slate-700/60 text-slate-300 transition-colors"
                  title="Rotate"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={handleCopyUrl}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                copied 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800/60 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied URL!' : 'Copy URL'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center bg-slate-950/60">
          {isImage && (
            <div className="overflow-auto max-h-[70vh] flex items-center justify-center">
              <img
                src={file.url}
                alt={file.altText || file.name}
                referrerPolicy="no-referrer"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease-out'
                }}
                className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-800/50"
              />
            </div>
          )}

          {isVideo && (
            <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800">
              {file.youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${file.youtubeId}?autoplay=1`}
                  title={file.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : (
                <video
                  src={file.url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          )}

          {isPdf && (
            <div className="w-full h-[65vh] flex flex-col rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
              <div className="p-3 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-2 font-medium">
                  <FileText className="w-4 h-4 text-rose-400" />
                  PDF Document Viewer
                </span>
                <button
                  onClick={handleDownload}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  <span>Open in external viewer</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <iframe
                src={`${file.url}#toolbar=1`}
                title={file.name}
                className="w-full flex-1 bg-slate-950"
              />
            </div>
          )}

          {isDoc && (
            <div className="text-center p-12 bg-slate-900/60 rounded-3xl border border-slate-800 max-w-lg">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                <File className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold mb-2">{file.name}</h4>
              <p className="text-xs text-slate-400 mb-6">
                Microsoft Word Document ({formatBytes(file.sizeBytes)})
              </p>
              <button
                onClick={handleDownload}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg inline-flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Document</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Info Strip */}
        <div className={`px-6 py-3 border-t text-xs flex flex-wrap items-center justify-between gap-4 ${
          darkMode ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Uploaded: {new Date(file.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-slate-500" />
              Folder: <strong className="text-slate-300 capitalize">{file.folderId}</strong>
            </span>
            {file.altText && (
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                Alt: <span className="italic text-slate-300">{file.altText}</span>
              </span>
            )}
          </div>

          <div>
            <span className="font-mono text-[11px] text-slate-500">{file.mimeType}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
