import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Sun,
  Snowflake,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import type { OccasionType, StyleVibe, WardrobeItem } from '../types/wardrobe';
import { wardrobeService } from '../services/wardrobeService';
import { outfitService } from '../services/outfitService';

export const RecommendationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<OccasionType>('college');
  const [selectedStyle] = useState<StyleVibe>('minimal');
  const [selectedWeather, setSelectedWeather] = useState<'mild' | 'warm' | 'cold'>('mild');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Active outfit slots (allows live swapping of individual garments)
  const [activeTopIndex, setActiveTopIndex] = useState(0);
  const [activeBottomIndex, setActiveBottomIndex] = useState(0);
  const [activeShoesIndex, setActiveShoesIndex] = useState(0);
  const [activeOuterIndex, setActiveOuterIndex] = useState(0);
  const [activeAccIndex, setActiveAccIndex] = useState(0);

  const [wornSuccess, setWornSuccess] = useState(false);

  useEffect(() => {
    const loadWardrobe = async () => {
      const items = await wardrobeService.getItems();
      setWardrobe(items);
    };
    loadWardrobe();
  }, []);

  // Filter items by category
  const tops = wardrobe.filter((i) => i.category === 'tops');
  const bottoms = wardrobe.filter((i) => i.category === 'bottoms');
  const shoes = wardrobe.filter((i) => i.category === 'footwear');
  const outerwears = wardrobe.filter((i) => i.category === 'outerwear');
  const accessories = wardrobe.filter((i) => i.category === 'accessories');

  // Currently selected pieces on the canvas
  const currentTop = tops[activeTopIndex % (tops.length || 1)];
  const currentBottom = bottoms[activeBottomIndex % (bottoms.length || 1)];
  const currentShoes = shoes[activeShoesIndex % (shoes.length || 1)];
  const currentOuter = selectedWeather !== 'warm' && outerwears.length > 0 
    ? outerwears[activeOuterIndex % outerwears.length] 
    : undefined;
  const currentAcc = accessories[activeAccIndex % (accessories.length || 1)];

  // Auto-compose smart outfit based on selected occasion and vibe
  const handleAutoCurate = () => {
    setIsSynthesizing(true);
    setWornSuccess(false);

    setTimeout(() => {
      // Find top that fits occasion
      const topIdx = tops.findIndex((t) => t.occasions.includes(selectedOccasion) || t.style === selectedStyle);
      if (topIdx !== -1) setActiveTopIndex(topIdx);

      // Find bottom that matches style
      const botIdx = bottoms.findIndex((b) => b.occasions.includes(selectedOccasion) || b.style === selectedStyle);
      if (botIdx !== -1) setActiveBottomIndex(botIdx !== -1 ? botIdx : 0);

      // Shoes
      const shoeIdx = shoes.findIndex((s) => s.occasions.includes(selectedOccasion));
      if (shoeIdx !== -1) setActiveShoesIndex(shoeIdx);

      // Outerwear
      if (outerwears.length > 0) {
        const outerIdx = outerwears.findIndex((o) => o.occasions.includes(selectedOccasion));
        if (outerIdx !== -1) setActiveOuterIndex(outerIdx);
      }

      setIsSynthesizing(false);
    }, 450);
  };

  const handleWearToday = async () => {
    if (!currentTop || !currentBottom) return;
    const pieces = [currentTop, currentBottom, currentOuter, currentShoes, currentAcc].filter(Boolean) as WardrobeItem[];
    
    await outfitService.recordOutfitWorn({
      id: `curated-${Date.now()}`,
      title: `${selectedOccasion.toUpperCase()} • ${currentTop.name} & ${currentBottom.name}`,
      occasion: selectedOccasion,
      style: selectedStyle,
      items: pieces,
      reasoning: 'Curated ensemble selected directly from your personal studio board.',
      stylingTip: 'Proportion balanced flat-lay composition.',
      compatibilityScore: 98,
      createdAt: new Date().toISOString(),
    });

    setWornSuccess(true);
    setTimeout(() => setWornSuccess(false), 3000);
  };

  const handleSendToMirror = () => {
    navigate('/try-on');
  };

  const occasionPresets: Array<{ id: OccasionType; label: string }> = [
    { id: 'college', label: 'Campus & Lecture' },
    { id: 'casual', label: 'Downtown Coffee' },
    { id: 'date', label: 'Sunset Dinner' },
    { id: 'party', label: 'Evening Social' },
    { id: 'formal', label: 'Tailored Meeting' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-white bg-[#0e244d] px-2.5 py-1 rounded-full border border-[#1e3a8a]">
            L'Atelier Styliste
          </span>
          <h1 className="font-editorial text-3xl md:text-4xl text-slate-900 font-bold mt-2">
            Curated Outfit Board
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 max-w-xl font-sans-clean leading-relaxed">
            Every ensemble is composed directly from your cataloged closet with balanced silhouette proportions and color theory. Swap pieces in real-time.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleAutoCurate}
            disabled={isSynthesizing}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0e244d] text-white hover:bg-[#15346d] border border-[#1e3a8a] transition-all text-xs font-semibold tracking-wide cursor-pointer active:scale-95 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSynthesizing ? 'animate-spin' : ''}`} />
            <span>{isSynthesizing ? 'Composing...' : 'Auto-Curate Look'}</span>
          </button>
        </div>
      </div>

      {/* Curator Vibe Bar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Occasion Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {occasionPresets.map((occ) => {
            const isSelected = selectedOccasion === occ.id;
            return (
              <button
                key={occ.id}
                onClick={() => {
                  setSelectedOccasion(occ.id);
                  handleAutoCurate();
                }}
                className={`px-4 py-2 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer font-medium ${
                  isSelected
                    ? 'bg-[#0e244d] text-white font-semibold border border-[#1e3a8a] shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:text-[#0e244d] hover:bg-slate-100 border border-slate-200/70'
                }`}
              >
                {occ.label}
              </button>
            );
          })}
        </div>

        {/* Weather condition */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-full border border-slate-200/80">
          {[
            { id: 'warm', label: 'Warm', icon: Sun },
            { id: 'mild', label: 'Mild', icon: Sun },
            { id: 'cold', label: 'Chilly', icon: Snowflake },
          ].map((w) => {
            const Icon = w.icon;
            const isSelected = selectedWeather === w.id;
            return (
              <button
                key={w.id}
                onClick={() => setSelectedWeather(w.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] transition-colors cursor-pointer font-medium ${
                  isSelected
                    ? 'bg-white text-blue-700 font-bold shadow-sm border border-blue-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3 h-3 text-blue-600" />
                <span>{w.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Styling Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Flat-Lay Editorial Board (7 cols) - Obsidian Black Studio */}
        <div className="lg:col-span-7 rounded-3xl bg-[#060a14] border border-blue-900/60 shadow-2xl p-6 sm:p-8 relative overflow-hidden text-white">
          {/* Subtle Ambient Sky Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/[0.08] rounded-full blur-3xl pointer-events-none" />

          {/* Canvas Header */}
          <div className="flex items-center justify-between mb-8 relative z-10">
            <span className="text-[10px] tracking-widest uppercase font-bold text-blue-300 bg-blue-950/80 px-2.5 py-1 rounded-full border border-blue-800/80">
              Silhouette Flat-Lay • Look 01
            </span>
            <span className="text-xs text-slate-400 font-sans-clean font-medium">
              Click arrows to remix pieces
            </span>
          </div>

          {/* Interactive Flat-Lay Composition */}
          <div className="space-y-4 max-w-md mx-auto relative z-10">
            {/* 1. Outerwear Layer (if selected) */}
            {currentOuter && (
              <div className="relative group rounded-2xl bg-[#0b1329] border border-blue-900/40 hover:border-blue-400 p-3 flex items-center justify-between transition-all shadow-md">
                <div className="flex items-center gap-3.5">
                  <img
                    src={currentOuter.imageUrl}
                    alt={currentOuter.name}
                    className="w-16 h-18 object-cover rounded-xl bg-black border border-blue-900/40 shadow-sm"
                  />
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-blue-400 font-bold">
                      Outer Layer
                    </span>
                    <h4 className="text-xs font-bold text-white truncate max-w-[200px]">
                      {currentOuter.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{currentOuter.brand} • {currentOuter.color}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveOuterIndex((prev) => (prev > 0 ? prev - 1 : outerwears.length - 1))}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-blue-600 border border-white/10 flex items-center justify-center text-white transition-colors cursor-pointer shadow-sm"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveOuterIndex((prev) => prev + 1)}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-blue-600 border border-white/10 flex items-center justify-center text-white transition-colors cursor-pointer shadow-sm"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* 2. Top Garment */}
            {currentTop && (
              <div className="relative group rounded-2xl bg-[#0b1329] border border-blue-900/40 hover:border-blue-400 p-3 flex items-center justify-between transition-all shadow-md">
                <div className="flex items-center gap-3.5">
                  <img
                    src={currentTop.imageUrl}
                    alt={currentTop.name}
                    className="w-16 h-18 object-cover rounded-xl bg-black border border-blue-900/40 shadow-sm"
                  />
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-blue-400 font-bold">
                      Base Top
                    </span>
                    <h4 className="text-xs font-bold text-white truncate max-w-[200px]">
                      {currentTop.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{currentTop.brand} • {currentTop.color}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveTopIndex((prev) => (prev > 0 ? prev - 1 : tops.length - 1))}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-blue-600 border border-white/10 flex items-center justify-center text-white transition-colors cursor-pointer shadow-sm"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveTopIndex((prev) => prev + 1)}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-blue-600 border border-white/10 flex items-center justify-center text-white transition-colors cursor-pointer shadow-sm"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* 3. Bottom Trousers/Denim */}
            {currentBottom && (
              <div className="relative group rounded-2xl bg-[#0b1329] border border-blue-900/40 hover:border-blue-400 p-3 flex items-center justify-between transition-all shadow-md">
                <div className="flex items-center gap-3.5">
                  <img
                    src={currentBottom.imageUrl}
                    alt={currentBottom.name}
                    className="w-16 h-20 object-cover rounded-xl bg-black border border-blue-900/40 shadow-sm"
                  />
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-blue-400 font-bold">
                      Trouser / Bottom
                    </span>
                    <h4 className="text-xs font-bold text-white truncate max-w-[200px]">
                      {currentBottom.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{currentBottom.brand} • {currentBottom.color}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveBottomIndex((prev) => (prev > 0 ? prev - 1 : bottoms.length - 1))}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-blue-600 border border-white/10 flex items-center justify-center text-white transition-colors cursor-pointer shadow-sm"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveBottomIndex((prev) => prev + 1)}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-blue-600 border border-white/10 flex items-center justify-center text-white transition-colors cursor-pointer shadow-sm"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* 4. Footwear & Accent Accessory Row */}
            <div className="grid grid-cols-2 gap-3">
              {currentShoes && (
                <div className="rounded-2xl bg-[#0b1329] border border-blue-900/40 hover:border-blue-400 p-3 flex flex-col justify-between shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] uppercase tracking-wider text-blue-400 font-bold">
                      Footwear
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setActiveShoesIndex((prev) => (prev > 0 ? prev - 1 : shoes.length - 1))}
                        className="w-5 h-5 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-blue-600 shadow-sm"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setActiveShoesIndex((prev) => prev + 1)}
                        className="w-5 h-5 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-blue-600 shadow-sm"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <img
                    src={currentShoes.imageUrl}
                    alt={currentShoes.name}
                    className="w-full h-20 object-cover rounded-xl bg-black border border-blue-900/40 mb-2 shadow-sm"
                  />
                  <p className="text-xs font-bold text-white truncate">{currentShoes.name}</p>
                  <p className="text-[10px] text-slate-400">{currentShoes.color}</p>
                </div>
              )}

              {currentAcc && (
                <div className="rounded-2xl bg-[#0b1329] border border-blue-900/40 hover:border-blue-400 p-3 flex flex-col justify-between shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] uppercase tracking-wider text-blue-400 font-bold">
                      Accent Piece
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setActiveAccIndex((prev) => (prev > 0 ? prev - 1 : accessories.length - 1))}
                        className="w-5 h-5 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-blue-600 shadow-sm"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setActiveAccIndex((prev) => prev + 1)}
                        className="w-5 h-5 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-blue-600 shadow-sm"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <img
                    src={currentAcc.imageUrl}
                    alt={currentAcc.name}
                    className="w-full h-20 object-cover rounded-xl bg-black border border-blue-900/40 mb-2 shadow-sm"
                  />
                  <p className="text-xs font-bold text-white truncate">{currentAcc.name}</p>
                  <p className="text-[10px] text-slate-400">{currentAcc.color}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Stylist Critique & Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Stylist Breakdown Card */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[9px] uppercase tracking-widest font-bold text-[#0e244d]">
                  Harmonized Proportion
                </span>
                <h3 className="font-editorial text-2xl text-slate-900 font-bold mt-0.5">
                  Stylist's Analysis
                </h3>
              </div>
              <div className="text-right">
                <span className="text-3xl font-editorial font-bold text-[#0e244d]">98%</span>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Couture Score</p>
              </div>
            </div>

            {/* Critique Points */}
            <div className="space-y-3 text-xs text-slate-600 font-sans-clean leading-relaxed">
              <div className="p-4 rounded-2xl bg-[#f0f4fa] border border-[#c8d7eb]/80">
                <strong className="text-slate-900 block mb-1">Color Palette Dialogue:</strong>
                <span>
                  The crisp contrast between <span className="font-semibold text-[#0e244d]">{currentTop?.color}</span> and <span className="font-semibold text-[#0e244d]">{currentBottom?.color}</span> anchors the outfit in classic neutral theory. Footwear in <span className="font-semibold text-[#0e244d]">{currentShoes?.color}</span> grounds the visual weight.
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#f0f4fa] border border-[#c8d7eb]/80">
                <strong className="text-slate-900 block mb-1">Occasion Etiquette:</strong>
                <span>
                  Configured specifically for <span className="text-slate-900 capitalize font-bold">{selectedOccasion}</span>. The drape avoids being overly rigid while remaining distinctly intentional and sharp.
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                onClick={handleWearToday}
                disabled={wornSuccess}
                className={`w-full py-3.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm ${
                  wornSuccess
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-[#0e244d] text-white hover:bg-[#15346d] border border-[#1e3a8a]'
                }`}
              >
                {wornSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Calendar className="w-4 h-4" />}
                <span>{wornSuccess ? 'Saved to Lookbook ✓' : 'Save This Look'}</span>
              </button>

              <button
                onClick={handleSendToMirror}
                className="w-full py-3.5 rounded-full bg-white hover:bg-slate-100 text-[#0e244d] border border-slate-300 text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 group shadow-sm"
              >
                <Eye className="w-4 h-4 text-[#0e244d]" />
                <span>Test in Virtual Fitting Mirror</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Quick Tip Pill */}
          <div className="p-5 rounded-3xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700 font-sans-clean leading-relaxed">
              <strong className="text-slate-900 font-semibold">Proportion Tip:</strong> When styling relaxed bottoms like wide trousers, ensure the top hem falls cleanly at the belt line to maintain a 1:2 height ratio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
