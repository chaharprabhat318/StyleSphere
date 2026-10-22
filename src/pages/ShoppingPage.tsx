import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Tag,
  Copy,
  Check,
  ArrowUpRight,
  Store,
  SlidersHorizontal,
  Layers,
  Sparkles,
  ShieldCheck,
  X,
  Eye,
  Shirt,
  Filter,
} from 'lucide-react';
import { wardrobeService } from '../services/wardrobeService';
import {
  getWardrobeDiagnostics,
  getSmartShoppingRecommendations,
  type EnrichedShoppingProduct,
  type StoreName,
  type ShoppingCategory,
} from '../services/shoppingService';
import type { WardrobeItem } from '../types/wardrobe';

export const ShoppingPage: React.FC = () => {
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedGender, setSelectedGender] = useState<'All' | 'Men' | 'Women'>('All');
  const [sortBy, setSortBy] = useState<'versatility' | 'outfits' | 'price-asc' | 'price-desc'>('versatility');
  const [copiedCoupon, setCopiedCoupon] = useState<boolean>(false);
  const [previewProduct, setPreviewProduct] = useState<EnrichedShoppingProduct | null>(null);

  const promoCode = 'SPHERE10';
  const genders = ['All', 'Men', 'Women'] as const;

  const stores: ('All' | StoreName)[] = [
    'All',
    'Bonkers Corner',
    'Off Duty',
    'The Men Thing',
    'Nykaa Fashion',
    'Swiss Time House',
    'Tata CLiQ',
    'Nike',
    'Adidas',
    'Puma',
    'New Balance',
    'H&M',
    'Uniqlo',
  ];

  const categories: ('All' | ShoppingCategory)[] = [
    'All',
    'Outerwear',
    'Tops',
    'Bottoms',
    'Footwear',
    'Accessories',
  ];

  // Load live wardrobe items
  useEffect(() => {
    let isMounted = true;
    wardrobeService.getItems().then((items) => {
      if (isMounted) {
        setWardrobe(items);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute live diagnostics from real wardrobe
  const diagnostics = useMemo(() => {
    return getWardrobeDiagnostics(wardrobe);
  }, [wardrobe]);

  // Compute enriched recommendations cross-analyzed with user's real wardrobe
  const products = useMemo(() => {
    const recs = getSmartShoppingRecommendations(wardrobe, {
      store: selectedStore,
      category: selectedCategory,
      gender: selectedGender,
    });

    // Apply sorting
    return [...recs].sort((a, b) => {
      if (sortBy === 'versatility') {
        return b.versatilityScore - a.versatilityScore;
      } else if (sortBy === 'outfits') {
        return b.combinationsUnlocked - a.combinationsUnlocked;
      } else if (sortBy === 'price-asc') {
        return a.price - b.price;
      } else if (sortBy === 'price-desc') {
        return b.price - a.price;
      }
      return 0;
    });
  }, [wardrobe, selectedStore, selectedCategory, selectedGender, sortBy]);

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(promoCode);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  const handleShopRedirect = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 font-sans-clean">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-white bg-[#0e244d] px-2.5 py-1 rounded-full border border-[#1e3a8a]">
              Smart Wardrobe Gaps
            </span>
            <span className="text-[10px] font-bold text-[#132d5e] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#132d5e]" />
              Active Closet Intelligence
            </span>
          </div>
          <h1 className="font-editorial text-3xl md:text-4xl text-slate-900 font-bold mt-2">
            Smart Shopping
          </h1>
          <p className="text-xs text-slate-600 mt-1.5 max-w-2xl font-sans-clean leading-relaxed">
            Stop buying clothes in isolation. StyleSphere cross-analyzes your real {diagnostics.totalItems} wardrobe items to recommend curated pieces that fill genuine silhouette gaps and unlock the highest number of new outfit combinations.
          </p>
        </div>

        {/* Exclusive Partner Promo Code Banner */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#0e244d] flex items-center justify-center text-white shrink-0">
            <Tag className="w-4 h-4 text-blue-200" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
              Partner Member Discount
            </span>
            <span className="font-mono text-xs font-bold text-[#0e244d]">
              {promoCode} • 10% OFF
            </span>
          </div>
          <button
            onClick={handleCopyCoupon}
            className="px-3.5 py-1.5 rounded-xl bg-[#0a1124] hover:bg-[#132d5e] text-white text-xs font-bold font-sans-clean transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            {copiedCoupon ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Wardrobe Diagnostics & Closet Gap Intelligence */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#060a14] border border-slate-800 text-white shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest uppercase font-bold text-blue-400">
                Personalized Closet Audit
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                {diagnostics.totalItems} Active Items
              </span>
            </div>
            <h2 className="font-editorial text-2xl text-white font-bold mt-0.5">
              Identified Closet Gaps
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
              <strong className="text-white">{diagnostics.topsCount}</strong> Tops
            </span>
            <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
              <strong className="text-white">{diagnostics.bottomsCount}</strong> Bottoms
            </span>
            <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
              <strong className="text-white">{diagnostics.footwearCount}</strong> Shoes
            </span>
            <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
              <strong className="text-white">{diagnostics.accessoriesCount}</strong> Accessories
            </span>
            <span className="bg-amber-950/60 border border-amber-800/80 text-amber-300 px-2.5 py-1 rounded-lg font-bold">
              {diagnostics.outerwearCount} Outerwear (Gap!)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {diagnostics.gaps.map((gap) => (
            <div
              key={gap.id}
              className="p-4 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-2 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                    Gap {gap.gapNumber} • {gap.tag}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">{gap.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {gap.description}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Status</span>
                <span className="text-blue-300 font-medium font-mono">{gap.highlightStat}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Store Tabs */}
      <div className="space-y-4">
        {/* Gender & Sorting Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Target Gender:
            </span>
            <div className="inline-flex p-1 bg-slate-100 rounded-full border border-slate-200">
              {genders.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGender(g)}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    selectedGender === g
                      ? 'bg-[#0e244d] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0e244d] cursor-pointer"
            >
              <option value="versatility">Highest Versatility</option>
              <option value="outfits">Most Outfits Unlocked</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Store Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1 shrink-0">
            <Store className="w-3.5 h-3.5" />
            Store:
          </span>
          {stores.map((store) => (
            <button
              key={store}
              onClick={() => setSelectedStore(store)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                selectedStore === store
                  ? 'bg-[#0e244d] text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {store}
            </button>
          ))}
        </div>

        {/* Clothing Type Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#0a1124] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-editorial text-2xl text-slate-900 font-bold">
            Curated Recommendations ({products.length})
          </h2>
          <span className="text-xs text-slate-500">
            Cross-analyzed with your {wardrobe.length} closet items • Real INR pricing
          </span>
        </div>

        {products.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <Shirt className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No matching items found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your store or category filters to explore more personalized recommendations.
            </p>
            <button
              onClick={() => {
                setSelectedStore('All');
                setSelectedCategory('All');
                setSelectedGender('All');
              }}
              className="px-4 py-2 rounded-xl bg-[#0e244d] text-white text-xs font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-3xl bg-white border border-slate-200/90 hover:border-[#1e3a8a] shadow-sm hover:shadow-lg transition-all flex flex-col justify-between p-6 space-y-4 text-slate-900 group"
              >
                <div>
                  {/* Image & Price Overlay */}
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 mb-4 relative shadow-sm">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#0a1124]/90 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white flex items-center gap-1">
                      <Store className="w-3 h-3 text-blue-300" />
                      <span>{product.store}</span>
                    </div>
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-[#0e244d] text-white text-[10px] font-bold">
                      10% OFF with SPHERE10
                    </div>
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold shadow-md flex items-baseline gap-1.5">
                      <span>{product.currency}{product.price.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-slate-400 line-through">
                        {product.currency}{product.originalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Brand & Category & Gender */}
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="uppercase tracking-wider font-bold text-[#132d5e]">
                        {product.store}
                      </span>
                      {product.gender && (
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            product.gender === 'women'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : product.gender === 'men'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {product.gender}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                      {product.gapTag}
                    </span>
                  </div>

                  <h3 className="font-editorial text-lg text-slate-900 font-bold leading-snug">
                    {product.name}
                  </h3>

                  {/* Real Matches with Pieces in the User's Digital Wardrobe */}
                  <div className="mt-3 p-3 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1.5">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-[#0e244d] uppercase tracking-wide">
                      <Layers className="w-3 h-3 text-[#132d5e]" />
                      <span>Pairs with pieces you own:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {product.closetMatches.map((match, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-blue-200 text-[#132d5e] font-semibold"
                        >
                          ✓ {match}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stylist Reason Why (Real Closet Referenced) */}
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed font-sans-clean bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                    <strong className="text-slate-800">Stylist Reason: </strong>
                    {product.dynamicReasonWhy}
                  </p>
                </div>

                {/* Action Buttons & Unlocked Combinations */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-[#132d5e] font-bold font-sans-clean">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span>+{product.combinationsUnlocked} New Outfits Unlocked</span>
                    </div>
                    <span className="bg-[#0f244d] text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      {product.versatilityScore}% Versatility
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setPreviewProduct(product)}
                      className="py-2.5 px-3 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold font-sans-clean flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Style Guide</span>
                    </button>

                    <button
                      onClick={() => handleShopRedirect(product.storeUrl)}
                      className="col-span-2 py-2.5 px-4 rounded-2xl bg-[#0a1124] hover:bg-[#0e244d] text-white text-xs font-bold font-sans-clean flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                    >
                      <span>Buy on {product.store}</span>
                      <ArrowUpRight className="w-4 h-4 text-blue-300" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sustainable Shopping Guarantee Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#132d5e] flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Guaranteed Closet Compatibility</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Every recommendation directly coordinates with pieces in your active {diagnostics.totalItems}-item digital wardrobe.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Partner Member Discounts</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Use promo code <span className="font-mono font-bold text-[#0e244d]">SPHERE10</span> across official store checkouts for instant savings.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#0e244d] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Zero Impulse Waste</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Buy fewer, high-utility pieces designed to fill real wardrobe voids and maximize outfit rotations.
            </p>
          </div>
        </div>
      </div>

      {/* Style Guide / Outfit Pairing Modal */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 border border-slate-200 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPreviewProduct(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-[#0e244d] px-2.5 py-0.5 rounded-full">
                  AI Styling Guide
                </span>
                <span className="text-[10px] font-bold text-[#132d5e] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {previewProduct.store}
                </span>
                {previewProduct.gender && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    {previewProduct.gender}
                  </span>
                )}
              </div>
              <h3 className="font-editorial text-2xl font-bold text-slate-900">
                {previewProduct.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                How to integrate this piece into your current {diagnostics.totalItems}-item wardrobe rotation.
              </p>
            </div>

            {/* Product Summary Preview */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <img
                src={previewProduct.imageUrl}
                alt={previewProduct.name}
                className="w-16 h-16 rounded-xl object-cover shadow-sm shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold text-[#132d5e]">
                  {previewProduct.store}
                </span>
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {previewProduct.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-bold text-[#0e244d]">
                    {previewProduct.currency}{previewProduct.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] line-through text-slate-400">
                    {previewProduct.currency}{previewProduct.originalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Coordinates with User's Existing Closet */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Verified Matching Pieces in Your Digital Closet
              </span>
              <div className="space-y-1.5">
                {previewProduct.closetMatches.map((match, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-[#0e244d] font-bold flex items-center justify-between"
                  >
                    <span>✓ {match}</span>
                    <span className="text-[10px] text-blue-600 font-semibold uppercase">In Your Wardrobe</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Pairing Advice */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Stylist Rotation Suggestions
              </span>

              <div className="space-y-2">
                {previewProduct.stylingTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[#060a14] text-white border border-slate-800 text-xs flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#132d5e] text-blue-200 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      0{idx + 1}
                    </span>
                    <p className="text-slate-300 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setPreviewProduct(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={() => handleShopRedirect(previewProduct.storeUrl)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#0e244d] hover:bg-[#0a1124] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
              >
                <span>Buy on {previewProduct.store}</span>
                <ArrowUpRight className="w-4 h-4 text-blue-300" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
