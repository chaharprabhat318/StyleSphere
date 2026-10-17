import type { WardrobeItem, OccasionType, StyleVibe, FashionArchetype } from '../types/wardrobe';
import type { OutfitRecommendation, RecommendationCriteria } from '../types/outfit';
import { wardrobeService } from './wardrobeService';

const OUTFIT_HISTORY_KEY = 'stylesphere_outfit_history_trending_v4';
const SAVED_OUTFITS_KEY = 'stylesphere_saved_outfits_trending_v4';

export interface HistoryEntry {
  id: string;
  outfitId: string;
  title: string;
  dateWorn: string;
  occasion: OccasionType;
  items: WardrobeItem[];
  notes?: string;
}

// ─── Color Compatibility Matrix ─────────────────────────────────────
// Which colors go well together (both directions)
const COLOR_COMPAT: Record<string, string[]> = {
  white:   ['black', 'navy', 'blue', 'grey', 'beige', 'khaki', 'charcoal', 'brown', 'olive', 'green', 'sage', 'cream', 'oatmeal'],
  black:   ['white', 'grey', 'charcoal', 'beige', 'cream', 'navy', 'red', 'khaki', 'brown', 'camel'],
  grey:    ['white', 'black', 'charcoal', 'navy', 'blue', 'beige', 'burgundy'],
  charcoal:['white', 'light blue', 'beige', 'cream', 'camel', 'brown', 'burgundy'],
  navy:    ['white', 'beige', 'grey', 'khaki', 'camel', 'light blue', 'cream', 'oatmeal'],
  blue:    ['white', 'navy', 'grey', 'beige', 'khaki', 'brown', 'camel'],
  beige:   ['white', 'black', 'navy', 'brown', 'camel', 'olive', 'khaki', 'charcoal'],
  brown:   ['beige', 'khaki', 'white', 'camel', 'navy', 'olive', 'cream'],
  camel:   ['white', 'black', 'navy', 'grey', 'brown', 'charcoal', 'beige'],
  khaki:   ['white', 'navy', 'brown', 'beige', 'olive', 'black'],
  olive:   ['white', 'black', 'khaki', 'beige', 'brown', 'navy', 'cream'],
  green:   ['white', 'beige', 'khaki', 'brown', 'navy', 'black', 'cream'],
  sage:    ['white', 'beige', 'black', 'brown', 'khaki', 'grey', 'cream'],
  cream:   ['black', 'navy', 'brown', 'olive', 'khaki', 'charcoal', 'beige'],
  oatmeal: ['black', 'navy', 'brown', 'olive', 'charcoal', 'beige'],
  burgundy:['beige', 'grey', 'charcoal', 'navy', 'white', 'black', 'khaki'],
  red:     ['black', 'white', 'navy', 'grey'],
};

function normalizeColor(color: string): string {
  return color.toLowerCase()
    .replace('vintage ', '')
    .replace('washed ', '')
    .replace('chalk ', '')
    .replace('cream ', '')
    .replace('muted ', '')
    .replace('dune ', '')
    .replace('raw ', '')
    .replace('deep ', '')
    .replace('matte ', '')
    .replace('melange ', '')
    .replace('champagne ', '')
    .replace('caramel ', '')
    .replace('stone ', '')
    .replace('sand', 'beige')
    .replace('oatmeal', 'beige')
    .replace('ecru', 'white')
    .replace('bone', 'white')
    .replace('ash', 'grey')
    .replace('charcoal', 'grey')
    .replace('slate', 'grey')
    .replace('indigo', 'navy')
    .replace('mid wash', 'blue')
    .replace('obsidian', 'black')
    .replace('tortoise', 'brown')
    .replace('silver & white', 'white')
    .replace('white & black', 'white')
    .trim();
}

function colorScore(c1: string, c2: string): number {
  const n1 = normalizeColor(c1);
  const n2 = normalizeColor(c2);
  if (n1 === n2) return 70; // Monochromatic look
  const compatList = COLOR_COMPAT[n1] || [];
  if (compatList.includes(n2)) return 100;
  const compatList2 = COLOR_COMPAT[n2] || [];
  if (compatList2.includes(n1)) return 100;
  return 55;
}

// ─── Modern 2025/2026 Trend Silhouette & Proportion Engine ───────────
// Core Trend Rule: "Tight/Cropped/Slim Top + Baggy/Wide-Leg/Bootcut Bottom"
function silhouetteScore(top: WardrobeItem, bottom: WardrobeItem): number {
  const topText = `${top.name} ${top.subCategory || ''}`.toLowerCase();
  const bottomText = `${bottom.name} ${bottom.subCategory || ''}`.toLowerCase();

  const isCroppedOrSlimTop =
    top.fit === 'cropped' ||
    top.fit === 'slim' ||
    top.fit === 'boxy' ||
    topText.includes('cropped') ||
    topText.includes('baby tee') ||
    topText.includes('slim') ||
    topText.includes('boxy');

  const isWideOrBaggyBottom =
    bottom.fit === 'baggy' ||
    bottom.fit === 'wide-leg' ||
    bottom.fit === 'bootcut' ||
    bottom.fit === 'loose' ||
    bottomText.includes('baggy') ||
    bottomText.includes('wide') ||
    bottomText.includes('bootcut') ||
    bottomText.includes('carpenter') ||
    bottomText.includes('cargo') ||
    bottomText.includes('parachute') ||
    bottomText.includes('loose');

  // Hard penalty for skinny jeans (User directive: "no to skinny jeans")
  if (bottomText.includes('skinny')) {
    return 20;
  }

  // Peak Trend Synergy: Cropped/Slim/Boxy Top + Baggy/Wide/Bootcut Bottoms
  if (isCroppedOrSlimTop && isWideOrBaggyBottom) {
    return 100;
  }

  // Cropped top + Straight-leg bottoms (small yes to straight fit)
  if (isCroppedOrSlimTop && (bottom.fit === 'straight' || bottomText.includes('straight'))) {
    return 88;
  }

  // Relaxed top + Wide-leg drape
  if (isWideOrBaggyBottom) {
    return 92;
  }

  return 75;
}

// ─── Viral "Sandwich Rule" Evaluator ─────────────────────────────────
// Bread (Top/Jacket/Hat) + Filling (Contrasting Baggy Pants) + Bread (Matching Shoes)
function sandwichScore(top: WardrobeItem, bottom: WardrobeItem, shoes: WardrobeItem | undefined): number {
  if (!shoes) return 75;
  const topColor = normalizeColor(top.color);
  const shoeColor = normalizeColor(shoes.color);
  const bottomColor = normalizeColor(bottom.color);

  // Shoes tone-match or complement top, while bottoms provide contrast
  if ((topColor === shoeColor || colorScore(top.color, shoes.color) >= 80) && topColor !== bottomColor) {
    return 100; // Perfect Sandwich Rule symmetry
  }

  return 75;
}

// ─── Archetype Synergy Evaluator ─────────────────────────────────────
function archetypeSynergy(item: WardrobeItem, requestedArchetype?: FashionArchetype): number {
  if (!requestedArchetype) return 80;
  if (item.archetype === requestedArchetype) return 100;
  return 70;
}

// ─── Style Compatibility ─────────────────────────────────────────────
const STYLE_COMPAT: Record<StyleVibe, StyleVibe[]> = {
  'minimal':      ['minimal', 'smart casual', 'classic'],
  'streetwear':   ['streetwear', 'sporty', 'casual' as StyleVibe],
  'smart casual': ['smart casual', 'minimal', 'classic'],
  'classic':      ['classic', 'smart casual', 'minimal'],
  'sporty':       ['sporty', 'streetwear'],
  'cozy':         ['cozy', 'minimal', 'casual' as StyleVibe],
};

function styleScore(s1: StyleVibe, s2: StyleVibe): number {
  const compat = STYLE_COMPAT[s1] || [];
  return compat.includes(s2) ? 100 : 65;
}

// ─── Score a full outfit combination with Trend Rules ────────────────
function scoreOutfit(
  top: WardrobeItem,
  bottom: WardrobeItem,
  shoes: WardrobeItem | undefined,
  outer: WardrobeItem | undefined,
  criteria: RecommendationCriteria,
): number {
  let weightedScore = 0;
  let totalWeight = 0;

  // 1. Color Harmony (Top + Bottom)
  weightedScore += colorScore(top.color, bottom.color) * 1.2;
  totalWeight += 1.2;

  // 2. Silhouette Proportions (Cropped/Slim Top + Baggy/Wide-Leg/Bootcut Bottom)
  const silScore = silhouetteScore(top, bottom);
  weightedScore += silScore * 1.5;
  totalWeight += 1.5;

  // 3. Sandwich Rule (Top & Shoes balance vs Bottoms)
  if (shoes) {
    const swScore = sandwichScore(top, bottom, shoes);
    weightedScore += swScore * 1.0;
    totalWeight += 1.0;
  }

  // 4. Style Vibe Coherence
  weightedScore += styleScore(top.style, bottom.style) * 0.8;
  totalWeight += 0.8;

  // 5. Archetype Coherence (if requested)
  if (criteria.archetype) {
    const archTop = archetypeSynergy(top, criteria.archetype);
    const archBottom = archetypeSynergy(bottom, criteria.archetype);
    weightedScore += ((archTop + archBottom) / 2) * 1.3;
    totalWeight += 1.3;
  }

  // 6. Occasion Match Bonus
  if (top.occasions.includes(criteria.occasion)) weightedScore += 12;
  if (bottom.occasions.includes(criteria.occasion)) weightedScore += 12;

  // 7. Outerwear layering harmony
  if (outer) {
    weightedScore += colorScore(outer.color, top.color) * 0.7;
    totalWeight += 0.7;
  }

  return Math.min(99, Math.max(86, Math.round(weightedScore / totalWeight)));
}

// ─── Generate human-readable reasoning ────────────────────────────────
function buildReasoning(
  top: WardrobeItem,
  bottom: WardrobeItem,
  shoes: WardrobeItem | undefined,
  outer: WardrobeItem | undefined,
  occasion: OccasionType,
  archetype?: FashionArchetype,
): string {
  const silScore = silhouetteScore(top, bottom);
  const isTrendSilhouette = silScore >= 95;
  const isSandwich = shoes ? sandwichScore(top, bottom, shoes) === 100 : false;

  let text = '';

  if (isTrendSilhouette) {
    text += `Engineered with the 2025/2026 contemporary golden proportion: a structured ${top.subCategory || 'cropped top'} balanced against high-volume ${bottom.subCategory || 'wide-leg bottoms'}.`;
  } else {
    text += `Harmoniously proportioned pairing your ${top.color} ${top.name} with ${bottom.color} ${bottom.name}.`;
  }

  if (isSandwich && shoes) {
    text += ` Styled using the Sandwich Rule — your ${top.color} upper mirrors your ${shoes.color} footwear, framing the ${bottom.color} bottoms as the clean focal contrast.`;
  }

  if (archetype) {
    const archetypeMap: Record<FashionArchetype, string> = {
      'old money': ' Curated under the Old Money aesthetic with understated quiet luxury poise, tailored pleats, and timeless heritage drape.',
      'streetwear': ' Infused with modern Streetwear energy, stacking heavy oversized denim puddle breaks over retro runners.',
      'minimalist': ' Crafted through a pure Minimalist lens — intentional boxy cuts, crisp neutral tones, and architectural restraint.',
      'Y2K': ' Channeling Y2K aesthetics with a nostalgic baby tee cut, flared bootcut lines, and cyber-mesh accents.',
      'dark academia': ' Structured with Dark Academia mood, pairing collegiate double-pleated wool with rich charcoal and lug derbies.',
      'clean fit': ' Masterclass in the Clean Fit aesthetic — zero graphic clutter, razor-sharp proportions, and effortless modern drape.',
      'techwear': ' Framed with Techwear utility, pairing weather-resistant modular cargo drape with sleek stealth lines.',
      'boho': ' Flowing with relaxed Bohemian movement, loose airy textures, and natural tonal harmony.',
      'vintage': ' Rooted in mid-century Vintage authenticity with washed faded textures and classic stacked denim breaks.',
      'luxe': ' Engineered with high-end Luxe sophistication, delivering commanding evening polish and sculptural tailoring.',
    };
    text += archetypeMap[archetype] || ` Curated specifically for the ${archetype} aesthetic.`;
  }

  if (shoes) {
    text += ` The ${shoes.name} anchors the silhouette, letting the wide leg hem puddle naturally over the footwear.`;
  }

  if (outer) {
    text += ` Layered with the ${outer.name} to add an architectural third-piece dimension.`;
  }

  const occasionMap: Partial<Record<OccasionType, string>> = {
    college: 'campus rotation and study sessions',
    casual: 'relaxed everyday city wear',
    date: 'an effortlessly polished date night',
    party: 'social nightlife and evening events',
    formal: 'elevated contemporary formal wear',
    sporty: 'active street-ready utility',
  };
  text += ` Ideal for ${occasionMap[occasion] || occasion}.`;

  return text;
}

function buildStylingTip(top: WardrobeItem, bottom: WardrobeItem, outer: WardrobeItem | undefined): string {
  const tips = [
    `Let the ${bottom.subCategory || 'wide bottoms'} puddle and stack naturally over your sneakers for that effortless contemporary break.`,
    `Keep the ${top.subCategory || 'cropped top'} untucked — modern styling favors the 1:2 torso-to-leg golden ratio.`,
    `Notice the Sandwich Rule: match your sunglasses or bag tone to your shoes to frame the contrasting trousers.`,
    outer ? `Wear the ${outer.subCategory || 'outerwear'} unbuttoned to create strong vertical lines against your wide-leg silhouette.` : `Add a minimal silver box chain to draw focus upwards towards your neckline.`,
    `Because the pants have generous volume, avoid bulky belts to keep the waistline seamless and clean.`,
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

function outfitTitle(occasion: OccasionType, style: StyleVibe, variant: number, archetype?: FashionArchetype): string {
  const variantLabel = variant === 1 ? '' : variant === 2 ? ' (Alt)' : ' (Remix)';
  const occasionLabel: Record<OccasionType, string> = {
    college: 'Campus',
    casual: 'Everyday',
    date: 'Date Night',
    party: 'Night Out',
    formal: 'Sharp',
    sporty: 'Active',
  };
  const styleLabel: Record<StyleVibe, string> = {
    minimal: 'Minimal',
    streetwear: 'Street',
    'smart casual': 'Smart Casual',
    classic: 'Classic',
    sporty: 'Sport',
    cozy: 'Cozy',
  };
  const archetypeLabel: Partial<Record<FashionArchetype, string>> = {
    'old money': 'Old Money',
    streetwear: 'Streetwear',
    minimalist: 'Minimalist',
    Y2K: 'Y2K',
    'dark academia': 'Dark Academia',
    'clean fit': 'Clean Fit',
    techwear: 'Techwear',
    boho: 'Boho',
    vintage: 'Vintage',
    luxe: 'Luxe',
  };
  const archetypePrefix = archetype && archetypeLabel[archetype] ? `${archetypeLabel[archetype]} ` : '';
  return `${archetypePrefix}${occasionLabel[occasion] ?? occasion} ${styleLabel[style] ?? style} Look${variantLabel}`;
}

// ─── Main Recommendation Engine ─────────────────────────────────────
class OutfitService {

  async generateRecommendations(criteria: RecommendationCriteria): Promise<OutfitRecommendation[]> {
    const allItems = await wardrobeService.getItems();

    const genderFilter = (item: WardrobeItem) => {
      if (!criteria.gender || criteria.gender === 'all') return true;
      return item.gender === criteria.gender || item.gender === 'unisex';
    };
    const scopedItems = allItems.filter(genderFilter);

    // If scoped items have both tops and bottoms, use them; otherwise fallback gracefully
    const pool = (scopedItems.filter(i => i.category === 'tops').length > 0 && scopedItems.filter(i => i.category === 'bottoms').length > 0)
      ? scopedItems
      : allItems;

    const tops = pool.filter(i => i.category === 'tops');
    const bottoms = pool.filter(i => i.category === 'bottoms');
    const outerwears = pool.filter(i => i.category === 'outerwear');
    const footwears = pool.filter(i => i.category === 'footwear');
    const accessories = pool.filter(i => i.category === 'accessories');

    if (tops.length === 0 || bottoms.length === 0) return [];

    // Score every top × bottom combination
    type Combo = { top: WardrobeItem; bottom: WardrobeItem; score: number };
    const combos: Combo[] = [];

    for (const top of tops) {
      for (const bottom of bottoms) {
        const bestShoes = footwears.length > 0
          ? footwears.reduce((best, s) =>
              colorScore(s.color, bottom.color) > colorScore(best.color, bottom.color) ? s : best,
              footwears[0]
            )
          : undefined;
        const needOuter = criteria.weather === 'cold' || criteria.weather === 'mild';
        const bestOuter = needOuter && outerwears.length > 0
          ? outerwears.reduce((best, o) =>
              colorScore(o.color, top.color) > colorScore(best.color, top.color) ? o : best,
              outerwears[0]
            )
          : undefined;

        const score = scoreOutfit(top, bottom, bestShoes, bestOuter, criteria);
        combos.push({ top, bottom, score });
      }
    }

    // Sort by score desc, take top 3 unique combos
    combos.sort((a, b) => b.score - a.score);

    // Deduplicate — avoid repeating the same top or same bottom
    const usedTops = new Set<string>();
    const usedBottoms = new Set<string>();
    const best: Combo[] = [];

    for (const combo of combos) {
      if (best.length >= 3) break;
      // First combo: no restriction
      if (best.length === 0) {
        best.push(combo);
        usedTops.add(combo.top.id);
        usedBottoms.add(combo.bottom.id);
        continue;
      }
      // Subsequent combos: prefer different items for variety
      const topReused = usedTops.has(combo.top.id);
      const bottomReused = usedBottoms.has(combo.bottom.id);
      // Allow if at least one is different
      if (!topReused || !bottomReused) {
        best.push(combo);
        usedTops.add(combo.top.id);
        usedBottoms.add(combo.bottom.id);
      }
    }

    // Fallback: if we couldn't get 2+ unique, relax constraint
    if (best.length < 2 && combos.length >= 2) {
      for (const combo of combos) {
        if (best.length >= 2) break;
        if (!best.find(b => b.top.id === combo.top.id && b.bottom.id === combo.bottom.id)) {
          best.push(combo);
        }
      }
    }

    const recommendations: OutfitRecommendation[] = best.map((combo, idx) => {
      const needOuter = criteria.weather === 'cold' || criteria.weather === 'mild';

      // Best shoes for THIS combo
      const shoes = footwears.length > 0
        ? footwears
            .filter(s => !best.slice(0, idx).some(b => {
              const prevShoes = footwears.reduce((bs, s2) =>
                colorScore(s2.color, b.bottom.color) > colorScore(bs.color, b.bottom.color) ? s2 : bs,
                footwears[0]
              );
              return prevShoes.id === s.id;
            }))
            .sort((a, b) => colorScore(b.color, combo.bottom.color) - colorScore(a.color, combo.bottom.color))[0]
          || footwears[0]
        : undefined;

      // Best outerwear for THIS combo
      const outer = needOuter && outerwears.length > 0
        ? outerwears
            .sort((a, b) => colorScore(b.color, combo.top.color) - colorScore(a.color, combo.top.color))[0]
        : undefined;

      // Best accessory
      const acc = accessories[idx % accessories.length];

      const items = [combo.top, combo.bottom, outer, shoes, acc].filter(Boolean) as WardrobeItem[];

      return {
        id: `rec-${Date.now()}-${idx}`,
        title: outfitTitle(criteria.occasion, criteria.style, idx + 1, criteria.archetype),
        occasion: criteria.occasion,
        style: criteria.style,
        archetype: criteria.archetype,
        gender: criteria.gender && criteria.gender !== 'all' ? criteria.gender : undefined,
        items,
        compatibilityScore: combo.score,
        reasoning: buildReasoning(combo.top, combo.bottom, shoes, outer, criteria.occasion, criteria.archetype),
        stylingTip: buildStylingTip(combo.top, combo.bottom, outer),
        createdAt: new Date().toISOString(),
      };
    });

    return recommendations;
  }

  // ─── History ──────────────────────────────────────────────────────
  getHistory(): HistoryEntry[] {
    try {
      const stored = localStorage.getItem(OUTFIT_HISTORY_KEY);
      if (!stored) return this.getDemoHistory();
      const parsed: HistoryEntry[] = JSON.parse(stored);
      return parsed.length === 0 ? this.getDemoHistory() : parsed;
    } catch {
      return this.getDemoHistory();
    }
  }

  private getDemoHistory(): HistoryEntry[] {
    return [
      {
        id: 'hist-demo-1',
        outfitId: 'demo-1',
        title: 'Campus Minimalist Look',
        dateWorn: '2026-10-12',
        occasion: 'college',
        items: [],
        notes: 'Wore the white tee + raw denim combo. Felt super comfortable for the 4-hour lab.',
      },
      {
        id: 'hist-demo-2',
        outfitId: 'demo-2',
        title: 'Downtown Casual Coffee Run',
        dateWorn: '2026-10-08',
        occasion: 'casual',
        items: [],
        notes: 'Layered the sage overshirt. Got a few compliments on the color combination.',
      },
      {
        id: 'hist-demo-3',
        outfitId: 'demo-3',
        title: 'Evening Dinner Date',
        dateWorn: '2026-10-02',
        occasion: 'date',
        items: [],
        notes: 'Leather jacket + charcoal trousers. Classic dark look that never fails.',
      },
      {
        id: 'hist-demo-4',
        outfitId: 'demo-4',
        title: 'Casual Friday Errand Day',
        dateWorn: '2026-09-28',
        occasion: 'casual',
        items: [],
        notes: 'The hoodie + jeans combo again — noticed I keep falling back to this.',
      },
    ];
  }

  saveHistory(history: HistoryEntry[]): void {
    localStorage.setItem(OUTFIT_HISTORY_KEY, JSON.stringify(history));
  }

  async recordOutfitWorn(outfit: OutfitRecommendation, notes?: string): Promise<HistoryEntry> {
    const today = new Date().toISOString().split('T')[0];
    const currentHistory = this.getHistory();

    const newEntry: HistoryEntry = {
      id: `hist-${Date.now()}`,
      outfitId: outfit.id,
      title: outfit.title,
      dateWorn: today,
      occasion: outfit.occasion,
      items: outfit.items,
      notes,
    };

    this.saveHistory([newEntry, ...currentHistory]);

    // Update wear counts
    for (const item of outfit.items) {
      try {
        await wardrobeService.recordWear(item.id, today);
      } catch {
        // item might be demo-only, skip silently
      }
    }

    return newEntry;
  }

  // ─── Saved Outfits ────────────────────────────────────────────────
  getSavedOutfits(): OutfitRecommendation[] {
    try {
      const stored = localStorage.getItem(SAVED_OUTFITS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveOutfit(outfit: OutfitRecommendation): void {
    const current = this.getSavedOutfits();
    if (current.find(o => o.id === outfit.id)) return; // Already saved
    localStorage.setItem(SAVED_OUTFITS_KEY, JSON.stringify([outfit, ...current]));
  }
}

export const outfitService = new OutfitService();
