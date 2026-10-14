import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import type { ClothingCategory, OccasionType, WardrobeFilterOptions } from '../../types/wardrobe';

interface CategoryFilterProps {
  filters: WardrobeFilterOptions;
  categoryCounts: Record<ClothingCategory | 'all', number>;
  onFilterChange: (updates: Partial<WardrobeFilterOptions>) => void;
  onResetWardrobe?: () => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  filters,
  categoryCounts,
  onFilterChange,
  onResetWardrobe,
}) => {
  const categories: Array<{ id: ClothingCategory | 'all'; label: string }> = [
    { id: 'all', label: 'All Pieces' },
    { id: 'tops', label: 'Tops' },
    { id: 'bottoms', label: 'Trousers & Denim' },
    { id: 'outerwear', label: 'Outerwear' },
    { id: 'footwear', label: 'Footwear' },
    { id: 'accessories', label: 'Accessories' },
  ];

  const occasions: Array<{ id: OccasionType | 'all'; label: string }> = [
    { id: 'all', label: 'All Occasions' },
    { id: 'college', label: 'Campus & Lecture' },
    { id: 'casual', label: 'Downtown Casual' },
    { id: 'party', label: 'Evening Social' },
    { id: 'formal', label: 'Formal Gathering' },
    { id: 'date', label: 'Dinner Date' },
  ];

  return (
    <div className="space-y-4">
      {/* Category Pills Bar */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-2">
          {categories.map((cat) => {
            const isActive = filters.category === cat.id;
            const count = categoryCounts[cat.id] || 0;
            return (
              <button
                key={cat.id}
                onClick={() => onFilterChange({ category: cat.id })}
                className={`px-4 py-2 rounded-full text-xs transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#0e244d] text-white font-semibold border border-[#1e3a8a] shadow-sm'
                    : 'bg-white text-slate-600 hover:text-[#0e244d] border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 shadow-xs'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Restore sample demo button if needed */}
        {onResetWardrobe && (
          <button
            onClick={onResetWardrobe}
            title="Reset to sample wardrobe"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs text-slate-600 hover:text-[#0e244d] hover:bg-slate-100 transition-colors border border-slate-200/90 bg-white shadow-xs cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#0e244d]" />
            <span className="hidden sm:inline font-medium">Reset Collection</span>
          </button>
        )}
      </div>

      {/* Secondary Search & Dropdown Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search piece, brand, or color..."
            className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-slate-200/90 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-xs transition-colors"
          />
        </div>

        {/* Occasion Filter Dropdown */}
        <div className="relative">
          <select
            value={filters.occasion}
            onChange={(e) => onFilterChange({ occasion: e.target.value as OccasionType | 'all' })}
            className="w-full px-4 py-2 rounded-full bg-white border border-slate-200/90 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-xs appearance-none cursor-pointer"
          >
            {occasions.map((occ) => (
              <option key={occ.id} value={occ.id}>
                {occ.label}
              </option>
            ))}
          </select>
          <Filter className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Sort Options */}
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
            className="w-full px-4 py-2 rounded-full bg-white border border-slate-200/90 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-xs appearance-none cursor-pointer"
          >
            <option value="recently_added">
              Recently Added
            </option>
            <option value="most_worn">
              Most Frequently Worn
            </option>
            <option value="least_worn">
              Least Worn (Neglected)
            </option>
            <option value="name">
              Alphabetical (A-Z)
            </option>
          </select>
        </div>
      </div>
    </div>
  );
};
