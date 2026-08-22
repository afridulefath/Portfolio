import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Tag, 
  Calendar, 
  Sparkles,
  Maximize2
} from 'lucide-react';
import { GalleryItem } from '../types/portfolio';

interface LightboxModalProps {
  items: GalleryItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  darkMode: boolean;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  items,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  darkMode,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);

  const currentItem = items[currentIndex];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') onNavigate((currentIndex + 1) % items.length);
    if (e.key === 'ArrowLeft') onNavigate((currentIndex - 1 + items.length) % items.length);
  }, [isOpen, currentIndex, items.length, onClose, onNavigate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setZoomLevel(1);
  }, [currentIndex]);

  if (!isOpen || !currentItem) return null;

  return (
    <div 
      id="lightbox-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 select-none animate-fade-in"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div 
        className="flex items-center justify-between z-10 w-full max-w-7xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90 border border-white/15">
            {currentItem.category}
          </span>
          <span className="text-white/60 text-xs sm:text-sm">
            {currentIndex + 1} of {items.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Buttons */}
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.5))}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.75))}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-red-500/80 transition-colors ml-2"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div 
        className="relative flex-1 flex items-center justify-center my-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation Buttons */}
        <button
          onClick={() => onNavigate((currentIndex - 1 + items.length) % items.length)}
          className="absolute left-2 sm:left-4 z-10 p-3 rounded-full bg-black/60 hover:bg-indigo-600 text-white transition-all shadow-lg border border-white/10 hover:scale-110"
          title="Previous (Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={() => onNavigate((currentIndex + 1) % items.length)}
          className="absolute right-2 sm:right-4 z-10 p-3 rounded-full bg-black/60 hover:bg-indigo-600 text-white transition-all shadow-lg border border-white/10 hover:scale-110"
          title="Next (Right Arrow)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* The Image */}
        <div className="max-w-5xl max-h-[75vh] flex items-center justify-center transition-transform duration-200">
          <img
            src={currentItem.imageUrl}
            alt={currentItem.title}
            className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})` }}
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div 
        className="w-full max-w-4xl mx-auto bg-slate-950/80 border border-white/10 rounded-2xl p-4 sm:p-5 text-white backdrop-blur-md z-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <h3 className="text-base sm:text-lg font-bold text-white">
            {currentItem.title}
          </h3>
          {currentItem.date && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>{currentItem.date}</span>
            </div>
          )}
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
          {currentItem.caption}
        </p>

        {currentItem.tags && currentItem.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {currentItem.tags.map((tag, tIdx) => (
              <span 
                key={tIdx}
                className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-md bg-white/10 text-indigo-200 border border-white/10"
              >
                <Tag className="w-2.5 h-2.5 opacity-60" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
