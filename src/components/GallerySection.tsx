import React, { useState } from 'react';
import { 
  Camera, 
  Sparkles, 
  Maximize2, 
  Tag, 
  Calendar,
  Layers
} from 'lucide-react';
import { PortfolioData, GalleryItem } from '../types/portfolio';
import { LightboxModal } from './LightboxModal';

interface GallerySectionProps {
  data: PortfolioData;
  darkMode: boolean;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ data, darkMode }) => {
  const { gallery } = data;
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = ['All', 'Projects', 'Speaking & Events', 'Workspaces', 'Awards & Life'];

  const filteredItems = selectedCategory === 'All'
    ? gallery
    : gallery.filter(item => item.category === selectedCategory);

  const handleOpenLightbox = (item: GalleryItem) => {
    const index = gallery.findIndex(g => g.id === item.id);
    if (index !== -1) {
      setLightboxIndex(index);
    }
  };

  return (
    <section id="gallery" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Camera className="w-3.5 h-3.5" />
            <span>Visual Showcase</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Photo Gallery & Highlights
          </h2>
          <p className={`text-base sm:text-lg leading-relaxed ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Curated snapshots of keynotes, engineering architecture milestones, workspace ergonomics, and global hackathons.
          </p>
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : darkMode
                    ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-xs'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => handleOpenLightbox(item)}
              className={`group relative rounded-3xl overflow-hidden border cursor-pointer transition-all duration-300 hover:-translate-y-1.5 ${
                darkMode
                  ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/50 shadow-lg shadow-black/40'
                  : 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-xl'
              }`}
            >
              {/* Image Container */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-800">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />

                {/* Category Badge on Image */}
                <div className="absolute top-3.5 left-3.5 z-10">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/20">
                    {item.category}
                  </span>
                </div>

                {/* Hover Maximize Button */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 border border-white/30 shadow-lg">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`text-base font-bold leading-snug group-hover:text-indigo-500 transition-colors ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {item.title}
                  </h3>
                  {item.date && (
                    <span className="text-[11px] font-medium text-slate-400 shrink-0">
                      {item.date}
                    </span>
                  )}
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed line-clamp-2 ${
                  darkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {item.caption}
                </p>

                {/* Tag Pills */}
                {item.tags && item.tags.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                          darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="text-[10px] text-slate-400">+{item.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <LightboxModal
          items={gallery}
          currentIndex={lightboxIndex}
          isOpen={lightboxIndex !== null}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(newIndex) => setLightboxIndex(newIndex)}
          darkMode={darkMode}
        />
      )}
    </section>
  );
};
