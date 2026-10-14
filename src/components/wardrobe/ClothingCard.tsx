import React from 'react';
import { Heart, Trash2, Calendar } from 'lucide-react';
import type { WardrobeItem } from '../../types/wardrobe';

interface ClothingCardProps {
  item: WardrobeItem;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onRecordWear?: (id: string) => void;
  onSelect?: (item: WardrobeItem) => void;
}

export const ClothingCard: React.FC<ClothingCardProps> = ({
  item,
  onToggleFavorite,
  onDelete,
  onRecordWear,
  onSelect,
}) => {
  return (
    <div
      onClick={() => onSelect?.(item)}
      className="group relative rounded-3xl bg-white border border-slate-200/80 hover:border-blue-400 shadow-[0_2px_12px_rgba(37,99,235,0.04)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.12)] overflow-hidden transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      {/* Garment Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-50">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Top Floating Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          <span className="text-[9px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-700 border border-slate-200/80 shadow-sm">
            {item.category}
          </span>

          {/* Favorite Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(item.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer pointer-events-auto shadow-sm ${
              item.isFavorite
                ? 'bg-rose-50 text-rose-500 border border-rose-200'
                : 'bg-white/90 text-slate-400 hover:text-slate-700 border border-slate-200/80'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        {/* Bottom Color Dot & Material Pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm text-[10px] text-slate-700">
          <span
            className="w-2.5 h-2.5 rounded-full border border-slate-300 shadow-xs"
            style={{ backgroundColor: item.colorHex || '#94a3b8' }}
          />
          <span className="truncate max-w-[100px] font-sans-clean font-medium">{item.color}</span>
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
            <span className="uppercase tracking-wider font-bold text-[#132d5e]">{item.brand || 'Atelier'}</span>
            <span className="capitalize">{item.style}</span>
          </div>
          <h4 className="font-editorial text-sm text-slate-900 font-normal line-clamp-1 group-hover:text-[#132d5e] transition-colors">
            {item.name}
          </h4>
        </div>

        {/* Card Footer Metrics & Quick Actions */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="text-[10px] text-slate-500 font-sans-clean">
            <span>Worn <strong className="text-slate-800 font-semibold">{item.wearCount}×</strong></span>
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {onRecordWear && (
              <button
                onClick={() => onRecordWear(item.id)}
                title="Log wear today"
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#132d5e] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => onDelete(item.id)}
              title="Remove from wardrobe"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
