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
export interface CoverageWarning {
  type: 'archetype' | 'style' | 'occasion' | 'weather';
  message: string;
}

// ─── Modern Color Harmony & Compatibility Matrix ─────────────────────────────
const COLOR_COMPAT: Record<string, string[]> = {
  white:    ['black', 'navy', 'blue', 'grey', 'beige', 'khaki', 'charcoal', 'brown', 'olive', 'green', 'sage', 'cream', 'oatmeal', 'terracotta', 'lavender', 'rose', 'slate', 'taupe'],
  black:    ['white', 'grey', 'charcoal', 'beige', 'cream', 'navy', 'red', 'khaki', 'brown', 'camel', 'silver', 'gold', 'olive', 'blue', 'taupe', 'sand'],
  grey:     ['white', 'black', 'charcoal', 'navy', 'blue', 'beige', 'burgundy', 'silver', 'slate', 'cream'],
  charcoal: ['white', 'light blue', 'beige', 'cream', 'camel', 'brown', 'burgundy', 'grey', 'black', 'silver'],
  navy:     ['white', 'beige', 'grey', 'khaki', 'camel', 'light blue', 'cream', 'oatmeal', 'silver', 'gold'],
  blue:     ['white', 'navy', 'grey', 'beige', 'khaki', 'brown', 'camel', 'cream'],
  beige:    ['white', 'black', 'navy', 'brown', 'camel', 'olive', 'khaki', 'charcoal', 'cream', 'taupe', 'gold'],
  brown:    ['beige', 'khaki', 'white', 'camel', 'navy', 'olive', 'cream', 'black', 'gold'],
  camel:    ['white', 'black', 'navy', 'grey', 'brown', 'charcoal', 'beige', 'cream'],
  khaki:    ['white', 'navy', 'brown', 'beige', 'olive', 'black', 'cream'],
  olive:    ['white', 'black', 'khaki', 'beige', 'brown', 'navy', 'cream', 'orange', 'gold'],
  green:    ['white', 'beige', 'khaki', 'brown', 'navy', 'black', 'cream'],
  sage:     ['white', 'beige', 'black', 'brown', 'khaki', 'grey', 'cream', 'olive'],
  cream:    ['black', 'navy', 'brown', 'olive', 'khaki', 'charcoal', 'beige', 'blue', 'terracotta', 'gold', 'white'],
  oatmeal:  ['black', 'navy', 'brown', 'olive', 'charcoal', 'beige'],
  burgundy: ['beige', 'grey', 'charcoal', 'navy', 'white', 'black', 'khaki', 'gold'],
  red:      ['black', 'white', 'navy', 'grey'],
  gold:     ['black', 'white', 'navy', 'beige', 'cream', 'brown', 'olive', 'burgundy'],
  silver:   ['black', 'white', 'grey', 'charcoal', 'navy', 'blue', 'slate'],
  orange:   ['black', 'white', 'grey', 'navy', 'olive', 'khaki'],
  rose:     ['white', 'grey', 'beige', 'cream', 'black', 'navy'],
  taupe:    ['white', 'black', 'cream', 'beige', 'brown', 'navy'],
  slate:    ['white', 'black', 'grey', 'navy', 'silver'],
};

function normalizeColor(color: string): string {
  return (color || '').toLowerCase()
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
    .replace('gold & steel', 'gold')
    .replace('two-tone gold', 'gold')
    .trim();
}

function colorScore(c1: string, c2: string): number {
  const n1 = normalizeColor(c1);
  const n2 = normalizeColor(c2);
  if (n1 === n2) return 85; // Monochromatic look
  const compatList = COLOR_COMPAT[n1] || [];
  if (compatList.some((c) => n2.includes(c))) return 100;
  const compatList2 = COLOR_COMPAT[n2] || [];
  if (compatList2.some((c) => n1.includes(c))) return 100;
  return 60;
}

// ─── 2025/2026 Golden Proportion & Silhouette Rule ───────────────────────────
function silhouetteScore(top: WardrobeItem, bottom: WardrobeItem): number {
  const topText = `${top.name} ${top.subCategory || ''}`.toLowerCase();
  const bottomText = `${bottom.name} ${bottom.subCategory || ''}`.toLowerCase();

  const isCropped =
    top.fit === 'cropped' ||
    topText.includes('cropped') ||
    topText.includes('baby tee') ||
    topText.includes('corset');
  const isOversizedOrBoxy =
    top.fit === 'boxy' ||
    top.fit === 'relaxed' ||
    topText.includes('oversized') ||
    topText.includes('boxy');
  const isSleekOrFitted =
    top.fit === 'sleek' ||
    top.fit === 'slim' ||
    topText.includes('fitted') ||
    topText.includes('ribbed');

  const isWideOrBaggy =
    bottom.fit === 'wide-leg' ||
    bottom.fit === 'baggy' ||
    bottomText.includes('wide') ||
    bottomText.includes('baggy') ||
    bottomText.includes('puddle');
  const isBootcut =
    bottom.fit === 'bootcut' ||
    bottomText.includes('bootcut') ||
    bottomText.includes('flare');
  const isStraightOrPleated =
    bottom.fit === 'straight' ||
    bottomText.includes('straight') ||
    bottomText.includes('pleated') ||
    bottomText.includes('tailored');

  // Hard penalty for skinny cuts
  if (bottomText.includes('skinny')) return 15;

  // 1. Cropped Top + Wide-Leg / Baggy Bottom (Golden 1:2 Ratio)
  if (isCropped && isWideOrBaggy) return 100;

  // 2. Cropped Top + Bootcut / Flare (Y2K / 90s Runway)
  if (isCropped && isBootcut) return 98;

  // 3. Oversized Boxy Top + Baggy / Puddle Bottom (Tokyo/Seoul Streetwear Drape)
  if (isOversizedOrBoxy && isWideOrBaggy) return 96;

  // 4. Sleek/Fitted Top + Wide-Leg Bottom (Clean Parisian Silhouette)
  if (isSleekOrFitted && isWideOrBaggy) return 95;

  // 5. Sleek/Fitted Top + Straight/Pleated Bottom (Old Money Tailored Poise)
  if (isSleekOrFitted && isStraightOrPleated) return 94;

  // 6. Oversized Boxy Top + Straight/Bootcut Bottom
  if (isOversizedOrBoxy && (isStraightOrPleated || isBootcut)) return 92;

  // 7. General wide-leg pairing
  if (isWideOrBaggy) return 88;

  return 80;
}

// ─── Sandwich Rule: Top & Shoe Color Mirroring ────────────────────────────────
function sandwichScore(
  top: WardrobeItem,
  bottom: WardrobeItem,
  shoes: WardrobeItem | undefined,
): number {
  if (!shoes) return 75;
  const topColor = normalizeColor(top.color);
  const shoeColor = normalizeColor(shoes.color);
  const bottomColor = normalizeColor(bottom.color);

  // If top and shoes share dominant color family while contrasting with pants
  if (
    (topColor === shoeColor || colorScore(top.color, shoes.color) >= 85) &&
    topColor !== bottomColor
  ) {
    return 100;
  }
  return 75;
}

// ─── Archetype & Occasion Scoring ─────────────────────────────────────────────
function archetypeSynergy(item: WardrobeItem, requestedArchetype?: FashionArchetype): number {
  if (!requestedArchetype) return 80;
  if (item.archetype === requestedArchetype) return 100;
  return 35; // Distinct penalty for mismatching requested archetype
}

const STYLE_COMPAT: Record<StyleVibe, StyleVibe[]> = {
  minimal:        ['minimal', 'smart casual', 'classic'],
  streetwear:     ['streetwear', 'sporty', 'casual' as StyleVibe],
  'smart casual': ['smart casual', 'minimal', 'classic'],
  classic:        ['classic', 'smart casual', 'minimal'],
  sporty:         ['sporty', 'streetwear'],
  cozy:           ['cozy', 'minimal', 'casual' as StyleVibe],
};

function styleScore(s1: StyleVibe, s2: StyleVibe): number {
  const compat = STYLE_COMPAT[s1] || [];
  return compat.includes(s2) ? 100 : 50;
}

// ─── Season / Weather Compatibility ──────────────────────────────────────────
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

function preferredColorBoost(items: WardrobeItem[], preferredColor: string): number {
  const target = preferredColor.toLowerCase();
  const matchCount = items.filter((item) => {
    const nc = normalizeColor(item.color);
    return nc === target || nc.includes(target);
  }).length;
  if (matchCount >= 2) return 100;
  if (matchCount === 1) return 85;
  return 40;
}

// ─── Master Scoring Function (User Intent-First Weighted Formulation) ─────────
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

  // 1. OCCASION MATCH (Weight 2.5) — Primary Driver
  const topOcc = top.occasions.includes(criteria.occasion) ? 100 : 30;
  const botOcc = bottom.occasions.includes(criteria.occasion) ? 100 : 30;
  const shoeOcc = shoes ? (shoes.occasions.includes(criteria.occasion) ? 100 : 40) : 75;
  const occAvg = (topOcc + botOcc + shoeOcc) / 3;
  add(occAvg, 2.5);

  // 2. ARCHETYPE SYNERGY (Weight 2.5) — Critical Aesthetic Driver
  if (criteria.archetype) {
    const topArch = archetypeSynergy(top, criteria.archetype);
    const botArch = archetypeSynergy(bottom, criteria.archetype);
    const shoeArch = shoes ? archetypeSynergy(shoes, criteria.archetype) : 80;
    const archAvg = (topArch * 1.2 + botArch * 1.2 + shoeArch * 0.6) / 3;
    add(archAvg, 2.5);
  }

  // 3. STYLE VIBE MATCH (Weight 1.8)
  const topStyleScore = top.style === criteria.style ? 100 : styleScore(top.style, criteria.style);
  const botStyleScore = bottom.style === criteria.style ? 100 : styleScore(bottom.style, criteria.style);
  add((topStyleScore + botStyleScore) / 2, 1.8);

  // 4. SILHOUETTE & PROPORTION (Weight 1.5)
  add(silhouetteScore(top, bottom), 1.5);

  // 5. COLOR HARMONY (Weight 1.2)
  add(colorScore(top.color, bottom.color), 1.2);

  // 6. SANDWICH RULE (Weight 1.0)
  if (shoes) {
    add(sandwichScore(top, bottom, shoes), 1.0);
  }

  // 7. PREFERRED COLOR BOOST (Weight 1.5 when requested)
  if (criteria.preferredColor && criteria.preferredColor !== 'all') {
    const comboItems = [top, bottom, ...(shoes ? [shoes] : [])];
    add(preferredColorBoost(comboItems, criteria.preferredColor), 1.5);
  }

  // 8. WEATHER COMPATIBILITY (Weight 0.8 when requested)
  if (criteria.weather) {
    const weatherPool = [top, bottom, ...(outer ? [outer] : [])];
    const avgSeason =
      weatherPool.reduce(
        (sum, item) => sum + seasonCompatibilityScore(item, criteria.weather!),
        0,
      ) / weatherPool.length;
    add(avgSeason, 0.8);
  }

  return Math.min(100, Math.max(10, Math.round(weightedScore / totalWeight)));
}

// ─── Coverage Warning Builder ─────────────────────────────────────────────────
function buildCoverageWarnings(
  pool: WardrobeItem[],
  criteria: RecommendationCriteria,
): CoverageWarning[] {
  const warnings: CoverageWarning[] = [];

  if (criteria.archetype) {
    const archetypeItems = pool.filter((i) => i.archetype === criteria.archetype);
    if (archetypeItems.length === 0) {
      warnings.push({
        type: 'archetype',
        message: `None of your wardrobe items are tagged with "${criteria.archetype}". The engine prioritized occasion, silhouette proportions, and color harmony.`,
      });
    }
  }

  const occasionItems = pool.filter((i) => i.occasions.includes(criteria.occasion));
  if (occasionItems.length < 2) {
    warnings.push({
      type: 'occasion',
      message: `Fewer than 2 wardrobe items are tagged for "${criteria.occasion}". Recommendations include the closest versatile alternatives.`,
    });
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
  const isTrendSilhouette = silScore >= 94;
  const isSandwich = shoes ? sandwichScore(top, bottom, shoes) === 100 : false;

  let text = '';

  if (isTrendSilhouette) {
    text += `Engineered with the 2025/2026 contemporary golden proportion: a structured ${top.subCategory || 'cropped upper'} balanced against high-volume ${bottom.subCategory || 'wide-leg trousers'}.`;
  } else {
    text += `Clean color blocking pairing the ${top.color} ${top.name} with ${bottom.color} ${bottom.name}.`;
  }

  if (isSandwich && shoes) {
    text += ` Styled using the Sandwich Rule: your ${top.color} top mirrors your ${shoes.color} footwear, framing the ${bottom.color} bottom as the focal balance.`;
  }

  if (archetype) {
    const archetypeMap: Record<FashionArchetype, string> = {
      'old money':     ' Curated under the Old Money aesthetic with understated quiet luxury poise, tailored pleats, and timeless heritage drape.',
      'streetwear':    ' Infused with modern Streetwear energy, stacking heavy oversized drape and raw denim breaks over hype sneakers.',
      'minimalist':    ' Crafted through a pure Minimalist lens — intentional cuts, clean neutral tones, and architectural restraint.',
      'Y2K':           ' Channeling Y2K aesthetics with a nostalgic baby tee cut, flared lines, and retro cyber-athletic accents.',
      'dark academia': ' Structured with Dark Academia mood, pairing collegiate double-pleats with rich charcoal and vintage leather accents.',
      'clean fit':     ' Masterclass in the Clean Fit aesthetic — zero graphic clutter, razor-sharp proportions, and effortless modern drape.',
      'techwear':      ' Framed with Techwear utility, pairing weather-resistant cargo lines with modern athletic silhouettes.',
      'boho':          ' Flowing with relaxed Bohemian movement, loose airy textures, and natural earthy tones.',
      'vintage':       ' Rooted in authentic Vintage aesthetics with washed faded textures and classic terrace gum-sole breaks.',
      'luxe':          ' Engineered with high-end Luxe sophistication, delivering commanding polish and sculptural tailoring.',
    };
    text += archetypeMap[archetype] || ` Curated specifically for the ${archetype} aesthetic.`;
  }

  if (shoes) {
    text += ` Grounded by the ${shoes.name}.`;
  }

  if (outer) {
    text += ` Layered with the ${outer.name} for modern dimensional depth.`;
  }

  const occasionMap: Partial<Record<OccasionType, string>> = {
    college: 'campus rotation and study sessions',
    casual:  'relaxed everyday wear',
    date:    'an effortlessly polished date night',
    party:   'social nightlife and weekend events',
    formal:  'elevated formal occasions',
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
    `Let the ${bottom.subCategory || 'trousers'} puddle naturally over the sneakers for a relaxed, contemporary stacking break.`,
    `Keep the ${top.subCategory || 'top'} untucked to emphasize the 1:2 torso-to-leg modern golden ratio.`,
    `Notice the Sandwich Rule: coordinate your watch or jewelry metal with the hardware on your footwear.`,
    outer
      ? `Wear the ${outer.subCategory || 'outerwear'} unbuttoned to form clean vertical lines against the silhouette.`
      : `Add a vintage timepiece or fine chain to draw focus upward toward the neckline.`,
    `Because the pants feature generous volume, keep accessories minimal to maintain a sharp, deliberate waistline.`,
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

function outfitTitle(
  occasion: OccasionType,
  style: StyleVibe,
  variant: number,
  archetype?: FashionArchetype,
): string {
  const variantLabel = variant === 1 ? ' Signature' : variant === 2 ? ' Alternate' : ' Remix';
  const occasionLabel: Record<OccasionType, string> = {
    college: 'Campus',
    casual:  'Everyday',
    date:    'Date Night',
    party:   'Night Out',
    formal:  'Executive',
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
  const archetypePrefix = archetype ? `${archetype.charAt(0).toUpperCase() + archetype.slice(1)} ` : '';
  return `${archetypePrefix}${occasionLabel[occasion] ?? occasion} ${styleLabel[style] ?? style}${variantLabel}`;
}

// ─── Recommendation Engine Class ──────────────────────────────────────────────
class OutfitService {
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

    const warnings = buildCoverageWarnings(pool, criteria);

    if (tops.length === 0 || bottoms.length === 0) {
      return { recommendations: [], warnings };
    }

    const needOuter = criteria.weather === 'cold' || criteria.weather === 'mild';

    type Combo = {
      top: WardrobeItem;
      bottom: WardrobeItem;
      shoes?: WardrobeItem;
      outer?: WardrobeItem;
      score: number;
      effectiveGender: 'men' | 'women' | 'unisex';
    };
    const combos: Combo[] = [];

    // Filter candidates by gender compatibility
    for (const top of tops) {
      for (const bottom of bottoms) {
        if (
          top.gender &&
          bottom.gender &&
          top.gender !== 'unisex' &&
          bottom.gender !== 'unisex' &&
          top.gender !== bottom.gender
        ) {
          continue;
        }

        const effectiveGender: 'men' | 'women' | 'unisex' =
          top.gender && top.gender !== 'unisex'
            ? top.gender
            : bottom.gender && bottom.gender !== 'unisex'
            ? bottom.gender
            : criteria.gender && criteria.gender !== 'all'
            ? criteria.gender
            : 'unisex';

        // Filter footwear strictly by gender
        const validShoes = footwears.filter((s) => {
          if (effectiveGender !== 'unisex' && s.gender && s.gender !== 'unisex' && s.gender !== effectiveGender) {
            return false;
          }
          return true;
        });

        // Best shoe ranking for this top + bottom
        let bestShoe: WardrobeItem | undefined = undefined;
        let bestShoeScore = -1;

        for (const s of validShoes) {
          let sScore = 70;
          // Occasion match (+20)
          if (s.occasions.includes(criteria.occasion)) sScore += 20;
          // Archetype synergy (+20)
          if (criteria.archetype && s.archetype === criteria.archetype) sScore += 20;
          // Sandwich rule (+25)
          if (sandwichScore(top, bottom, s) === 100) sScore += 25;
          // Color score with bottom
          sScore += (colorScore(s.color, bottom.color) - 50) * 0.2;

          if (sScore > bestShoeScore) {
            bestShoeScore = sScore;
            bestShoe = s;
          }
        }

        const shoes = bestShoe || (validShoes.length > 0 ? validShoes[0] : undefined);

        // Optional Outerwear selection
        let outer: WardrobeItem | undefined = undefined;
        if (needOuter && outerwears.length > 0) {
          const validOuter = outerwears.filter((o) => {
            if (effectiveGender !== 'unisex' && o.gender && o.gender !== 'unisex' && o.gender !== effectiveGender) {
              return false;
            }
            return true;
          });

          let bestOuter: WardrobeItem | undefined = undefined;
          let bestOuterScore = -1;
          for (const o of validOuter) {
            let oScore = colorScore(o.color, top.color);
            if (criteria.archetype && o.archetype === criteria.archetype) oScore += 20;
            if (o.occasions.includes(criteria.occasion)) oScore += 15;
            if (oScore > bestOuterScore) {
              bestOuterScore = oScore;
              bestOuter = o;
            }
          }
          outer = bestOuter || validOuter[0];
        }

        const score = scoreOutfit(top, bottom, shoes, outer, criteria);
        combos.push({ top, bottom, shoes, outer, score, effectiveGender });
      }
    }

    // Sort descending by highest score
    combos.sort((a, b) => b.score - a.score);

    // Select top 3 distinct, high-synergy outfits
    const usedTops    = new Set<string>();
    const usedBottoms = new Set<string>();
    const best: Combo[] = [];

    // Pass 1: Strict unique top and bottom
    for (const combo of combos) {
      if (best.length >= 3) break;
      if (!usedTops.has(combo.top.id) && !usedBottoms.has(combo.bottom.id)) {
        best.push(combo);
        usedTops.add(combo.top.id);
        usedBottoms.add(combo.bottom.id);
      }
    }

    // Pass 2: Relax if needed to always return 3 recommendations
    if (best.length < 3 && combos.length >= 3) {
      for (const combo of combos) {
        if (best.length >= 3) break;
        if (!best.some((b) => b.top.id === combo.top.id && b.bottom.id === combo.bottom.id)) {
          best.push(combo);
        }
      }
    }

    // Rotate accessories across the 3 looks
    const usedAccessories = new Set<string>();

    const recommendations: OutfitRecommendation[] = best.map((combo, idx) => {
      // Find matching accessory strictly obeying gender & aesthetic synergy
      const validAccessories = accessories.filter((a) => {
        if (combo.effectiveGender !== 'unisex' && a.gender && a.gender !== 'unisex' && a.gender !== combo.effectiveGender) {
          return false;
        }
        return true;
      });

      // Prefer unused accessory matching archetype
      let acc = validAccessories.find((a) => {
        if (usedAccessories.has(a.id)) return false;
        return a.archetype === criteria.archetype || a.archetype === combo.top.archetype;
      });

      // Fallback to any unused valid accessory
      if (!acc) {
        acc = validAccessories.find((a) => !usedAccessories.has(a.id));
      }

      // Last resort fallback
      if (!acc && validAccessories.length > 0) {
        acc = validAccessories[idx % validAccessories.length];
      }

      if (acc) {
        usedAccessories.add(acc.id);
      }

      const items = [combo.top, combo.bottom, combo.outer, combo.shoes, acc].filter(
        Boolean,
      ) as WardrobeItem[];

      return {
        id: `rec-${Date.now()}-${idx}`,
        title: outfitTitle(criteria.occasion, criteria.style, idx + 1, criteria.archetype),
        occasion: criteria.occasion,
        style: criteria.style,
        archetype: criteria.archetype,
        gender: criteria.gender && criteria.gender !== 'all' ? criteria.gender : combo.effectiveGender,
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

  // ─── History Methods ────────────────────────────────────────────────────────
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
        notes: 'Layered the sage overshirt. Got compliments on the color combination.',
      },
      {
        id: 'hist-demo-3',
        outfitId: 'demo-3',
        title: 'Evening Dinner Date',
        dateWorn: '2026-10-02',
        occasion: 'date',
        items: [],
        notes: 'Classic dark look that never fails.',
      },
      {
        id: 'hist-demo-4',
        outfitId: 'demo-4',
        title: 'Casual Errand Day',
        dateWorn: '2026-09-28',
        occasion: 'casual',
        items: [],
        notes: 'Streetwear wide leg denim break over retro court sneakers.',
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
        // skip if demo item
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
    if (current.find((o) => o.id === outfit.id)) return;
    localStorage.setItem(
      SAVED_OUTFITS_KEY,
      JSON.stringify([outfit, ...current]),
    );
  }
}

export const outfitService = new OutfitService();
