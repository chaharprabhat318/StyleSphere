import { useState, useEffect } from 'react';
import { Clock, Calendar, Sparkles } from 'lucide-react';
import { outfitService } from '../services/outfitService';
import type { HistoryEntry } from '../services/outfitService';
import { wardrobeService } from '../services/wardrobeService';
import type { WardrobeItem } from '../types/wardrobe';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [neglectedItems, setNeglectedItems] = useState<WardrobeItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const hist = outfitService.getHistory();
      const allItems = await wardrobeService.getItems();

      // Hydrate entries with real wardrobe items if empty
      const hydrated = hist.map((entry, index) => {
        if (entry.items && entry.items.length > 0) return entry;
        const offset = index * 2;
        return {
          ...entry,
          items: allItems.slice(offset % allItems.length, (offset % allItems.length) + 3),
        };
      });
      setHistory(hydrated);

      // Neglected pieces (low wear count)
      const neglected = allItems.filter((i) => i.wearCount <= 5).slice(0, 4);
      setNeglectedItems(neglected);
    };
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-white bg-[#0e244d] px-2.5 py-1 rounded-full border border-[#1e3a8a]">
            Journal des Tenues
          </span>
          <h1 className="font-editorial text-3xl md:text-4xl text-slate-900 font-bold mt-2">
            Wear Rotation & History
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 max-w-xl font-sans-clean leading-relaxed">
            Preserve garment longevity and avoid unconscious repetition. StyleSphere monitors wear frequencies across your collection.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a1124] border border-slate-800 text-xs text-slate-300 font-sans-clean">
          <Clock className="w-3.5 h-3.5 text-blue-300" />
          <span>Active 5-Day Duplicate Shield</span>
        </div>
      </div>

      {/* Underutilized Wardrobe Gems Section */}
      {neglectedItems.length > 0 && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0e244d]" />
              <h3 className="font-editorial text-lg text-slate-900 font-bold">
                Forgotten Closet Gems
              </h3>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              Lowest Wear Index
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {neglectedItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 group hover:border-[#1e3a8a] hover:bg-slate-100 transition-all"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-12 h-16 object-cover rounded-xl bg-slate-100 shrink-0"
                />
                <div className="overflow-hidden min-w-0">
                  <span className="text-[9px] uppercase tracking-wider text-[#0e244d] font-bold">
                    {item.category}
                  </span>
                  <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-sans-clean">Worn only {item.wearCount}×</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outfit History Timeline */}
      <div className="space-y-4">
        <h3 className="font-editorial text-2xl text-slate-900 font-bold">
          Chronological Rotation
        </h3>

        <div className="relative border-l border-slate-200 pl-6 ml-3 space-y-6">
          {history.map((entry) => (
            <div key={entry.id} className="relative group">
              {/* Dot */}
              <div className="absolute -left-[31px] top-2 w-3.5 h-3.5 rounded-full bg-[#0e244d] border-2 border-white shadow-xs" />

              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-[#1e3a8a] hover:shadow-md transition-all space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest font-bold text-[#0e244d]">
                      {entry.occasion}
                    </span>
                    <h4 className="font-editorial text-lg text-slate-900 font-bold mt-0.5">{entry.title}</h4>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-sans-clean">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Worn on {entry.dateWorn}</span>
                  </div>
                </div>

                {entry.notes && (
                  <p className="text-xs text-slate-600 italic font-sans-clean bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    "{entry.notes}"
                  </p>
                )}

                {/* Outfit Items Flat-Lay Strip */}
                {entry.items && entry.items.length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-1">
                    {entry.items.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center gap-2.5 p-2 pr-3.5 rounded-2xl bg-slate-50 border border-slate-200/80"
                      >
                        <img
                          src={it.imageUrl}
                          alt={it.name}
                          className="w-9 h-11 rounded-xl object-cover bg-slate-100"
                        />
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{it.name}</p>
                          <p className="text-[10px] text-slate-500">{it.brand} • {it.color}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
