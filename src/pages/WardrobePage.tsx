import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { ClothingCategory, WardrobeFilterOptions, WardrobeItem } from '../types/wardrobe';
import { wardrobeService } from '../services/wardrobeService';
import { ClothingCard } from '../components/wardrobe/ClothingCard';
import { CategoryFilter } from '../components/wardrobe/CategoryFilter';
import { Shirt, Plus, X, Trash2, Heart } from 'lucide-react';

// Item Detail Modal
interface DetailModalProps {
  item: WardrobeItem | null;
  allItems: WardrobeItem[];
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onRecordWear: (id: string) => void;
  onDelete: (id: string) => void;
}

const DetailModal: React.FC<DetailModalProps> = ({
  item,
  allItems,
  onClose,
  onToggleFavorite,
  onRecordWear,
  onDelete,
}) => {
  if (!item) return null;

  // Find complementary pieces in the wardrobe
  const complementary = allItems
    .filter((i) => i.id !== item.id && i.category !== item.category)
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 text-slate-500 hover:text-slate-800 flex items-center justify-center border border-slate-200 shadow-sm cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Photo */}
          <div className="aspect-[3/4] bg-slate-100">
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-[10px] text-[#0e244d] font-bold uppercase tracking-wider mb-1">
                <span className="flex items-center gap-1.5">
                  <span>{item.category}</span>
                  {item.gender && <span className="text-slate-400 font-medium">• {item.gender}</span>}
                </span>
                <span>{item.style}</span>
              </div>

              <h3 className="font-editorial text-xl text-slate-900 font-normal">{item.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{item.brand || 'Private Collection'}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Department</span>
                  <span className="text-slate-800 capitalize font-medium">{item.gender || 'Unisex'}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Dominant Tone</span>
                  <span className="text-slate-800 flex items-center gap-1.5 font-medium">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-slate-300"
                      style={{ backgroundColor: item.colorHex || '#94a3b8' }}
                    />
                    {item.color}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Wear History</span>
                  <span className="text-slate-800 font-semibold">{item.wearCount} times logged</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Occasion Fit</span>
                  <span className="text-slate-800 capitalize font-medium">{item.occasions.join(', ')}</span>
                </div>
              </div>

              {/* Complementary Suggestions */}
              <div className="mt-5 pt-3 border-t border-slate-100">
                <span className="text-[10px] tracking-widest uppercase font-semibold text-slate-500 block mb-2">
                  Harmonizes With
                </span>
                <div className="flex gap-2">
                  {complementary.map((c) => (
                    <div key={c.id} className="w-14 h-18 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
                      <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => {
                  onRecordWear(item.id);
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-full bg-[#0e244d] text-white hover:bg-[#15346d] border border-[#1e3a8a] text-xs font-semibold tracking-wide shadow-sm transition-all cursor-pointer"
              >
                Log Wear Today
              </button>
              <button
                onClick={() => {
                  onToggleFavorite(item.id);
                }}
                className="p-2.5 rounded-full bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-500 border border-slate-200 transition-colors cursor-pointer"
              >
                <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
              <button
                onClick={() => {
                  onDelete(item.id);
                  onClose();
                }}
                className="p-2.5 rounded-full bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-500 border border-slate-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const WardrobePage: React.FC = () => {
  const context = useOutletContext<{ refreshItems?: () => void; openUpload?: () => void }>();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
  const [filters, setFilters] = useState<WardrobeFilterOptions>({
    category: 'all',
    occasion: 'all',
    color: 'all',
    searchQuery: '',
    sortBy: 'recently_added',
  });

  const [categoryCounts, setCategoryCounts] = useState<Record<ClothingCategory | 'all', number>>({
    all: 0,
    tops: 0,
    bottoms: 0,
    outerwear: 0,
    footwear: 0,
    accessories: 0,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const allItems = await wardrobeService.getItems();
      const counts: Record<ClothingCategory | 'all', number> = {
        all: allItems.length,
        tops: 0,
        bottoms: 0,
        outerwear: 0,
        footwear: 0,
        accessories: 0,
      };
      allItems.forEach((it) => {
        counts[it.category] = (counts[it.category] || 0) + 1;
      });
      setCategoryCounts(counts);
      const filtered = await wardrobeService.getItems(filters);
      setItems(filtered);
    } catch (err) {
      console.error('Failed to load wardrobe items', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('stylesphere:wardrobe-updated', handleUpdate);
    return () => window.removeEventListener('stylesphere:wardrobe-updated', handleUpdate);
  }, [loadData]);

  const handleToggleFavorite = async (id: string) => {
    await wardrobeService.toggleFavorite(id);
    loadData();
    context?.refreshItems?.();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Remove this piece from your wardrobe?')) {
      await wardrobeService.deleteItem(id);
      loadData();
      context?.refreshItems?.();
    }
  };

  const handleRecordWear = async (id: string) => {
    await wardrobeService.recordWear(id);
    loadData();
  };

  const handleReset = async () => {
    await wardrobeService.resetToDefault();
    loadData();
    context?.refreshItems?.();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Detail Modal */}
      <DetailModal
        item={selectedItem}
        allItems={items}
        onClose={() => setSelectedItem(null)}
        onToggleFavorite={handleToggleFavorite}
        onRecordWear={handleRecordWear}
        onDelete={handleDelete}
      />

      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-white bg-[#0e244d] px-2.5 py-1 rounded-full border border-[#1e3a8a]">
            Garde-Robe Privée
          </span>
          <h1 className="font-editorial text-3xl md:text-4xl text-slate-900 font-bold mt-2">
            My Wardrobe
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 max-w-xl font-sans-clean leading-relaxed">
            Personal archive of {categoryCounts.all} individual garments. Click any piece for silhouette notes and styling pairings.
          </p>
        </div>

        <button
          onClick={() => context?.openUpload?.()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0e244d] text-white hover:bg-[#15346d] border border-[#1e3a8a] transition-all font-semibold text-xs tracking-wide cursor-pointer active:scale-95 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Garment</span>
        </button>
      </div>

      {/* Filter Bar */}
      <CategoryFilter
        filters={filters}
        categoryCounts={categoryCounts}
        onFilterChange={(updates) => setFilters((prev) => ({ ...prev, ...updates }))}
        onResetWardrobe={handleReset}
      />

      {/* Clothing Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-[3/4] rounded-3xl bg-white border border-slate-200/80 shadow-xs animate-pulse" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {items.map((item) => (
            <ClothingCard
              key={item.id}
              item={item}
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDelete}
              onRecordWear={handleRecordWear}
              onSelect={(selected) => setSelectedItem(selected)}
            />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl border border-dashed border-slate-200 bg-white/80 shadow-xs">
          <Shirt className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h4 className="font-editorial text-lg text-slate-800 font-normal">No pieces found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-sans-clean">
            No garments match the current category or search filter.
          </p>
        </div>
      )}
    </div>
  );
};
