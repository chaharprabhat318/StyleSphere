import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Layers,
  Calendar,
  Eye,
  ArrowRight,
  SunMedium,
  Check,
  ShoppingBag,
} from 'lucide-react';
import type { WardrobeItem } from '../types/wardrobe';
import { wardrobeService } from '../services/wardrobeService';
import { outfitService } from '../services/outfitService';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [todayWorn, setTodayWorn] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await wardrobeService.getItems();
      setItems(data);
    };
    load();
  }, []);

  // Today's Hero Look pieces
  const heroTop = items.find((i) => i.id === 'item-1') || items[0];
  const heroBottom = items.find((i) => i.id === 'item-2') || items[1];
  const heroOuter = items.find((i) => i.id === 'item-5') || items[2];
  const heroShoes = items.find((i) => i.id === 'item-4') || items[3];

  const handleWearHeroLook = async () => {
    if (!heroTop || !heroBottom) return;
    const pieces = [heroTop, heroBottom, heroOuter, heroShoes].filter(Boolean) as WardrobeItem[];
    await outfitService.recordOutfitWorn({
      id: `hero-${Date.now()}`,
      title: "Today's Signature Autumn Lookbook",
      occasion: 'casual',
      style: 'minimal',
      items: pieces,
      reasoning: 'Effortless neutral balance optimized for 19°C autumn conditions.',
      stylingTip: 'Layer overshirt open with clean chalk sneakers.',
      compatibilityScore: 99,
      createdAt: new Date().toISOString(),
    });
    setTodayWorn(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Top Editorial Magazine Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-md p-8 md:p-12">
        {/* Soft Ambient Sky Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/[0.06] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Headline & Editorial Copy (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest uppercase font-bold text-white bg-[#0e244d] px-2.5 py-1 rounded-full border border-[#1e3a8a]">
                L'Édition du Jour • 14 Octobre
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                <SunMedium className="w-3.5 h-3.5 text-slate-700" />
                19°C Mild Autumn
              </span>
            </div>

            <h1 className="font-editorial text-4xl sm:text-5xl text-slate-900 font-bold leading-[1.1] tracking-tight">
              Dress with quiet <br />
              <span className="text-[#0e244d]">confidence.</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 font-sans-clean leading-relaxed max-w-lg">
              StyleSphere curates seamless ensembles from your existing wardrobe, preventing repetitive wear fatigue and elevating your everyday personal aesthetic.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/recommendations')}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#0e244d] text-white hover:bg-[#15346d] border border-[#1e3a8a] transition-all font-semibold text-xs tracking-wide cursor-pointer shadow-sm active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Open Outfit Studio</span>
              </button>

              <button
                onClick={() => navigate('/try-on')}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#050811] hover:bg-[#0c1328] text-white border border-slate-800 transition-all font-semibold text-xs tracking-wide cursor-pointer shadow-sm"
              >
                <Eye className="w-4 h-4 text-blue-300" />
                <span>Virtual Try-On</span>
              </button>
            </div>
          </div>

          {/* Today's Curated Hero Flat-Lay Card (5 cols) - Obsidian Black with Navy & White accents */}
          <div className="lg:col-span-5 rounded-3xl bg-[#060a14] border border-slate-800 p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] tracking-widest uppercase font-bold text-slate-400">
                Look of the Day
              </span>
              <span className="text-[11px] font-bold text-blue-200 bg-[#0e244d] px-2.5 py-0.5 rounded-full border border-[#1e3a8a]">
                99% Harmony
              </span>
            </div>

            {/* 4-Item Mini Collage */}
            <div className="grid grid-cols-4 gap-2">
              {[heroOuter, heroTop, heroBottom, heroShoes].filter(Boolean).map((piece, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 relative group shadow-sm">
                  <img src={piece.imageUrl} alt={piece.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 p-1 bg-black/80 backdrop-blur-xs text-[8px] text-white truncate text-center font-medium">
                    {piece.name}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Chalk & Selvedge Indigo</p>
                <p className="text-[10px] text-slate-400">Campus • Coffee • Casual</p>
              </div>

              <button
                onClick={handleWearHeroLook}
                disabled={todayWorn}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                  todayWorn
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-[#0e244d] text-white hover:bg-[#15346d] border border-[#1e3a8a]'
                }`}
              >
                {todayWorn ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Calendar className="w-3.5 h-3.5" />}
                <span>{todayWorn ? 'Saved to Lookbook ✓' : 'Save Look'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Wardrobe Metrics Strip: Pure White, Jet Black, and Deep Navy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Crisp White */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2 hover:border-[#1e3a8a] transition-colors">
          <div className="flex items-center justify-between text-xs">
            <span className="uppercase tracking-widest font-bold text-[10px] text-slate-400">Capsule Health</span>
            <Layers className="w-4 h-4 text-[#0e244d]" />
          </div>
          <div className="font-editorial text-3xl text-slate-900 font-bold">
            {items.length} <span className="text-base text-slate-500 font-sans font-normal">Garments</span>
          </div>
          <p className="text-xs text-slate-500 font-sans-clean">
            94% Capsule mixability ratio across tops, bottoms, and layers.
          </p>
        </div>

        {/* Card 2: Obsidian Black */}
        <div className="p-6 rounded-3xl bg-[#060a14] border border-slate-800 shadow-md space-y-2 hover:border-[#1e3a8a] transition-colors text-white">
          <div className="flex items-center justify-between text-xs">
            <span className="uppercase tracking-widest font-bold text-[10px] text-slate-400">Smart Shopping</span>
            <ShoppingBag className="w-4 h-4 text-blue-300" />
          </div>
          <div className="font-editorial text-3xl text-white font-bold">
            4 <span className="text-base text-slate-400 font-sans font-normal">Staple Gaps</span>
          </div>
          <p className="text-xs text-slate-300 font-sans-clean">
            Identified pieces to maximize your outfit combinations.
          </p>
        </div>

        {/* Card 3: Deep Navy Blue */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#07132c] to-[#0e214d] border border-blue-700/50 shadow-md space-y-2 hover:border-blue-300 transition-colors text-white">
          <div className="flex items-center justify-between text-xs">
            <span className="uppercase tracking-widest font-bold text-[10px] text-blue-200">Style Palette</span>
            <Sparkles className="w-4 h-4 text-blue-300" />
          </div>
          <div className="font-editorial text-3xl text-white font-bold">
            Nordic Minimal
          </div>
          <p className="text-xs text-blue-200/80 font-sans-clean">
            Predominantly ivory, raw selvedge, and navy tones.
          </p>
        </div>
      </div>

      {/* Quick Action Navigation Tiles: 1 Crisp White, 1 Obsidian Black */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/recommendations"
          className="group p-8 rounded-3xl bg-white border border-slate-200/90 hover:border-[#1e3a8a] hover:shadow-xl transition-all flex items-center justify-between"
        >
          <div className="space-y-2 max-w-sm">
            <span className="text-[10px] tracking-widest uppercase font-bold text-[#0e244d]">
              Interactive Stylist
            </span>
            <h3 className="font-editorial text-2xl text-slate-900 font-bold">
              Compose Outfits on Flat-Lay Canvas
            </h3>
            <p className="text-xs text-slate-500 font-sans-clean leading-relaxed">
              Mix and match layers, tops, and footwear in real-time with automatic color-harmony scoring.
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#f0f4fa] group-hover:bg-[#0e244d] group-hover:text-white flex items-center justify-center text-[#0e244d] transition-all shrink-0 shadow-sm">
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        <Link
          to="/try-on"
          className="group p-8 rounded-3xl bg-[#060a14] border border-slate-800 hover:border-[#1e3a8a] hover:shadow-xl transition-all flex items-center justify-between text-white"
        >
          <div className="space-y-2 max-w-sm">
            <span className="text-[10px] tracking-widest uppercase font-bold text-blue-300">
              Virtual Try-On
            </span>
            <h3 className="font-editorial text-2xl text-white font-bold">
              Simulate Fit & Silhouette Drape
            </h3>
            <p className="text-xs text-slate-300 font-sans-clean leading-relaxed">
              Upload your silhouette or choose studio models to preview how garments drape on your body.
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#0a1124] border border-slate-800 group-hover:bg-[#0e244d] group-hover:text-white flex items-center justify-center text-blue-300 transition-all shrink-0 shadow-sm">
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
};
