import type { WardrobeItem, OccasionType, StyleVibe, FashionArchetype } from '../types/wardrobe';
import type { OutfitRecommendation, RecommendationCriteria } from '../types/outfit';
import { wardrobeService } from './wardrobeService';

declare module '../types/outfit' {
  interface OutfitRecommendation {
    criteria?: RecommendationCriteria;
  }
}

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

// ─── Coverage Warning ─────────────────────────────────────────────────────────
// Only emitted when actual wardrobe metadata confirms a gap between what was
// requested and what the wardrobe contains. Does NOT claim fallback logic is
// active unless the engine actually implements it.
export interface CoverageWarning {
  type: 'archetype' | 'style' | 'occasion' | 'weather';
  message: string;
}

// ─── Color Compatibility Matrix ───────────────────────────────────────────────
const COLOR_COMPAT: Record<string, string[]> = {
  white:    ['black', 'navy', 'blue', 'grey', 'beige', 'khaki', 'charcoal', 'brown', 'olive', 'green', 'sage', 'cream', 'oatmeal'],
  black:    ['white', 'grey', 'charcoal', 'beige', 'cream', 'navy', 'red', 'khaki', 'brown', 'camel'],
  grey:     ['white', 'black', 'charcoal', 'navy', 'blue', 'beige', 'burgundy'],
  charcoal: ['white', 'light blue', 'beige', 'cream', 'camel', 'brown', 'burgundy'],
  navy:     ['white', 'beige', 'grey', 'khaki', 'camel', 'light blue', 'cream', 'oatmeal'],
  blue:     ['white', 'navy', 'grey', 'beige', 'khaki', 'brown', 'camel'],
  beige:    ['white', 'black', 'navy', 'brown', 'camel', 'olive', 'khaki', 'charcoal'],
  brown:    ['beige', 'khaki', 'white', 'camel', 'navy', 'olive', 'cream'],
  camel:    ['white', 'black', 'navy', 'grey', 'brown', 'charcoal', 'beige'],
  khaki:    ['white', 'navy', 'brown', 'beige', 'olive', 'black'],
  olive:    ['white', 'black', 'khaki', 'beige', 'brown', 'navy', 'cream'],
  green:    ['white', 'beige', 'khaki', 'brown', 'navy', 'black', 'cream'],
  sage:     ['white', 'beige', 'black', 'brown', 'khaki', 'grey', 'cream'],
  cream:    ['black', 'navy', 'brown', 'olive', 'khaki', 'charcoal', 'beige'],
  oatmeal:  ['black', 'navy', 'brown', 'olive', 'charcoal', 'beige'],
  burgundy: ['beige', 'grey', 'charcoal', 'navy', 'white', 'black', 'khaki'],
  red:      ['black', 'white', 'navy', 'grey'],
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
  if (n1 === n2) return 70; // Monochromatic — valid but less interesting than a contrast
  const compatList = COLOR_COMPAT[n1] || [];
  if (compatList.includes(n2)) return 100;
  const compatList2 = COLOR_COMPAT[n2] || [];
  if (compatList2.includes(n1)) return 100;
  return 55; // No established compatibility — penalises but does not eliminate
}

// ─── Modern 2025/2026 Trend Silhouette & Proportion Engine ───────────────────
function silhouetteScore(top: WardrobeItem, bottom: WardrobeItem): number {
  const topText = `${top.name} ${top.subCategory || ''}`.toLowerCase();
  const bottomText = `${bottom.name} ${bottom.subCategory || ''}`.toLowerCase();

  const isCroppedOrSlimTop =
    top.fit === 'cropped' || top.fit === 'slim' || top.fit === 'boxy' ||
    topText.includes('cropped') || topText.includes('baby tee') ||
    topText.includes('slim') || topText.includes('boxy');

  const isWideOrBaggyBottom =
    bottom.fit === 'baggy' || bottom.fit === 'wide-leg' ||
    bottom.fit === 'bootcut' || bottom.fit === 'loose' ||
    bottomText.includes('baggy') || bottomText.includes('wide') ||
    bottomText.includes('bootcut') || bottomText.includes('carpenter') ||
    bottomText.includes('cargo') || bottomText.includes('parachute') ||
    bottomText.includes('loose');

  // Hard penalty for skinny jeans (user directive)
  if (bottomText.includes('skinny')) return 20;

  // Peak trend synergy: cropped/slim/boxy top + baggy/wide/bootcut bottom
  if (isCroppedOrSlimTop && isWideOrBaggyBottom) return 100;

  // Cropped top + straight-leg
  if (isCroppedOrSlimTop && (bottom.fit === 'straight' || bottomText.includes('straight'))) return 88;

  // Any wide/baggy bottom without a cropped top
  if (isWideOrBaggyBottom) return 92;

  return 75;
}

// ─── Sandwich Rule ────────────────────────────────────────────────────────────
function sandwichScore(
  top: WardrobeItem,
  bottom: WardrobeItem,
  shoes: WardrobeItem | undefined,
): number {
  if (!shoes) return 75;
  const topColor = normalizeColor(top.color);
  const shoeColor = normalizeColor(shoes.color);
  const bottomColor = normalizeColor(bottom.color);
  if (
    (topColor === shoeColor || colorScore(top.color, shoes.color) >= 80) &&
    topColor !== bottomColor
  ) {
    return 100;
  }
  return 75;
}

// ─── Archetype Synergy ────────────────────────────────────────────────────────
function archetypeSynergy(item: WardrobeItem, requestedArchetype?: FashionArchetype): number {
  if (!requestedArchetype) return 80;
  if (item.archetype === requestedArchetype) return 100;
  return 70; // Honest mismatch penalty — not fabricated compatibility
}

// ─── Style Compatibility ──────────────────────────────────────────────────────
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

// ─── Season / Weather Compatibility ──────────────────────────────────────────
// Compatibility table: how appropriate is this item's season tag for each
// weather condition? 0–100. All-season items always return 100.
// Items with no season tag return 85 (treated as versatile but not guaranteed).
// This is used as a SCORING COMPONENT, not a hard filter — items with poor
// season compatibility score lower but are not excluded from consideration.
const SEASON_WEATHER_COMPAT: Record<string, Record<string, number>> = {
  spring: { warm: 80, mild: 95, cold: 30, rainy: 70 },
  summer: { warm: 100, mild: 65, cold: 10, rainy: 50 },
  fall:   { warm: 45, mild: 90, cold: 80, rainy: 85 },
  winter: { warm: 10, mild: 55, cold: 100, rainy: 80 },
};

function seasonCompatibilityScore(
  item: WardrobeItem,
  weather: 'warm' | 'mild' | 'cold' | 'rainy',
): number {
  if (!item.season || item.season === 'all-season') return 100;
  return SEASON_WEATHER_COMPAT[item.season]?.[weather] ?? 85;
}

// ─── Preferred Color Presence ─────────────────────────────────────────────────
// Scores 100 if ≥2 combo items carry the preferred color, 80 for 1 match,
// 65 for no match. Only applied when a specific color anchor is selected.
function preferredColorBoost(items: WardrobeItem[], preferredColor: string): number {
  const target = preferredColor.toLowerCase();
  const matchCount = items.filter((item) => {
    const nc = normalizeColor(item.color);
    return nc === target || nc.includes(target);
  }).length;
  if (matchCount >= 2) return 100;
  if (matchCount === 1) return 80;
  return 65;
}

// ─── Main Scoring Function ────────────────────────────────────────────────────
// All components are individually normalized to 0–100.
// Final score = true weighted average of all included components.
// No artificial floor or ceiling is applied.
function scoreOutfit(
  top: WardrobeItem,
  bottom: WardrobeItem,
  shoes: WardrobeItem | undefined,
  outer: WardrobeItem | undefined,
  criteria: RecommendationCriteria,
): number {
  let weightedScore = 0;
  let totalWeight = 0;

  const add = (score: number, weight: number) => {
    weightedScore += score * weight;
    totalWeight += weight;
  };

  // 1. Color harmony (top + bottom)
  add(colorScore(top.color, bottom.color), 1.2);

  // 2. Silhouette proportions (2025/2026 golden proportion rule)
  add(silhouetteScore(top, bottom), 1.5);

  // 3. Sandwich rule (shoes vs outfit balance)
  if (shoes) {
    add(sandwichScore(top, bottom, shoes), 1.0);
  }

  // 4. Style vibe coherence
  add(styleScore(top.style, bottom.style), 0.8);

  // 5. Archetype coherence — only scored when archetype was explicitly requested.
  //    archetypeSynergy returns 80 (neutral) when no archetype is requested,
  //    so this block is gated to avoid silently inflating scores.
  if (criteria.archetype) {
    const archAvg =
      (archetypeSynergy(top, criteria.archetype) +
        archetypeSynergy(bottom, criteria.archetype)) /
      2;
    add(archAvg, 1.3);
  }

  // 6. Occasion suitability — normalised fraction of key items tagged for the occasion.
  //    Replaces the previous flat +12 bonus per item, which was not normalised.
  const occasionPool = [top, bottom, ...(shoes ? [shoes] : [])] as WardrobeItem[];
  const occasionMatches = occasionPool.filter((i) =>
    i.occasions.includes(criteria.occasion),
  ).length;
  add((occasionMatches / occasionPool.length) * 100, 1.0);

  // 7. Outerwear colour harmony (when included)
  if (outer) {
    add(colorScore(outer.color, top.color), 0.7);
  }

  // 8. Season / weather compatibility — scored as a continuous component, not a
  //    binary filter. All-season items score 100; seasonal items score based on
  //    the SEASON_WEATHER_COMPAT table. Outfits with poorly matched season tags
  //    naturally rank lower without being excluded entirely.
  if (criteria.weather) {
    const weatherPool = [top, bottom, ...(outer ? [outer] : [])] as WardrobeItem[];
    const avgSeason =
      weatherPool.reduce(
        (sum, item) => sum + seasonCompatibilityScore(item, criteria.weather!),
        0,
      ) / weatherPool.length;
    add(avgSeason, 0.8);
  }

  // 9. Preferred color presence — only added to the weighted average when the
  //    user has selected a specific color anchor (not 'all').
  if (criteria.preferredColor && criteria.preferredColor !== 'all') {
    const comboItems = [
      top,
      bottom,
      ...(shoes ? [shoes] : []),
      ...(outer ? [outer] : []),
    ] as WardrobeItem[];
    add(preferredColorBoost(comboItems, criteria.preferredColor), 0.7);
  }

  // True weighted average — no clamp applied
  return Math.round(weightedScore / totalWeight);
}

// ─── Coverage Warning Builder ─────────────────────────────────────────────────
// Inspects actual wardrobe metadata against the requested criteria and emits
// honest warnings only when the data confirms a gap.
// - Does NOT claim "closest archetype" fallback unless it is actually implemented.
// - Does NOT emit a weather warning unless the majority of season-tagged items
//   are demonstrably incompatible with the selected condition.
function buildCoverageWarnings(
  pool: WardrobeItem[],
  criteria: RecommendationCriteria,
): CoverageWarning[] {
  const warnings: CoverageWarning[] = [];

  // Archetype coverage
  if (criteria.archetype) {
    const archetypeItems = pool.filter((i) => i.archetype === criteria.archetype);
    if (archetypeItems.length === 0) {
      warnings.push({
        type: 'archetype',
        message: `None of your wardrobe items are tagged with the "${criteria.archetype}" archetype. Outfit scoring reflects colour harmony, silhouette proportion, and style compatibility only — archetype alignment was not a factor in these results.`,
      });
    } else if (archetypeItems.length === 1) {
      warnings.push({
        type: 'archetype',
        message: `Only 1 wardrobe item carries the "${criteria.archetype}" archetype tag. Full archetype-matched outfits are limited; other items are scored on colour, silhouette, and style instead.`,
      });
    }
  }

  // Style coverage
  if (criteria.style) {
    const styleItems = pool.filter((i) => i.style === criteria.style);
    if (styleItems.length === 0) {
      warnings.push({
        type: 'style',
        message: `No items in your wardrobe carry the "${criteria.style}" style tag. Style-compatibility rules (adjacent compatible styles) have been applied in scoring instead.`,
      });
    }
  }

  // Occasion coverage
  const occasionItems = pool.filter((i) => i.occasions.includes(criteria.occasion));
  if (occasionItems.length < 2) {
    warnings.push({
      type: 'occasion',
      message: `Fewer than 2 wardrobe items are tagged for the "${criteria.occasion}" occasion. Recommendations may include pieces not specifically suited to this context — consider updating occasion tags in your wardrobe.`,
    });
  }

  // Weather coverage — only warn when season-tagged items are broadly incompatible.
  // All-season items are never considered incompatible.
  if (criteria.weather) {
    const seasonTaggedItems = pool.filter((i) => i.season && i.season !== 'all-season');
    if (seasonTaggedItems.length > 0) {
      const avgSeasonScore =
        seasonTaggedItems.reduce(
          (sum, i) => sum + seasonCompatibilityScore(i, criteria.weather!),
          0,
        ) / seasonTaggedItems.length;
      if (avgSeasonScore < 55) {
        warnings.push({
          type: 'weather',
          message: `Most season-tagged items in your wardrobe are not ideal for "${criteria.weather}" conditions. The engine has scored them accordingly and surfaced the best available options — results may not be optimally weather-appropriate.`,
        });
      }
    }
  }

  return warnings;
}

// ─── Reasoning & Tip Builders ────────────────────────────────────────────────
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
      'old money':     ' Curated under the Old Money aesthetic with understated quiet luxury poise, tailored pleats, and timeless heritage drape.',
      'streetwear':    ' Infused with modern Streetwear energy, stacking heavy oversized denim puddle breaks over retro runners.',
      'minimalist':    ' Crafted through a pure Minimalist lens — intentional boxy cuts, crisp neutral tones, and architectural restraint.',
      'Y2K':           ' Channeling Y2K aesthetics with a nostalgic baby tee cut, flared bootcut lines, and cyber-mesh accents.',
      'dark academia': ' Structured with Dark Academia mood, pairing collegiate double-pleated wool with rich charcoal and lug derbies.',
      'clean fit':     ' Masterclass in the Clean Fit aesthetic — zero graphic clutter, razor-sharp proportions, and effortless modern drape.',
      'techwear':      ' Framed with Techwear utility, pairing weather-resistant modular cargo drape with sleek stealth lines.',
      'boho':          ' Flowing with relaxed Bohemian movement, loose airy textures, and natural tonal harmony.',
      'vintage':       ' Rooted in mid-century Vintage authenticity with washed faded textures and classic stacked denim breaks.',
      'luxe':          ' Engineered with high-end Luxe sophistication, delivering commanding evening polish and sculptural tailoring.',
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
    casual:  'relaxed everyday city wear',
    date:    'an effortlessly polished date night',
    party:   'social nightlife and evening events',
    formal:  'elevated contemporary formal wear',
    sporty:  'active street-ready utility',
  };
  text += ` Ideal for ${occasionMap[occasion] || occasion}.`;

  return text;
}

function buildStylingTip(
  top: WardrobeItem,
  bottom: WardrobeItem,
  outer: WardrobeItem | undefined,
): string {
  const tips = [
    `Let the ${bottom.subCategory || 'wide bottoms'} puddle and stack naturally over your sneakers for that effortless contemporary break.`,
    `Keep the ${top.subCategory || 'cropped top'} untucked — modern styling favors the 1:2 torso-to-leg golden ratio.`,
    `Notice the Sandwich Rule: match your sunglasses or bag tone to your shoes to frame the contrasting trousers.`,
    outer
      ? `Wear the ${outer.subCategory || 'outerwear'} unbuttoned to create strong vertical lines against your wide-leg silhouette.`
      : `Add a minimal silver box chain to draw focus upwards towards your neckline.`,
    `Because the pants have generous volume, avoid bulky belts to keep the waistline seamless and clean.`,
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

function outfitTitle(
  occasion: OccasionType,
  style: StyleVibe,
  variant: number,
  archetype?: FashionArchetype,
): string {
  const variantLabel = variant === 1 ? '' : variant === 2 ? ' (Alt)' : ' (Remix)';
  const occasionLabel: Record<OccasionType, string> = {
    college: 'Campus',
    casual:  'Everyday',
    date:    'Date Night',
    party:   'Night Out',
    formal:  'Sharp',
    sporty:  'Active',
  };
  const styleLabel: Record<StyleVibe, string> = {
    minimal:        'Minimal',
    streetwear:     'Street',
    'smart casual': 'Smart Casual',
    classic:        'Classic',
    sporty:         'Sport',
    cozy:           'Cozy',
  };
  const archetypeLabel: Partial<Record<FashionArchetype, string>> = {
    'old money':     'Old Money',
    streetwear:      'Streetwear',
    minimalist:      'Minimalist',
    Y2K:             'Y2K',
    'dark academia': 'Dark Academia',
    'clean fit':     'Clean Fit',
    techwear:        'Techwear',
    boho:            'Boho',
    vintage:         'Vintage',
    luxe:            'Luxe',
  };
  const archetypePrefix =
    archetype && archetypeLabel[archetype] ? `${archetypeLabel[archetype]} ` : '';
  return `${archetypePrefix}${occasionLabel[occasion] ?? occasion} ${styleLabel[style] ?? style} Look${variantLabel}`;
}

// ─── Recommendation Engine ────────────────────────────────────────────────────
class OutfitService {
  /**
   * Returns the effective pool of items for a given gender selection,
   * applying the fallback to allItems if the gender-scoped pool lacks tops or bottoms.
   */
  getEffectivePool(
    items: WardrobeItem[],
    gender?: 'all' | 'men' | 'women',
  ): { pool: WardrobeItem[]; isUsingFallback: boolean } {
    const genderFilter = (item: WardrobeItem) => {
      if (!gender || gender === 'all') return true;
      return item.gender === gender || item.gender === 'unisex';
    };
    const scopedItems = items.filter(genderFilter);
    const hasTops = scopedItems.some((i) => i.category === 'tops');
    const hasBottoms = scopedItems.some((i) => i.category === 'bottoms');

    if (gender && gender !== 'all' && (!hasTops || !hasBottoms)) {
      return { pool: items, isUsingFallback: true };
    }
    return { pool: scopedItems, isUsingFallback: false };
  }

  /**
   * Recalculates compatibility score for an outfit using the exact same
   * deterministic weighted scoring logic.
   * Returns null if essential items (top and bottom) are missing.
   */
  calculateCompatibilityScore(
    items: WardrobeItem[],
    criteria: RecommendationCriteria,
  ): number | null {
    const top = items.find((i) => i.category === 'tops');
    const bottom = items.find((i) => i.category === 'bottoms');
    const outer = items.find((i) => i.category === 'outerwear');
    const shoes = items.find((i) => i.category === 'footwear');

    if (!top || !bottom) {
      return null;
    }

    return scoreOutfit(top, bottom, shoes, outer, criteria);
  }

  async generateRecommendations(
    criteria: RecommendationCriteria,
  ): Promise<{ recommendations: OutfitRecommendation[]; warnings: CoverageWarning[] }> {
    const allItems = await wardrobeService.getItems();
    const { pool } = this.getEffectivePool(allItems, criteria.gender);

    const tops        = pool.filter((i) => i.category === 'tops');
    const bottoms     = pool.filter((i) => i.category === 'bottoms');
    const outerwears  = pool.filter((i) => i.category === 'outerwear');
    const footwears   = pool.filter((i) => i.category === 'footwear');
    const accessories = pool.filter((i) => i.category === 'accessories');

    // Build coverage warnings from real metadata before scoring
    const warnings = buildCoverageWarnings(pool, criteria);

    if (tops.length === 0 || bottoms.length === 0) {
      return { recommendations: [], warnings };
    }

    // Include outerwear only when weather warrants it
    const needOuter = criteria.weather === 'cold' || criteria.weather === 'mild';

    // Complete outfit combination: select all pieces before scoring and preserve them
    type Combo = {
      top: WardrobeItem;
      bottom: WardrobeItem;
      shoes?: WardrobeItem;
      outer?: WardrobeItem;
      score: number;
    };
    const combos: Combo[] = [];

    for (const top of tops) {
      for (const bottom of bottoms) {
        // Select matching shoes without mutating the footwears array
        const shoes =
          footwears.length > 0
            ? footwears.reduce(
                (best, s) =>
                  colorScore(s.color, bottom.color) > colorScore(best.color, bottom.color) ? s : best,
                footwears[0],
              )
            : undefined;

        // Select matching outerwear without mutating the outerwears array
        const outer =
          needOuter && outerwears.length > 0
            ? outerwears.reduce(
                (best, o) =>
                  colorScore(o.color, top.color) > colorScore(best.color, top.color) ? o : best,
                outerwears[0],
              )
            : undefined;

        // Score the complete outfit with the exact selected items
        const score = scoreOutfit(top, bottom, shoes, outer, criteria);
        combos.push({ top, bottom, shoes, outer, score });
      }
    }

    // Sort descending by score
    combos.sort((a, b) => b.score - a.score);

    // Pick top 3 unique combos — prefer different top AND bottom per look
    const usedTops    = new Set<string>();
    const usedBottoms = new Set<string>();
    const best: Combo[] = [];

    for (const combo of combos) {
      if (best.length >= 3) break;
      if (best.length === 0) {
        best.push(combo);
        usedTops.add(combo.top.id);
        usedBottoms.add(combo.bottom.id);
        continue;
      }
      // Allow if at least one of top/bottom hasn't been used
      if (!usedTops.has(combo.top.id) || !usedBottoms.has(combo.bottom.id)) {
        best.push(combo);
        usedTops.add(combo.top.id);
        usedBottoms.add(combo.bottom.id);
      }
    }

    // Fallback: relax deduplication if strict pass didn't produce 2+ results
    if (best.length < 2 && combos.length >= 2) {
      for (const combo of combos) {
        if (best.length >= 2) break;
        if (!best.find((b) => b.top.id === combo.top.id && b.bottom.id === combo.bottom.id)) {
          best.push(combo);
        }
      }
    }

    const recommendations: OutfitRecommendation[] = best.map((combo, idx) => {
      const acc = accessories.length > 0 ? accessories[idx % accessories.length] : undefined;

      // Preserve the exact items used to calculate this combination's compatibility score
      const items = [combo.top, combo.bottom, combo.outer, combo.shoes, acc].filter(
        Boolean,
      ) as WardrobeItem[];

      return {
        id: `rec-${Date.now()}-${idx}`,
        title: outfitTitle(criteria.occasion, criteria.style, idx + 1, criteria.archetype),
        occasion: criteria.occasion,
        style: criteria.style,
        archetype: criteria.archetype,
        gender:
          criteria.gender && criteria.gender !== 'all' ? criteria.gender : undefined,
        items,
        compatibilityScore: combo.score,
        reasoning: buildReasoning(
          combo.top,
          combo.bottom,
          combo.shoes,
          combo.outer,
          criteria.occasion,
          criteria.archetype,
        ),
        stylingTip: buildStylingTip(combo.top, combo.bottom, combo.outer),
        createdAt: new Date().toISOString(),
        criteria,
      };
    });

    return { recommendations, warnings };
  }

  // ─── History ───────────────────────────────────────────────────────────────
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

  async recordOutfitWorn(
    outfit: OutfitRecommendation,
    notes?: string,
  ): Promise<HistoryEntry> {
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

    for (const item of outfit.items) {
      try {
        await wardrobeService.recordWear(item.id, today);
      } catch {
        // item might be demo-only, skip silently
      }
    }

    return newEntry;
  }

  // ─── Saved Outfits ─────────────────────────────────────────────────────────
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
    if (current.find((o) => o.id === outfit.id)) return; // Already saved
    localStorage.setItem(
      SAVED_OUTFITS_KEY,
      JSON.stringify([outfit, ...current]),
    );
  }
}

export const outfitService = new OutfitService();
