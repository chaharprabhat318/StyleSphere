import type { OccasionType, StyleVibe, WardrobeItem, GenderCategory } from './wardrobe';

export interface OutfitRecommendation {
  id: string;
  title: string;
  occasion: OccasionType;
  style: StyleVibe;
  gender?: GenderCategory;
  items: WardrobeItem[];
  reasoning: string;
  stylingTip: string;
  compatibilityScore: number; // 0 to 100
  isSaved?: boolean;
  wornCount?: number;
  lastWornDate?: string;
  createdAt: string;
}

export interface RecommendationCriteria {
  occasion: OccasionType;
  style: StyleVibe;
  gender?: 'men' | 'women' | 'all';
  weather?: 'warm' | 'mild' | 'cold' | 'rainy';
  preferredColor?: string;
}
