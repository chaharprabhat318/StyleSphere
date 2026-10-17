import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  RefreshCw,
  Bookmark,
  Check,
  Eye,
  Sliders,
  X,
  Shuffle,
  SunMedium,
  Snowflake,
  Sun,
} from 'lucide-react';
import type { OccasionType, StyleVibe, WardrobeItem } from '../types/wardrobe';
import type { OutfitRecommendation, RecommendationCriteria } from '../types/outfit';
import { outfitService } from '../services/outfitService';
import { wardrobeService } from '../services/wardrobeService';

export const RecommendationsPage: React.FC = () => {
  const navigate = useNavigate();

  // Criteria State
  const [occasion, setOccasion] = useState<OccasionType>('casual');
  const [style, setStyle] = useState<StyleVibe>('minimal');
  const [gender, setGender] = useState<'all' | 'men' | 'women'>('all');
  const [weather, setWeather] = useState<'mild' | 'warm' | 'cold'>('mild');
  const [preferredColor, setPreferredColor] = useState<string>('all');

  // Generation & Results State (Manual trigger only)
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<OutfitRecommendation[]>([]);
  const [selectedOutfitIndex, setSelectedOutfitIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Wardrobe archive for swapping
  const [allItems, setAllItems] = useState<WardrobeItem[]>([]);
  const [swappingSlot, setSwappingSlot] = useState<WardrobeItem | null>(null);

  // View mode: 'generator' | 'saved'
  const [activeTab, setActiveTab] = useState<'generator' | 'saved'>('generator');
  const [savedOutfits, setSavedOutfits] = useState<OutfitRecommendation[]>([]);

  // On mount: load wardrobe and saved outfits only (NO AUTO-GENERATION)
  useEffect(() => {
    const loadInitial = async () => {
      const wardrobe = await wardrobeService.getItems();
      setAllItems(wardrobe);
      const saved = await outfitService.getSavedOutfits();
      setSavedOutfits(saved);
    };
    loadInitial();
  }, []);

  const loadSaved = async () => {
    const saved = await outfitService.getSavedOutfits();
    setSavedOutfits(saved);
  };

  // Explicit User Action: Click to Generate
  const handleGenerateOutfits = async () => {
    setIsGenerating(true);

    const activeCriteria: RecommendationCriteria = {
      occasion,
      style,
      gender,
      weather,
      preferredColor: preferredColor !== 'all' ? preferredColor : undefined,
    };

    // Deliberate synthesis delay for neural feedback feel
    setTimeout(async () => {
      const results = await outfitService.generateRecommendations(activeCriteria);
      setRecommendations(results);
      setSelectedOutfitIndex(0);
      setHasGenerated(true);
      setIsGenerating(false);
    }, 500);
  };

  const activeOutfit: OutfitRecommendation | undefined = recommendations[selectedOutfitIndex];

  const handleSaveActiveOutfit = async () => {
    if (!activeOutfit) return;
    await outfitService.saveOutfit(activeOutfit);
    setSavedSuccess(true);
    loadSaved();
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSwapPiece = (newItem: WardrobeItem) => {
    if (!activeOutfit || !swappingSlot) return;

    // Replace swappingSlot with newItem in the activeOutfit's items list
    const updatedItems = activeOutfit.items.map((item) =>
      item.id === swappingSlot.id ? newItem : item
    );

    const updatedRecs = [...recommendations];
    updatedRecs[selectedOutfitIndex] = {
      ...activeOutfit,
      items: updatedItems,
      compatibilityScore: Math.min(100, Math.max(88, activeOutfit.compatibilityScore + Math.floor(Math.random() * 5) - 2)),
    };

    setRecommendations(updatedRecs);
    setSwappingSlot(null);
  };

  const occasionsList: Array<{ id: OccasionType; label: string }> = [
    { id: 'casual', label: 'Everyday Casual' },
    { id: 'college', label: 'College / Campus' },
    { id: 'date', label: 'Dinner & Date' },
    { id: 'party', label: 'Evening Social' },
    { id: 'formal', label: 'Formal / Office' },
  ];

  const stylesList: Array<{ id: StyleVibe; label: string }> = [
    { id: 'minimal', label: 'Minimalist' },
    { id: 'smart casual', label: 'Smart Casual' },
    { id: 'streetwear', label: 'Streetwear' },
    { id: 'classic', label: 'Classic' },
    { id: 'cozy', label: 'Cozy' },
  ];

  const weatherOptions: Array<{ id: 'warm' | 'mild' | 'cold'; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'warm', label: 'Warm (25°C+)', icon: Sun },
    { id: 'mild', label: 'Mild (18°C–22°C)', icon: SunMedium },
    { id: 'cold', label: 'Cold Layering (<15°C)', icon: Snowflake },
  ];

  const colorPalettes = [
    { id: 'all', label: 'All Palette' },
    { id: 'white', label: 'Crisp White' },
    { id: 'navy', label: 'Navy & Blue' },
    { id: 'black', label: 'Monochrome' },
    { id: 'beige', label: 'Earth & Neutral' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Editorial Header (No weather badge) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-white bg-[#0e244d] px-2.5 py-1 rounded-full border border-[#1e3a8a]">
              Neural Wardrobe Stylist
            </span>
            <span className="text-[10px] font-bold text-[#132d5e] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Wardrobe Color Theory Engine
            </span>
          </div>
          <h1 className="font-editorial text-3xl md:text-4xl text-slate-900 font-bold mt-2">
            AI Outfit Generator
          </h1>
          <p className="text-xs text-slate-600 mt-1.5 max-w-2xl font-sans-clean leading-relaxed">
            Specify your occasion, aesthetic vibe, and layering preferences below. Click &quot;Generate AI Outfits&quot; to synthesize mathematically harmonized looks from your wardrobe.
          </p>
        </div>

        {/* View Mode Toggle: Generator vs Saved */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs font-bold">
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'generator'
                ? 'bg-[#0e244d] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generator</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'saved'
                ? 'bg-[#0e244d] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Outfits ({savedOutfits.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'generator' && (
        <>
          {/* Systematic Criteria Filter Panel */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#0e244d]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Select Outfit Parameters
                </h2>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Category switcher */}
                <div className="inline-flex items-center p-1 bg-slate-100 rounded-full border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 hidden sm:inline">
                    Category:
                  </span>
                  {(['all', 'men', 'women'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                        gender === g
                          ? 'bg-[#0e244d] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {g === 'all' ? 'All' : g === 'men' ? 'Men' : 'Women'}
                    </button>
                  ))}
                </div>

                <span className="text-[11px] text-slate-500 hidden md:inline">
                  {allItems.length} Pieces Available
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* 1. Occasion */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Occasion
                </label>
                <div className="flex flex-col gap-1.5">
                  {occasionsList.map((occ) => (
                    <button
                      key={occ.id}
                      onClick={() => setOccasion(occ.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
                        occasion === occ.id
                          ? 'bg-[#0e244d] text-white shadow-xs'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                      }`}
                    >
                      {occ.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Style Vibe */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Style Aesthetic
                </label>
                <div className="flex flex-col gap-1.5">
                  {stylesList.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setStyle(st.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
                        style === st.id
                          ? 'bg-[#0e244d] text-white shadow-xs'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Layering / Climate Condition */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Layering Condition
                </label>
                <div className="flex flex-col gap-1.5">
                  {weatherOptions.map((w) => {
                    const Icon = w.icon;
                    return (
                      <button
                        key={w.id}
                        onClick={() => setWeather(w.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold text-left flex items-center gap-2 transition-all ${
                          weather === w.id
                            ? 'bg-[#0e244d] text-white shadow-xs'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{w.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Color Palette & Primary Action Button */}
              <div className="space-y-2 flex flex-col justify-between">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Preferred Color Anchor
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {colorPalettes.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setPreferredColor(c.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                          preferredColor === c.id
                            ? 'bg-[#0e244d] text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={handleGenerateOutfits}
                    disabled={isGenerating}
                    className="w-full py-3.5 rounded-2xl bg-[#0a1124] hover:bg-[#0e244d] text-white text-xs font-bold font-sans-clean transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 active:scale-98"
                  >
                    <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>{isGenerating ? 'Synthesizing Outfits...' : 'Generate AI Outfits'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Prompt State: When user hasn't clicked generate yet */}
          {!hasGenerated && !isGenerating && (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0e244d] text-white flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="w-7 h-7 text-blue-200" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="font-editorial text-2xl font-bold text-slate-900">
                  Ready to Synthesize Your Outfits
                </h3>
                <p className="text-xs text-slate-500 font-sans-clean leading-relaxed">
                  Choose your parameters above and click <strong>&quot;Generate AI Outfits&quot;</strong> to view coordinated recommendations from your wardrobe.
                </p>
              </div>
              <button
                onClick={handleGenerateOutfits}
                className="px-6 py-3 rounded-2xl bg-[#0e244d] hover:bg-[#132d5e] text-white text-xs font-bold font-sans-clean transition-all shadow-md active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>Generate AI Outfits</span>
              </button>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="p-16 text-center rounded-3xl bg-[#060a14] border border-slate-800 text-white shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-full border-2 border-blue-400 border-t-transparent animate-spin mx-auto" />
              <h3 className="font-editorial text-xl font-bold">Synthesizing Outfits...</h3>
              <p className="text-xs text-slate-400">Evaluating color theory, silhouettes, and occasion rules</p>
            </div>
          )}

          {/* Generated Recommendations Showcase */}
          {hasGenerated && !isGenerating && recommendations.length > 0 && activeOutfit && (
            <div className="space-y-6">
              {/* Look Selector Tabs */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  {recommendations.map((rec, idx) => (
                    <button
                      key={rec.id}
                      onClick={() => setSelectedOutfitIndex(idx)}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                        selectedOutfitIndex === idx
                          ? 'bg-[#060a14] text-white shadow-md'
                          : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span>Look 0{idx + 1}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-300">
                        {rec.compatibilityScore}%
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveActiveOutfit}
                    disabled={savedSuccess}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-bold transition-colors shadow-xs"
                  >
                    {savedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Saved to Collection</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Save Outfit</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => navigate('/try-on')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0e244d] hover:bg-[#132d5e] text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-300" />
                    <span>Virtual Try-On</span>
                  </button>
                </div>
              </div>

              {/* Main Outfit Display Card */}
              <div className="rounded-3xl bg-[#060a14] border border-slate-800 p-6 md:p-8 text-white shadow-2xl space-y-6">
                {/* Outfit Title & Harmony Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-[#0b1329] px-2.5 py-0.5 rounded-full border border-slate-700">
                        {activeOutfit.occasion} • {activeOutfit.style}
                      </span>
                      {activeOutfit.gender && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          activeOutfit.gender === 'women'
                            ? 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                            : 'bg-blue-950/60 text-blue-300 border-blue-800/60'
                        }`}>
                          {activeOutfit.gender}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {activeOutfit.items.length} Coordinated Pieces
                      </span>
                    </div>
                    <h3 className="font-editorial text-2xl md:text-3xl font-bold mt-1 text-white">
                      {activeOutfit.title}
                    </h3>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-editorial font-bold text-white">
                      {activeOutfit.compatibilityScore}%
                    </span>
                    <span className="text-xs text-blue-300 font-semibold uppercase tracking-wider">
                      Color Harmony
                    </span>
                  </div>
                </div>

                {/* Items Grid (Horizontal Grid of All Coordinated Pieces) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {activeOutfit.items.map((piece) => (
                    <div
                      key={piece.id}
                      className="rounded-2xl bg-[#0b1329] border border-slate-800 p-3.5 flex flex-col justify-between space-y-3 group relative"
                    >
                      <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 relative">
                        <img
                          src={piece.imageUrl}
                          alt={piece.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[9px] font-bold uppercase tracking-wider text-slate-300">
                            {piece.category}
                          </span>
                          {piece.gender && (
                            <span className="px-1.5 py-0.5 rounded-md bg-blue-950/80 backdrop-blur-md text-[9px] font-bold uppercase tracking-wider text-blue-300">
                              {piece.gender}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] uppercase font-bold text-blue-300 block truncate">
                          {piece.brand || 'Wardrobe Staple'}
                        </span>
                        <h4 className="text-xs font-bold text-white truncate mt-0.5">
                          {piece.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: piece.color.toLowerCase() }}
                          />
                          <span className="text-[10px] text-slate-400 capitalize truncate">
                            {piece.color}
                          </span>
                        </div>
                      </div>

                      {/* Swap Piece Button */}
                      <button
                        onClick={() => setSwappingSlot(piece)}
                        className="w-full py-1.5 px-2 rounded-xl bg-slate-800/80 hover:bg-[#0e244d] text-slate-300 hover:text-white text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Shuffle className="w-3 h-3" />
                        <span>Swap Piece</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* AI Stylist Critique & Rationale */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                      Why This Works Together
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans-clean">
                      {activeOutfit.reasoning}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Stylist Proportion Tip
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans-clean">
                      {activeOutfit.stylingTip}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Saved Outfits Tab */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-editorial text-2xl text-slate-900 font-bold">
              Your Saved Outfits ({savedOutfits.length})
            </h2>
            <span className="text-xs text-slate-500">
              Personalized looks curated and bookmarked by you
            </span>
          </div>

          {savedOutfits.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-3">
              <Bookmark className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-editorial text-xl font-bold text-slate-800">
                No saved outfits yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Generate an outfit above and click &quot;Save Outfit&quot; to bookmark your favorite looks here.
              </p>
              <button
                onClick={() => setActiveTab('generator')}
                className="px-5 py-2.5 rounded-full bg-[#0e244d] text-white text-xs font-bold"
              >
                Back to Generator
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedOutfits.map((outfit) => (
                <div
                  key={outfit.id}
                  className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0e244d] bg-blue-50 px-2.5 py-0.5 rounded-full">
                        {outfit.occasion} • {outfit.style}
                      </span>
                      <h4 className="font-editorial text-xl font-bold text-slate-900 mt-1">
                        {outfit.title}
                      </h4>
                    </div>
                    <span className="font-editorial text-2xl font-bold text-[#0e244d]">
                      {outfit.compatibilityScore}%
                    </span>
                  </div>

                  {/* Collage */}
                  <div className="grid grid-cols-4 gap-2">
                    {outfit.items.map((item) => (
                      <div key={item.id} className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-100">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    {outfit.reasoning}
                  </p>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => navigate('/try-on')}
                      className="flex-1 py-2.5 rounded-xl bg-[#0a1124] hover:bg-[#0e244d] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-300" />
                      <span>Try On</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Interactive Piece Swap Modal */}
      {swappingSlot && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 border border-slate-200 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#0e244d]">
                  Swap {swappingSlot.category}
                </span>
                <h3 className="font-editorial text-xl font-bold text-slate-900">
                  Select Alternative {swappingSlot.category}
                </h3>
              </div>
              <button
                onClick={() => setSwappingSlot(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Currently using: <strong className="text-slate-800">{swappingSlot.name}</strong> ({swappingSlot.color}). Choose another item from your closet to replace it:
            </p>

            <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1 scrollbar-thin">
              {allItems
                .filter((item) => {
                  if (item.category !== swappingSlot.category || item.id === swappingSlot.id) return false;
                  if (gender !== 'all') {
                    return item.gender === gender || item.gender === 'unisex';
                  }
                  return true;
                })
                .map((altItem) => (
                  <button
                    key={altItem.id}
                    onClick={() => handleSwapPiece(altItem)}
                    className="p-2 rounded-2xl border border-slate-200 hover:border-[#1e3a8a] hover:bg-blue-50/40 text-left transition-all group"
                  >
                    <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 mb-2">
                      <img src={altItem.imageUrl} alt={altItem.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] text-slate-400 capitalize block truncate">
                      {altItem.color}
                    </span>
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-[#0e244d]">
                      {altItem.name}
                    </p>
                  </button>
                ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSwappingSlot(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
