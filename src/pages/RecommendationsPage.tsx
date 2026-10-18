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
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Info,
  Layers,
} from 'lucide-react';
import type { OccasionType, StyleVibe, WardrobeItem, FashionArchetype } from '../types/wardrobe';
import type { OutfitRecommendation, RecommendationCriteria } from '../types/outfit';
import { outfitService, type CoverageWarning } from '../services/outfitService';
import { wardrobeService } from '../services/wardrobeService';

export const RecommendationsPage: React.FC = () => {
  const navigate = useNavigate();

  // Criteria State
  const [occasion, setOccasion] = useState<OccasionType>('casual');
  const [style, setStyle] = useState<StyleVibe>('minimal');
  const [archetype, setArchetype] = useState<FashionArchetype>('old money');
  const [gender, setGender] = useState<'all' | 'men' | 'women'>('all');
  const [weather, setWeather] = useState<'mild' | 'warm' | 'cold'>('mild');
  const [preferredColor, setPreferredColor] = useState<string>('all');

  // Wizard Stepper State: 1 = Occasion & Target, 2 = Aesthetic & Archetype, 3 = Climate & Color, 4 = Review & Synthesize
  const [wizardStep, setWizardStep] = useState<number>(1);

  // Generation & Results State (Manual trigger only)
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<OutfitRecommendation[]>([]);
  const [warnings, setWarnings] = useState<CoverageWarning[]>([]);
  const [selectedOutfitIndex, setSelectedOutfitIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [appliedCriteria, setAppliedCriteria] = useState<RecommendationCriteria | null>(null);
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
    const handleUpdate = () => loadInitial();
    window.addEventListener('stylesphere:wardrobe-updated', handleUpdate);
    return () => window.removeEventListener('stylesphere:wardrobe-updated', handleUpdate);
  }, []);

  const loadSaved = async () => {
    const saved = await outfitService.getSavedOutfits();
    setSavedOutfits(saved);
  };

  // Explicit User Action: Click to Generate with safe async handling
  const handleGenerateOutfits = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    const activeCriteria: RecommendationCriteria = {
      occasion,
      style,
      archetype,
      gender,
      weather,
      preferredColor: preferredColor !== 'all' ? preferredColor : undefined,
    };

    try {
      // Deliberate synthesis delay for neural feedback feel
      await new Promise((resolve) => setTimeout(resolve, 500));
      const result = await outfitService.generateRecommendations(activeCriteria);
      setRecommendations(result.recommendations);
      setWarnings(result.warnings);
      setAppliedCriteria(activeCriteria);
      setSelectedOutfitIndex(0);
      setHasGenerated(true);
    } catch (err) {
      console.error('Failed to generate outfits:', err);
      setGenerationError(
        err instanceof Error
          ? err.message
          : 'Unable to synthesize outfit recommendations. Please check your wardrobe items and try again.',
      );
    } finally {
      setIsGenerating(false);
    }
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

    // Reuse the exact RecommendationCriteria used when the outfit was scored.
    // Do not silently use potentially changed wizard state.
    const criteriaForScoring: RecommendationCriteria =
      activeOutfit.criteria ?? appliedCriteria ?? {
        occasion: activeOutfit.occasion,
        style: activeOutfit.style,
        archetype: activeOutfit.archetype,
        gender:
          activeOutfit.gender === 'women' || activeOutfit.gender === 'men'
            ? activeOutfit.gender
            : undefined,
      };

    const recalculated = outfitService.calculateCompatibilityScore(
      updatedItems,
      criteriaForScoring,
    );

    // Preserve the previous score only when recalculation genuinely cannot be performed (null)
    const finalScore = recalculated !== null ? recalculated : activeOutfit.compatibilityScore;

    const updatedRecs = [...recommendations];
    updatedRecs[selectedOutfitIndex] = {
      ...activeOutfit,
      items: updatedItems,
      compatibilityScore: finalScore,
    };

    setRecommendations(updatedRecs);
    setSwappingSlot(null);
  };

  const occasionsList: Array<{ id: OccasionType; label: string; desc: string }> = [
    { id: 'casual', label: 'Everyday Casual', desc: 'Relaxed daywear, coffee runs, and easy city outings' },
    { id: 'college', label: 'College / Campus', desc: 'Effortless lecture-to-library comfortable rotation' },
    { id: 'date', label: 'Dinner & Date', desc: 'Polished silhouette with subtle elevated contrast' },
    { id: 'party', label: 'Evening Social', desc: 'Nightlife vibrancy with bold texture play' },
    { id: 'formal', label: 'Formal / Office', desc: 'Structured tailoring and clean contemporary poise' },
  ];

  const stylesList: Array<{ id: StyleVibe; label: string; desc: string }> = [
    { id: 'minimal', label: 'Minimalist', desc: 'Restrained neutrals & clean lines' },
    { id: 'smart casual', label: 'Smart Casual', desc: 'Elevated staples & relaxed tailoring' },
    { id: 'streetwear', label: 'Streetwear', desc: 'Contemporary volume & urban energy' },
    { id: 'classic', label: 'Classic', desc: 'Timeless cuts & enduring silhouettes' },
    { id: 'cozy', label: 'Cozy', desc: 'Textured knits & relaxed comfort' },
  ];

  const archetypesList: Array<{ id: FashionArchetype; label: string; desc: string }> = [
    { id: 'old money', label: 'Old Money', desc: 'Quiet luxury, tailored cashmere, timeless heritage' },
    { id: 'streetwear', label: 'Streetwear', desc: 'Oversized silhouettes, drop sneakers, urban edge' },
    { id: 'minimalist', label: 'Minimalist', desc: 'Clean lines, monochromatic neutrals, effortless essentials' },
    { id: 'Y2K', label: 'Y2K', desc: 'Futuristic early 2000s, bold playful cuts, metallic vibes' },
    { id: 'dark academia', label: 'Dark Academia', desc: 'Tweed, oxford knits, collegiate scholar aesthetic' },
    { id: 'clean fit', label: 'Clean Fit', desc: 'Sharp tailoring, boxy tees, crisp modern proportions' },
    { id: 'techwear', label: 'Techwear', desc: 'Utilitarian fabrics, tactical accents, futuristic stealth' },
    { id: 'boho', label: 'Boho', desc: 'Free-spirited drape, artisanal textures, relaxed bohemian charm' },
    { id: 'vintage', label: 'Vintage', desc: 'Nostalgic classics, retro silhouettes, thrifted authenticity' },
    { id: 'luxe', label: 'Luxe', desc: 'High-glamour satin, rich fabrics, commanding evening presence' },
  ];

  const weatherOptions: Array<{ id: 'warm' | 'mild' | 'cold'; label: string; desc: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'warm', label: 'Warm (25°C+)', desc: 'Lightweight 2-piece base, breathable drape', icon: Sun },
    { id: 'mild', label: 'Mild (18°C–22°C)', desc: 'Versatile layering with light overshirts', icon: SunMedium },
    { id: 'cold', label: 'Cold Layering (<15°C)', desc: 'Full 3-piece layering with substantial outerwear', icon: Snowflake },
  ];

  const colorPalettes = [
    { id: 'all', label: 'All Palette', color: '#64748b', desc: 'Natural color harmony across closet' },
    { id: 'white', label: 'Crisp White', color: '#f8fafc', desc: 'Bright neutrals & ecru foundations' },
    { id: 'navy', label: 'Navy & Blue', color: '#1e3a8a', desc: 'Classic navy, indigo & denim' },
    { id: 'black', label: 'Monochrome', color: '#0f172a', desc: 'Obsidian, charcoal & dark tones' },
    { id: 'beige', label: 'Earth & Neutral', color: '#d4b996', desc: 'Warm camel, sand, khaki & oat' },
  ];

  // Effective wardrobe pool matching outfitService fallback behavior
  const { pool: effectivePool, isUsingFallback } = outfitService.getEffectivePool(
    allItems,
    gender,
  );

  const topsInPool = effectivePool.filter((i) => i.category === 'tops').length;
  const bottomsInPool = effectivePool.filter((i) => i.category === 'bottoms').length;
  const outerInPool = effectivePool.filter((i) => i.category === 'outerwear').length;
  const shoesInPool = effectivePool.filter((i) => i.category === 'footwear').length;
  const accInPool = effectivePool.filter((i) => i.category === 'accessories').length;

  const archetypeMatchesCount = effectivePool.filter((i) => i.archetype === archetype).length;
  const styleMatchesCount = effectivePool.filter((i) => i.style === style).length;
  const occasionMatchesCount = effectivePool.filter((i) => i.occasions.includes(occasion)).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Editorial Header */}
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
            Configure your occasion, aesthetic vibe, and layering preferences through our guided stylist wizard below.
            Synthesize mathematically harmonized looks calibrated to your actual wardrobe inventory.
          </p>
        </div>

        {/* View Mode Toggle: Generator vs Saved */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs font-bold">
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
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
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
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
          {/* Progressive Guided Stylist Wizard */}
          <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            {/* Stepper Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 gap-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#0e244d]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Guided Styling Wizard
                </h2>
              </div>

              {/* Progress Steps Indicator */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {[
                  { num: 1, label: 'Occasion' },
                  { num: 2, label: 'Aesthetic' },
                  { num: 3, label: 'Climate' },
                  { num: 4, label: 'Review' },
                ].map((s) => (
                  <button
                    key={s.num}
                    onClick={() => setWizardStep(s.num)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      wizardStep === s.num
                        ? 'bg-[#0e244d] text-white shadow-xs'
                        : wizardStep > s.num
                        ? 'bg-blue-50 text-[#132d5e] border border-blue-200'
                        : 'bg-slate-100 text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        wizardStep === s.num
                          ? 'bg-white text-[#0e244d]'
                          : wizardStep > s.num
                          ? 'bg-[#132d5e] text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {wizardStep > s.num ? '✓' : s.num}
                    </span>
                    <span className="hidden md:inline">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 1: Occasion & Department */}
            {wizardStep === 1 && (
              <div className="wizard-step space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-editorial text-xl font-bold text-slate-900">
                      Step 1: Choose Your Occasion & Wardrobe Focus
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select where you plan to wear this outfit and which closet category to pull from.
                    </p>
                  </div>

                  {/* Gender / Department toggle */}
                  <div className="inline-flex items-center p-1 bg-slate-100 rounded-full border border-slate-200 shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                      Department:
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {occasionsList.map((occ) => {
                    const isSelected = occasion === occ.id;
                    const count = effectivePool.filter((i) => i.occasions.includes(occ.id)).length;
                    return (
                      <button
                        key={occ.id}
                        onClick={() => setOccasion(occ.id)}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? 'bg-[#0e244d] border-[#0e244d] text-white shadow-sm ring-2 ring-blue-200'
                            : 'bg-slate-50 border-slate-200/90 text-slate-800 hover:bg-slate-100/80 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                            Occasion
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-blue-900 text-blue-200'
                                : count > 0
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {count} pieces
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold mt-1">{occ.label}</h4>
                          <p className={`text-xs mt-1 leading-relaxed ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                            {occ.desc}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-300 pt-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Active Selection</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    Selected: <strong className="text-slate-800">{occasionsList.find(o => o.id === occasion)?.label}</strong> ({gender === 'all' ? 'All Wardrobe' : isUsingFallback ? `${gender.toUpperCase()} (Fallback to All)` : gender.toUpperCase()})
                  </span>
                  <button
                    onClick={() => setWizardStep(2)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0e244d] hover:bg-[#132d5e] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <span>Next: Vibe & Archetype</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Aesthetic & Fashion Archetype */}
            {wizardStep === 2 && (
              <div className="wizard-step space-y-6">
                <div>
                  <h3 className="font-editorial text-xl font-bold text-slate-900">
                    Step 2: Aesthetic Vibe & Fashion Archetype
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Define the stylistic DNA and proportion philosophy for your curated look.
                  </p>
                </div>

                {/* Style Aesthetic Filter Chips */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                    Style Aesthetic Vibe
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {stylesList.map((st) => {
                      const isSelected = style === st.id;
                      const count = effectivePool.filter((i) => i.style === st.id).length;
                      return (
                        <button
                          key={st.id}
                          onClick={() => setStyle(st.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                            isSelected
                              ? 'bg-[#0e244d] text-white shadow-xs'
                              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          <span>{st.label}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-md ${
                              isSelected ? 'bg-blue-900 text-blue-200' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Archetype Cards Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                      Fashion Archetype (10 Available)
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Select one to guide silhouette and color framing
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {archetypesList.map((arch) => {
                      const isSelected = archetype === arch.id;
                      const count = effectivePool.filter((i) => i.archetype === arch.id).length;
                      return (
                        <button
                          key={arch.id}
                          onClick={() => setArchetype(arch.id)}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                            isSelected
                              ? 'bg-[#0e244d] border-[#0e244d] text-white shadow-sm ring-2 ring-blue-200'
                              : 'bg-slate-50 border-slate-200/90 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">{arch.label}</span>
                            <span
                              className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${
                                isSelected
                                  ? 'bg-blue-900 text-blue-200'
                                  : count > 0
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              {count > 0 ? `${count} in closet` : '0 tagged'}
                            </span>
                          </div>
                          <p className={`text-[11px] leading-relaxed line-clamp-2 ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                            {arch.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setWizardStep(1)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={() => setWizardStep(3)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0e244d] hover:bg-[#132d5e] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <span>Next: Climate & Palette</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Climate & Palette Anchor */}
            {wizardStep === 3 && (
              <div className="wizard-step space-y-6">
                <div>
                  <h3 className="font-editorial text-xl font-bold text-slate-900">
                    Step 3: Layering Climate & Color Anchor
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tune the recommendation engine to current temperature conditions and your preferred color focus.
                  </p>
                </div>

                {/* Layering Condition Options */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                    Layering & Climate Condition
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {weatherOptions.map((w) => {
                      const Icon = w.icon;
                      const isSelected = weather === w.id;
                      return (
                        <button
                          key={w.id}
                          onClick={() => setWeather(w.id)}
                          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                            isSelected
                              ? 'bg-[#0e244d] border-[#0e244d] text-white shadow-sm ring-2 ring-blue-200'
                              : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-300' : 'text-slate-600'}`} />
                            {isSelected && <span className="text-[10px] font-bold text-blue-300 uppercase">Active</span>}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold">{w.label}</h4>
                            <p className={`text-[11px] mt-1 ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                              {w.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Anchor Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                      Color Anchor (Wired into Scoring)
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Weighted scoring component favoring outfits featuring this hue
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {colorPalettes.map((c) => {
                      const isSelected = preferredColor === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setPreferredColor(c.id)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                            isSelected
                              ? 'bg-[#0e244d] border-[#0e244d] text-white shadow-sm ring-2 ring-blue-200'
                              : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-xs shrink-0"
                              style={{ backgroundColor: c.color }}
                            />
                            <span className="text-xs font-bold truncate">{c.label}</span>
                          </div>
                          <p className={`text-[10px] leading-tight ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                            {c.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Scoring Methodology Advisory Box */}
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3">
                  <Info className="w-4 h-4 text-[#132d5e] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#0e244d] leading-relaxed">
                    <strong>Compatibility Scoring:</strong> Compatibility scores are calculated using a deterministic,
                    normalized weighted algorithm based on color theory, silhouette proportions, and season compatibility.
                    Weather suitability is scored continuously without discarding versatile items. Styling tips provide
                    curated editorial guidance for your selected silhouette.
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setWizardStep(2)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={() => setWizardStep(4)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0e244d] hover:bg-[#132d5e] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <span>Next: Review & Synthesize</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review & Synthesize */}
            {wizardStep === 4 && (
              <div className="wizard-step space-y-6">
                <div>
                  <h3 className="font-editorial text-xl font-bold text-slate-900">
                    Step 4: Recipe Review & Wardrobe Inventory Readiness
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verify your styling criteria and check closet compatibility before synthesizing outfits.
                  </p>
                </div>

                {/* Parameter Summary Recipe Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Selected Styling Parameters
                    </span>
                    <span className="text-[11px] text-[#0e244d] font-semibold">
                      Click any tag to modify
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    <button
                      onClick={() => setWizardStep(1)}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-left transition-all"
                    >
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Occasion</span>
                      <span className="text-xs font-bold text-slate-800 capitalize block truncate mt-0.5">{occasion}</span>
                    </button>

                    <button
                      onClick={() => setWizardStep(1)}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-left transition-all"
                    >
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Department</span>
                      <span className="text-xs font-bold text-slate-800 uppercase block truncate mt-0.5">{gender}</span>
                    </button>

                    <button
                      onClick={() => setWizardStep(2)}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-left transition-all"
                    >
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Vibe</span>
                      <span className="text-xs font-bold text-slate-800 capitalize block truncate mt-0.5">{style}</span>
                    </button>

                    <button
                      onClick={() => setWizardStep(2)}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-left transition-all"
                    >
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Archetype</span>
                      <span className="text-xs font-bold text-slate-800 capitalize block truncate mt-0.5">{archetype}</span>
                    </button>

                    <button
                      onClick={() => setWizardStep(3)}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-left transition-all"
                    >
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Climate</span>
                      <span className="text-xs font-bold text-slate-800 capitalize block truncate mt-0.5">{weather}</span>
                    </button>

                    <button
                      onClick={() => setWizardStep(3)}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-left transition-all"
                    >
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Color Anchor</span>
                      <span className="text-xs font-bold text-slate-800 capitalize block truncate mt-0.5">{preferredColor}</span>
                    </button>
                  </div>
                </div>

                {/* Live Wardrobe Breakdown Card */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#0e244d]" />
                      <span>Live Wardrobe Compatibility Analysis</span>
                    </span>
                    <span className="text-xs font-bold text-[#0e244d]">
                      {effectivePool.length} Pieces in Effective Pool
                      {isUsingFallback && ' (Full Wardrobe Fallback)'}
                    </span>
                  </div>

                  {isUsingFallback && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                      <Info className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>
                        Selected department lacks required tops or bottoms. Using full wardrobe fallback ({effectivePool.length} pieces) to ensure complete outfit synthesis.
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">Tops</span>
                      <span className="text-base font-bold text-slate-800">{topsInPool}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">Bottoms</span>
                      <span className="text-base font-bold text-slate-800">{bottomsInPool}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">Outerwear</span>
                      <span className="text-base font-bold text-slate-800">{outerInPool}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">Footwear</span>
                      <span className="text-base font-bold text-slate-800">{shoesInPool}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">Accessories</span>
                      <span className="text-base font-bold text-slate-800">{accInPool}</span>
                    </div>
                  </div>

                  {/* Pre-generation Tag Check */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Archetype tagged pieces ({archetype}):</span>
                      <span className={`font-bold ${archetypeMatchesCount > 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {archetypeMatchesCount > 0 ? `${archetypeMatchesCount} items found` : '0 items tagged (Color & Silhouette matched)'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Style vibe tagged pieces ({style}):</span>
                      <span className={`font-bold ${styleMatchesCount > 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {styleMatchesCount > 0 ? `${styleMatchesCount} items found` : '0 items tagged (Adjacent style compatibility rules used)'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Occasion tagged pieces ({occasion}):</span>
                      <span className={`font-bold ${occasionMatchesCount >= 2 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {occasionMatchesCount} items directly tagged
                      </span>
                    </div>
                  </div>
                </div>

                {/* Synthesis Action Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
                  <button
                    onClick={() => setWizardStep(3)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer w-full sm:w-auto justify-center"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Climate</span>
                  </button>

                  <button
                    onClick={handleGenerateOutfits}
                    disabled={isGenerating || topsInPool === 0 || bottomsInPool === 0}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#0a1124] hover:bg-[#0e244d] text-white text-xs font-bold font-sans-clean transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 active:scale-98"
                  >
                    <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>
                      {isGenerating
                        ? 'Synthesizing Neural Outfits...'
                        : hasGenerated
                        ? 'Re-synthesize AI Outfits'
                        : 'Generate AI Outfits'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Error Advisory Banner */}
          {generationError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                    Outfit Generation Advisory
                  </h4>
                  <p className="text-xs text-rose-700 mt-0.5 leading-relaxed font-sans-clean">
                    {generationError}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGenerationError(null)}
                className="p-1 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

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
                  Walk through the 4 steps in the wizard above, or jump directly to Step 4 and click{' '}
                  <strong>&quot;Generate AI Outfits&quot;</strong> to view coordinated recommendations from your wardrobe.
                </p>
              </div>
              <button
                onClick={handleGenerateOutfits}
                className="px-6 py-3 rounded-2xl bg-[#0e244d] hover:bg-[#132d5e] text-white text-xs font-bold font-sans-clean transition-all shadow-md active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>Generate AI Outfits Now</span>
              </button>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="p-16 text-center rounded-3xl bg-[#060a14] border border-slate-800 text-white shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-full border-2 border-blue-400 border-t-transparent animate-spin mx-auto" />
              <h3 className="font-editorial text-xl font-bold">Synthesizing Outfits...</h3>
              <p className="text-xs text-slate-400">Evaluating color theory, silhouette balance, and season compatibility</p>
            </div>
          )}

          {/* Generated Recommendations Showcase */}
          {hasGenerated && !isGenerating && recommendations.length > 0 && activeOutfit && (
            <div className="space-y-6">
              {/* Look Selector Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  {recommendations.map((rec, idx) => (
                    <button
                      key={rec.id}
                      onClick={() => setSelectedOutfitIndex(idx)}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
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

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleSaveActiveOutfit}
                    disabled={savedSuccess}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-bold transition-colors shadow-xs cursor-pointer"
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
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0e244d] hover:bg-[#132d5e] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-300" />
                    <span>Virtual Try-On</span>
                  </button>
                </div>
              </div>

              {/* Coverage Warnings Banner: emitted strictly from actual metadata gaps */}
              {warnings.length > 0 && (
                <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Wardrobe Coverage Advisory ({warnings.length})
                    </span>
                  </div>
                  <div className="space-y-1.5 pl-6">
                    {warnings.map((warn, i) => (
                      <p key={i} className="text-xs text-amber-900 leading-relaxed font-sans-clean">
                        <span className="font-semibold uppercase text-[10px] px-1.5 py-0.5 rounded-md bg-amber-200 text-amber-900 mr-1.5">
                          {warn.type}
                        </span>
                        {warn.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Outfit Display Card */}
              <div className="rounded-3xl bg-[#060a14] border border-slate-800 p-6 md:p-8 text-white shadow-2xl space-y-6">
                {/* Outfit Title & Harmony Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-[#0b1329] px-2.5 py-0.5 rounded-full border border-slate-700">
                        {activeOutfit.occasion} • {activeOutfit.style}
                      </span>
                      {activeOutfit.archetype && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-700/60 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>Archetype: {activeOutfit.archetype}</span>
                        </span>
                      )}
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
                className="px-5 py-2.5 rounded-full bg-[#0e244d] text-white text-xs font-bold cursor-pointer"
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0e244d] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                          {outfit.occasion} • {outfit.style}
                        </span>
                        {outfit.archetype && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            {outfit.archetype}
                          </span>
                        )}
                      </div>
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
                      className="flex-1 py-2.5 rounded-xl bg-[#0a1124] hover:bg-[#0e244d] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
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
                    className="p-2 rounded-2xl border border-slate-200 hover:border-[#1e3a8a] hover:bg-blue-50/40 text-left transition-all group cursor-pointer"
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
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
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
