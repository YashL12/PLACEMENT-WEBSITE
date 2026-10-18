import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchBar = ({
  searchQuery,
  onSearchChange,
  onClear,
  placeholder = 'Search companies by name or alias (e.g. TSS, RKIT, Tark, TatvaSoft, eSparkBiz)...',
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-2 sm:p-3 mb-8">
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-10 py-2.5 sm:py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={onClear}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
