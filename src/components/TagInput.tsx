import React, { useState, KeyboardEvent } from 'react';
import { Plus, X, Tag as TagIcon, Sparkles } from 'lucide-react';

export interface TagInputProps {
  id?: string;
  label?: string;
  sublabel?: string;
  placeholder?: string;
  items?: string[];
  onChange: (items: string[]) => void;
  darkMode: boolean;
  colorScheme?: 'indigo' | 'sky' | 'emerald' | 'purple' | 'amber';
  suggestions?: string[];
  maxItems?: number;
}

export const TagInput: React.FC<TagInputProps> = ({
  id,
  label,
  sublabel,
  placeholder = 'একটি আইটেম লিখে যোগ করুন...',
  items = [],
  onChange,
  darkMode,
  colorScheme = 'indigo',
  suggestions = [],
  maxItems,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddItem = (valueToAdd?: string) => {
    const text = (valueToAdd !== undefined ? valueToAdd : inputValue).trim();
    if (!text) return;

    // Support comma or newline splitting if user pastes a bulk text
    const splitItems = text
      .split(/[,,\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newItems = [...items];
    for (const item of splitItems) {
      if (!newItems.includes(item)) {
        if (maxItems && newItems.length >= maxItems) break;
        newItems.push(item);
      }
    }

    onChange(newItems);
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    } else if (e.key === ',' && inputValue.trim()) {
      e.preventDefault();
      handleAddItem();
    } else if (e.key === 'Backspace' && !inputValue && items.length > 0) {
      // Remove last item on backspace when input is empty
      handleRemoveItem(items.length - 1);
    }
  };

  const handleRemoveItem = (indexToRemove: number) => {
    onChange(items.filter((_, idx) => idx !== indexToRemove));
  };

  // Color mappings
  const themeColors = {
    indigo: {
      badge: darkMode 
        ? 'bg-indigo-950/70 border-indigo-500/30 text-indigo-300 hover:border-indigo-400' 
        : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:border-indigo-300',
      btn: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      accent: 'text-indigo-400',
    },
    sky: {
      badge: darkMode 
        ? 'bg-sky-950/70 border-sky-500/30 text-sky-300 hover:border-sky-400' 
        : 'bg-sky-50 border-sky-200 text-sky-700 hover:border-sky-300',
      btn: 'bg-sky-600 hover:bg-sky-500 text-white',
      accent: 'text-sky-400',
    },
    emerald: {
      badge: darkMode 
        ? 'bg-emerald-950/70 border-emerald-500/30 text-emerald-300 hover:border-emerald-400' 
        : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:border-emerald-300',
      btn: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      accent: 'text-emerald-400',
    },
    purple: {
      badge: darkMode 
        ? 'bg-purple-950/70 border-purple-500/30 text-purple-300 hover:border-purple-400' 
        : 'bg-purple-50 border-purple-200 text-purple-700 hover:border-purple-300',
      btn: 'bg-purple-600 hover:bg-purple-500 text-white',
      accent: 'text-purple-400',
    },
    amber: {
      badge: darkMode 
        ? 'bg-amber-950/70 border-amber-500/30 text-amber-300 hover:border-amber-400' 
        : 'bg-amber-50 border-amber-200 text-amber-700 hover:border-amber-300',
      btn: 'bg-amber-600 hover:bg-amber-500 text-white',
      accent: 'text-amber-400',
    },
  }[colorScheme];

  const filteredSuggestions = suggestions.filter((s) => !items.includes(s));

  return (
    <div id={id} className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold mb-0.5">
            {label}
          </label>
          <span className="text-[11px] text-slate-400">
            {items.length} টি যুক্ত করা হয়েছে
          </span>
        </div>
      )}
      {sublabel && <p className="text-[11px] text-slate-400">{sublabel}</p>}

      {/* Input Field + Add Button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full pl-3.5 pr-8 py-2 rounded-xl text-xs sm:text-sm border outline-none transition-colors ${
              darkMode 
                ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' 
                : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
            }`}
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => setInputValue('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => handleAddItem()}
          disabled={!inputValue.trim()}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 ${themeColors.btn}`}
        >
          <Plus className="w-4 h-4" />
          <span>যোগ করুন</span>
        </button>
      </div>

      {/* Suggested Quick Add Chips */}
      {filteredSuggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> সাজেশন:
          </span>
          {filteredSuggestions.slice(0, 6).map((suggestion, sIdx) => (
            <button
              key={sIdx}
              type="button"
              onClick={() => handleAddItem(suggestion)}
              className={`text-[11px] px-2 py-0.5 rounded-lg border font-medium transition-all cursor-pointer flex items-center gap-1 ${
                darkMode
                  ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-indigo-400 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              <Plus className="w-3 h-3" />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* Rendered Chips / Badges */}
      {items.length > 0 ? (
        <div className={`p-2.5 rounded-xl border flex flex-wrap gap-1.5 items-center min-h-[42px] ${
          darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          {items.map((item, index) => (
            <span
              key={index}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${themeColors.badge}`}
            >
              <TagIcon className="w-3 h-3 opacity-60 shrink-0" />
              <span className="break-all">{item}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="p-0.5 rounded hover:bg-black/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer ml-0.5"
                title={`Remove ${item}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {items.length > 1 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[11px] text-slate-400 hover:text-red-400 hover:underline px-2 py-1 ml-auto cursor-pointer"
            >
              সব মুছুন
            </button>
          )}
        </div>
      ) : (
        <div className="text-[11px] text-slate-400 italic px-1">
          কোনো আইটেম যোগ করা হয়নি। উপরে টাইপ করে Enter চাপুন বা 'যোগ করুন' এ ক্লিক করুন।
        </div>
      )}
    </div>
  );
};
