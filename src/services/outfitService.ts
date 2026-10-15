import type { WardrobeItem, OccasionType, StyleVibe } from '../types/wardrobe';
import type { OutfitRecommendation, RecommendationCriteria } from '../types/outfit';
import { wardrobeService } from './wardrobeService';

const OUTFIT_HISTORY_KEY = 'stylesphere_outfit_history_v2';
const SAVED_OUTFITS_KEY = 'stylesphere_saved_outfits_v1';

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
    .replace('light ', '').replace('dark ', '').replace('off-', '')
    .replace('navy blue', 'navy').replace('raw indigo', 'navy')
    .replace('muted taupe', 'beige').replace('tortoiseshell', 'brown')
    .replace('vintage charcoal', 'charcoal').replace('indigo', 'navy')
    .trim();
}

function colorScore(c1: string, c2: string): number {
  const n1 = normalizeColor(c1);
  const n2 = normalizeColor(c2);
  if (n1 === n2) return 60; // Same color, not ideal but ok
  const compatList = COLOR_COMPAT[n1] || [];
  if (compatList.includes(n2)) return 100;
  // Check reverse
  const compatList2 = COLOR_COMPAT[n2] || [];
  if (compatList2.includes(n1)) return 100;
  return 40; // Unknown / less compatible
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
  return compat.includes(s2) ? 100 : 60;
}

// ─── Score a full outfit combination ─────────────────────────────────
function scoreOutfit(
  top: WardrobeItem,
  bottom: WardrobeItem,
  shoes: WardrobeItem | undefined,
  outer: WardrobeItem | undefined,
  criteria: RecommendationCriteria,
): number {
  let score = 0;
  let factors = 0;

  // Color: top + bottom
  score += colorScore(top.color, bottom.color);
  factors++;

  // Color: shoes + one of top/bottom
  if (shoes) {
    score += colorScore(shoes.color, bottom.color) * 0.6;
    score += colorScore(shoes.color, top.color) * 0.4;
    factors++;
  }

  // Color: outer + inner
  if (outer) {
    score += colorScore(outer.color, top.color) * 0.7;
    score += colorScore(outer.color, bottom.color) * 0.3;
    factors++;
  }

  // Style coherence top + bottom
  score += styleScore(top.style, bottom.style);
  factors++;

  // Occasion match bonus
  const topMatchesOcc = top.occasions.includes(criteria.occasion) ? 20 : 0;
  const bottomMatchesOcc = bottom.occasions.includes(criteria.occasion) ? 20 : 0;
  score += topMatchesOcc + bottomMatchesOcc;

  // Style match bonus
  const topMatchesStyle = top.style === criteria.style ? 20 : 0;
  const bottomMatchesStyle = bottom.style === criteria.style ? 20 : 0;
  score += topMatchesStyle + bottomMatchesStyle;

  return Math.min(99, Math.round(score / factors));
}

// ─── Generate human-readable reasoning ────────────────────────────────
function buildReasoning(
  top: WardrobeItem,
  bottom: WardrobeItem,
  shoes: WardrobeItem | undefined,
  outer: WardrobeItem | undefined,
  occasion: OccasionType,
): string {
  const cs = colorScore(top.color, bottom.color);
  const colorRelation = cs >= 100 ? 'a perfectly complementary' : cs >= 70 ? 'a harmonious' : 'a contrasting';

  let text = `This outfit builds around ${colorRelation} color pairing — your ${top.color} ${top.subCategory || top.name} with ${bottom.color} ${bottom.subCategory || bottom.name}.`;

  if (outer) {
    text += ` The ${outer.name} adds a layered dimension that works well for ${occasion === 'college' ? 'transitioning between classes' : occasion === 'date' ? 'the evening chill' : 'layered versatility'}.`;
  }

  if (shoes) {
    text += ` Grounded with the ${shoes.name}, the silhouette stays ${shoes.style === 'minimal' ? 'clean and unfussy' : shoes.style === 'streetwear' ? 'street-ready' : 'elevated'}.`;
  }

  const occasionMap: Partial<Record<OccasionType, string>> = {
    college: 'comfortable enough for long campus days while still looking put-together',
    casual: 'relaxed and easy to wear all day without overthinking',
    date: 'polished without trying too hard — effortlessly stylish',
    party: 'eye-catching and energetic for a social night out',
    formal: 'sharp and professional with a clean, structured feel',
    sporty: 'functional and athletic with a sporty edge',
  };

  text += ` Overall this works for ${occasion} — it's ${occasionMap[occasion] || 'well-balanced for the occasion'}.`;
  return text;
}

function buildStylingTip(top: WardrobeItem, bottom: WardrobeItem, outer: WardrobeItem | undefined): string {
  const tips = [
    `Half-tuck the ${top.subCategory || 'top'} at the front of your ${bottom.subCategory || 'bottoms'} to create shape without looking stiff.`,
    `Roll the cuffs of your ${bottom.subCategory || 'bottoms'} once to draw attention to your shoes and add a casual, intentional touch.`,
    outer ? `Wear the ${outer.subCategory || 'layer'} open and relaxed — let it drape naturally over your shoulders when indoors.` : `Push up your sleeves slightly to keep things from looking too formal.`,
    `Keep accessories minimal with this combination — a single wrist piece or clean bag is all you need.`,
    `This palette works well with either a matte or subtle shine bag — avoid loud prints in accessories to let the outfit breathe.`,
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

function outfitTitle(occasion: OccasionType, style: StyleVibe, variant: number): string {
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
  return `${occasionLabel[occasion] ?? occasion} ${styleLabel[style] ?? style} Look${variantLabel}`;
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
        title: outfitTitle(criteria.occasion, criteria.style, idx + 1),
        occasion: criteria.occasion,
        style: criteria.style,
        gender: criteria.gender && criteria.gender !== 'all' ? criteria.gender : undefined,
        items,
        compatibilityScore: combo.score,
        reasoning: buildReasoning(combo.top, combo.bottom, shoes, outer, criteria.occasion),
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
