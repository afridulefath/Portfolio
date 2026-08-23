import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  Film, 
  Layers, 
  Search, 
  Folder 
} from 'lucide-react';
import { MediaFile } from '../../types/media';
import { PortfolioData } from '../../types/portfolio';
import { MediaLibraryTab } from './MediaLibraryTab';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, file?: MediaFile) => void;
  portfolioData: PortfolioData;
  title?: string;
  allowedTypes?: 'all' | 'image' | 'document' | 'video' | 'pdf';
  darkMode: boolean;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  portfolioData,
  title = 'Select Media from Library',
  allowedTypes = 'all',
  darkMode,
}) => {
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedFile) {
      onSelect(selectedFile.url, selectedFile);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-70 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-fade-in">
      <div className={`w-full max-w-5xl h-[88vh] rounded-3xl border flex flex-col overflow-hidden shadow-2xl ${
        darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">{title}</h3>
              <p className="text-xs text-slate-400">
                Choose an existing media asset or upload directly to library
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedFile && (
              <button
                type="button"
                onClick={handleConfirm}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md cursor-pointer transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Insert Selected ({selectedFile.name})</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Picker Content Body */}
        <div className="flex-1 p-4 overflow-hidden">
          <MediaLibraryTab
            portfolioData={portfolioData}
            darkMode={darkMode}
            isPickerMode={true}
            onSelectMedia={(file) => setSelectedFile(file)}
          />
        </div>

        {/* Footer */}
        {selectedFile && (
          <div className={`px-6 py-3 border-t flex items-center justify-between text-xs ${
            darkMode ? 'bg-slate-900/90 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <div className="flex items-center gap-3 truncate">
              <span className="font-semibold text-indigo-400">Selected:</span>
              <span className="truncate">{selectedFile.name}</span>
              <span className="text-slate-500 font-mono text-[11px]">({selectedFile.fileType})</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md"
              >
                Use this Media
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
