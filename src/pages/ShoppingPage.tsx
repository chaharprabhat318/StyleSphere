import React, { useState } from 'react';
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
} from 'lucide-react';

interface PartnerProduct {
  id: string;
  name: string;
  store: 'Zara' | 'Uniqlo' | 'Myntra' | 'H&M' | 'ASOS';
  category: 'Tops' | 'Bottoms' | 'Outerwear' | 'Footwear';
  gender?: 'men' | 'women' | 'unisex';
  price: number;
  originalPrice: number;
  currency: string;
  reasonWhy: string;
  combinationsUnlocked: number;
  closetMatches: string[];
  stylingTips: string[];
  versatilityScore: number;
  imageUrl: string;
  storeUrl: string;
}

export const ShoppingPage: React.FC = () => {
  const [selectedStore, setSelectedStore] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedGender, setSelectedGender] = useState<'All' | 'Men' | 'Women'>('All');
  const [copiedCoupon, setCopiedCoupon] = useState<boolean>(false);
  const [previewProduct, setPreviewProduct] = useState<PartnerProduct | null>(null);

  const promoCode = 'SPHERE10';
  const genders = ['All', 'Men', 'Women'] as const;

  const products: PartnerProduct[] = [
    {
      id: 'shop-uniqlo-1',
      name: 'Structured Linen-Cotton Overshirt',
      store: 'Uniqlo',
      category: 'Outerwear',
      gender: 'unisex',
      price: 49.9,
      originalPrice: 59.9,
      currency: '$',
      reasonWhy:
        'Your closet has 3 base neutral tees but lacks a breathable mid-layer. This olive piece creates 5 distinct silhouettes with your white tee, raw denim, and grey trousers.',
      combinationsUnlocked: 5,
      closetMatches: ['Cropped Boxy Tee', 'Baggy Puddle Denim', 'Wide Fluid Slacks'],
      stylingTips: [
        'Wear unbuttoned over a white tee with raw denim for a relaxed weekend look',
        'Button up and pair with tailored chinos for a casual workday silhouette',
        'Layer under an overcoat when temperatures drop for rich texture contrast',
      ],
      versatilityScore: 96,
      imageUrl:
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=85',
      storeUrl: 'https://www.uniqlo.com/us/en/products/overshirt-staple?ref=stylesphere&promo=SPHERE10',
    },
    {
      id: 'shop-zara-1',
      name: 'Relaxed Pleated Wide Trousers',
      store: 'Zara',
      category: 'Bottoms',
      gender: 'men',
      price: 59.9,
      originalPrice: 69.9,
      currency: '$',
      reasonWhy:
        'Your current bottoms are dark-toned (raw denim & charcoal). Introducing an ecru relaxed drape bridges casual weekend polos with your leather jacket and blazers.',
      combinationsUnlocked: 6,
      closetMatches: ['Black Knit Polo', 'Biker Jacket', 'Linen Button-Down'],
      stylingTips: [
        'Pair with tucked-in black knit polo and leather boots for elevated minimalism',
        'Style with an oversized boxy tee and clean court sneakers for street style',
        'Add a structured navy blazer for a modern smart-casual look',
      ],
      versatilityScore: 94,
      imageUrl:
        'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=85',
      storeUrl: 'https://www.zara.com/us/en/relaxed-pleated-trousers?ref=stylesphere&promo=SPHERE10',
    },
    {
      id: 'shop-hm-1',
      name: 'Minimalist Leather Chelsea Boot',
      store: 'H&M',
      category: 'Footwear',
      gender: 'unisex',
      price: 79.99,
      originalPrice: 94.99,
      currency: '$',
      reasonWhy:
        'Instantly elevates any everyday basic look into a sharp dinner or date-night silhouette without requiring you to buy new shirts.',
      combinationsUnlocked: 4,
      closetMatches: ['Charcoal Slacks', 'Raw Selvedge Denim', 'Beige Trench'],
      stylingTips: [
        'Wear with rolled raw selvedge denim and a clean white tee',
        'Pair with tailored charcoal trousers for semi-formal dinners',
        'Complements long wool coats and leather jackets effortlessly',
      ],
      versatilityScore: 91,
      imageUrl:
        'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=800&q=85',
      storeUrl: 'https://www2.hm.com/en_us/productpage.chelsea-boot-leather.html?ref=stylesphere&promo=SPHERE10',
    },
    {
      id: 'shop-asos-1',
      name: 'Retro Clean Suede Court Sneaker',
      store: 'ASOS',
      category: 'Footwear',
      gender: 'unisex',
      price: 65.0,
      originalPrice: 79.0,
      currency: '$',
      reasonWhy:
        'A clean vintage-inspired court trainer pairs effortlessly with both tailored trousers and casual distressed jeans across all 4 seasons.',
      combinationsUnlocked: 7,
      closetMatches: ['Ecru Chinos', 'Dark Denim', 'Oversized Hoodie'],
      stylingTips: [
        'Clean, versatile low-profile sneaker that matches 80% of your current wardrobe',
        'Looks great with no-show socks and cropped relaxed chinos',
        'Subtle off-white suede adds textural interest over standard white leather',
      ],
      versatilityScore: 95,
      imageUrl:
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=85',
      storeUrl: 'https://www.asos.com/us/asos-design/retro-suede-sneaker?ref=stylesphere&promo=SPHERE10',
    },
    {
      id: 'shop-myntra-1',
      name: 'Heavyweight Structured Supima Mock-Neck',
      store: 'Myntra',
      category: 'Tops',
      gender: 'unisex',
      price: 28.5,
      originalPrice: 38.0,
      currency: '$',
      reasonWhy:
        'Solves the neckline monotony in your closet. Adds refined architectural structure under jackets and overshirts at an accessible price point.',
      combinationsUnlocked: 5,
      closetMatches: ['Navy Blazer', 'Wool Overcoat', 'Olive Cargo Pants'],
      stylingTips: [
        'Layer under your navy blazer for a modern, tie-free business casual look',
        'Wear standalone with relaxed trousers and minimalist sneakers',
        'Works smoothly beneath heavy winter jackets for thermal comfort',
      ],
      versatilityScore: 92,
      imageUrl:
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=85',
      storeUrl: 'https://www.myntra.com/tshirts/supima-cotton-mock-neck?ref=stylesphere&promo=SPHERE10',
    },
    {
      id: 'shop-zara-2',
      name: 'Tailored Wool-Blend Double-Breasted Blazer',
      store: 'Zara',
      category: 'Outerwear',
      gender: 'men',
      price: 129.0,
      originalPrice: 159.0,
      currency: '$',
      reasonWhy:
        'Fills your wardrobe formal-wear gap for important presentations, dinner reservations, and special occasions.',
      combinationsUnlocked: 4,
      closetMatches: ['White Oxford Shirt', 'Black Loafers', 'Navy Chinos'],
      stylingTips: [
        'Pair with an Oxford shirt and dark slacks for formal events',
        'Dress down with a clean white crew-neck tee and dark denim',
        'Keep accessories minimal for an effortless Italian tailoring aesthetic',
      ],
      versatilityScore: 89,
      imageUrl:
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=85',
      storeUrl: 'https://www.zara.com/us/en/tailored-wool-blazer?ref=stylesphere&promo=SPHERE10',
    },
    {
      id: 'shop-zara-woman-1',
      name: 'Mulberry Silk Tie-Neck Editorial Blouse',
      store: 'Zara',
      category: 'Tops',
      gender: 'women',
      price: 89.9,
      originalPrice: 119.0,
      currency: '$',
      reasonWhy:
        'Fills the sophisticated feminine tailoring gap. Seamlessly coordinates with high-waisted fluid trousers and midi skirts for elevated dinners.',
      combinationsUnlocked: 6,
      closetMatches: ['Fluid Slacks', 'Satin Midi Skirt', 'Cashmere Cardigan'],
      stylingTips: [
        'Tuck into high-waisted fluid trousers with pointed ankle boots',
        'Wear bow loosely untied for a relaxed Parisian aesthetic',
        'Layer underneath an oversized blazer for effortless modern tailoring',
      ],
      versatilityScore: 95,
      imageUrl:
        'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=800&q=85',
      storeUrl: 'https://www.zara.com/us/en/woman-silk-blouse?ref=stylesphere&promo=SPHERE10',
    },
    {
      id: 'shop-hm-woman-1',
      name: 'High-Waisted Wide Fluid Trousers',
      store: 'H&M',
      category: 'Bottoms',
      gender: 'women',
      price: 54.99,
      originalPrice: 69.99,
      currency: '$',
      reasonWhy:
        'Bridges formal workday styling with weekend brunch minimalism, giving your tops and knitwear balanced proportions.',
      combinationsUnlocked: 7,
      closetMatches: ['Silk Blouse', 'Fitted Mock-Neck', 'Cropped Trench'],
      stylingTips: [
        'Style with a fitted mock-neck knit and minimalist leather belt',
        'Pair with clean low sneakers and a tucked basic tee for casual days',
        'Wear with pointed mules or heels for formal appointments',
      ],
      versatilityScore: 93,
      imageUrl:
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=85',
      storeUrl: 'https://www2.hm.com/en_us/productpage.wide-fluid-trousers.html?ref=stylesphere&promo=SPHERE10',
    },
    {
      id: 'shop-uniqlo-woman-1',
      name: 'Oversized Double-Face Tailored Blazer',
      store: 'Uniqlo',
      category: 'Outerwear',
      gender: 'women',
      price: 99.9,
      originalPrice: 129.0,
      currency: '$',
      reasonWhy:
        'Essential capsule layering piece. Creates instant structure over simple slip skirts, denim, or wide trousers.',
      combinationsUnlocked: 6,
      closetMatches: ['Slip Skirt', 'Straight Denim', 'Supima Tee'],
      stylingTips: [
        'Drape over shoulders over a knit dress for an architectural silhouette',
        'Cinch with a leather belt over fluid slacks for power dressing',
        'Wear casually over straight-leg jeans with sleeves rolled',
      ],
      versatilityScore: 94,
      imageUrl:
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=85',
      storeUrl: 'https://www.uniqlo.com/us/en/products/double-face-blazer?ref=stylesphere&promo=SPHERE10',
    },
  ];

  const stores = ['All', 'Zara', 'Uniqlo', 'Myntra', 'H&M', 'ASOS'];
  const categories = ['All', 'Outerwear', 'Tops', 'Bottoms', 'Footwear'];

  const filteredProducts = products.filter((product) => {
    const matchesStore = selectedStore === 'All' || product.store === selectedStore;
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesGender =
      selectedGender === 'All' ||
      product.gender === selectedGender.toLowerCase() ||
      product.gender === 'unisex';
    return matchesStore && matchesCategory && matchesGender;
  });

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(promoCode);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  const handleShopRedirect = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-white bg-[#0e244d] px-2.5 py-1 rounded-full border border-[#1e3a8a]">
              Smart Wardrobe Gaps
            </span>
            <span className="text-[10px] font-bold text-[#132d5e] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#132d5e]" />
              Personalized AI Curation
            </span>
          </div>
          <h1 className="font-editorial text-3xl md:text-4xl text-slate-900 font-bold mt-2">
            Smart Shopping
          </h1>
          <p className="text-xs text-slate-600 mt-1.5 max-w-2xl font-sans-clean leading-relaxed">
            Stop buying clothes you rarely wear. StyleSphere cross-analyzes your digital closet to recommend the exact pieces that unlock the highest number of new outfit combinations from leading fashion stores.
          </p>
        </div>

        {/* Exclusive Partner Promo Code Banner */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-[#0e244d] flex items-center justify-center text-white shrink-0">
            <Tag className="w-4 h-4 text-blue-200" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
              Exclusive Member Discount
            </span>
            <span className="font-mono text-xs font-bold text-[#0e244d]">
              {promoCode} • 10% OFF
            </span>
          </div>
          <button
            onClick={handleCopyCoupon}
            className="px-3.5 py-1.5 rounded-xl bg-[#0a1124] hover:bg-[#132d5e] text-white text-xs font-bold font-sans-clean transition-colors flex items-center gap-1.5 shrink-0"
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

      {/* Wardrobe Diagnostics & Closet Gap Intelligence (User-Facing) */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#060a14] border border-slate-800 text-white shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] tracking-widest uppercase font-bold text-slate-400">
              Personalized Stylist Diagnostic
            </span>
            <h2 className="font-editorial text-2xl text-white font-bold mt-0.5">
              Identified Closet Gaps
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            Based on the 12 items in your wardrobe, adding these specific pieces creates balanced silhouettes for every occasion.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
              Gap 01 • Mid-Layer
            </span>
            <h3 className="text-sm font-bold text-white">Transitional Layer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              You own plenty of base tees and heavy jackets, but lack a lightweight textured overshirt.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
              Gap 02 • Silhouette
            </span>
            <h3 className="text-sm font-bold text-white">Ecru Fluid Trousers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your bottoms anchor in baggy puddle denim and cargo silhouettes. An ecru fluid trouser unlocks elevated tailoring.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
              Gap 03 • Footwear
            </span>
            <h3 className="text-sm font-bold text-white">Leather Chelsea Boot</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instantly transforms everyday jeans into sharp evening dinner and social combinations.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
              Gap 04 • Color Palette
            </span>
            <h3 className="text-sm font-bold text-white">Earth Tone Contrast</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Adding subtle olive or warm ecru balances your monochrome black and white wardrobe.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Store Tabs */}
      <div className="space-y-4">
        {/* Gender / Category Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200/70 pb-3">
          <span className="text-xs font-bold text-slate-500 mr-1">
            Category:
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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Store Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Store className="w-3.5 h-3.5" />
              Store:
            </span>
            {stores.map((store) => (
              <button
                key={store}
                onClick={() => setSelectedStore(store)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
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
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Clothing Type:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
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
      </div>

      {/* Products Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-editorial text-2xl text-slate-900 font-bold">
            Curated Recommendations ({filteredProducts.length})
          </h2>
          <span className="text-xs text-slate-500">
            Ranked by outfit versatility & closet compatibility
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="rounded-3xl bg-white border border-slate-200/90 hover:border-[#1e3a8a] shadow-sm hover:shadow-lg transition-all flex flex-col justify-between p-6 space-y-4 text-slate-900 group"
            >
              <div>
                {/* Image & Price Overlay */}
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 mb-4 relative shadow-sm">
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
                    Use {promoCode} for 10% Off
                  </div>
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold shadow-md flex items-baseline gap-1.5">
                    <span>{product.currency}{product.price.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 line-through">
                      {product.currency}{product.originalPrice.toFixed(2)}
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
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        product.gender === 'women'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : product.gender === 'men'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {product.gender}
                      </span>
                    )}
                  </div>
                  <span className="capitalize text-slate-500">{product.category}</span>
                </div>

                <h3 className="font-editorial text-lg text-slate-900 font-bold leading-snug">
                  {product.name}
                </h3>

                {/* Matches with Your Existing Clothes */}
                <div className="mt-3 p-3 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1.5">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-[#0e244d] uppercase tracking-wide">
                    <Layers className="w-3 h-3" />
                    <span>Pairs with pieces you own:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {product.closetMatches.map((match, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-blue-200 text-[#132d5e] font-medium"
                      >
                        ✓ {match}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stylist Reason Why */}
                <p className="text-xs text-slate-600 mt-3 leading-relaxed font-sans-clean bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <strong className="text-slate-800">Stylist Reason: </strong>
                  {product.reasonWhy}
                </p>
              </div>

              {/* Action Buttons & Unlocked Combinations */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[#132d5e] font-bold font-sans-clean">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>+{product.combinationsUnlocked} New Outfits</span>
                  </div>
                  <span className="bg-[#0f244d] text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    {product.versatilityScore}% Versatility
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPreviewProduct(product)}
                    className="py-2.5 px-3 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold font-sans-clean flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Style Guide</span>
                  </button>

                  <button
                    onClick={() => handleShopRedirect(product.storeUrl)}
                    className="col-span-2 py-2.5 px-4 rounded-2xl bg-[#0a1124] hover:bg-[#0e244d] text-white text-xs font-bold font-sans-clean flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <span>Buy on {product.store}</span>
                    <ArrowUpRight className="w-4 h-4 text-blue-300" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sustainable Shopping Guarantee Bar (Consumer-Facing) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#132d5e] flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Guaranteed Closet Compatibility</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Every recommendation matches at least 3 items in your existing digital wardrobe.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Member Exclusive Discounts</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Use code <span className="font-mono font-bold text-[#0e244d]">SPHERE10</span> across verified store checkouts.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#0e244d] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Zero Impulse Waste</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Buy fewer, high-utility pieces that unlock multiple rotation silhouettes.
            </p>
          </div>
        </div>
      </div>

      {/* Style Guide / Outfit Pairing Modal */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 border border-slate-200 shadow-2xl relative space-y-6">
            <button
              onClick={() => setPreviewProduct(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
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
                How to integrate this piece into your current wardrobe rotation.
              </p>
            </div>

            {/* Product Summary Preview */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <img
                src={previewProduct.imageUrl}
                alt={previewProduct.name}
                className="w-16 h-16 rounded-xl object-cover shadow-sm"
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
                    {previewProduct.currency}{previewProduct.price.toFixed(2)}
                  </span>
                  <span className="text-[10px] line-through text-slate-400">
                    {previewProduct.currency}{previewProduct.originalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Pairing Advice */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Stylist Pairing Suggestions
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
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Close
              </button>

              <button
                onClick={() => handleShopRedirect(previewProduct.storeUrl)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#0e244d] hover:bg-[#0a1124] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md text-white"
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
