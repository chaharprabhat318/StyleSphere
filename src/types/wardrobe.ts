export type ClothingCategory = 
  | 'tops' 
  | 'bottoms' 
  | 'outerwear' 
  | 'footwear' 
  | 'accessories';

export type OccasionType = 
  | 'college' 
  | 'casual' 
  | 'party' 
  | 'formal' 
  | 'date' 
  | 'sporty';

export type StyleVibe = 
  | 'minimal' 
  | 'streetwear' 
  | 'smart casual' 
  | 'classic' 
  | 'sporty' 
  | 'cozy';

export type GenderCategory = 'men' | 'women' | 'unisex';

export interface WardrobeItem {
  id: string;
  name: string;
  category: ClothingCategory;
  subCategory?: string; // e.g. "Oversized Tee", "Slim Jeans", "Sneakers"
  imageUrl: string;
  color: string;
  colorHex?: string;
  style: StyleVibe;
  gender?: GenderCategory;
  occasions: OccasionType[];
  season?: 'spring' | 'summer' | 'fall' | 'winter' | 'all-season';
  brand?: string;
  wearCount: number;
  lastWornDate?: string; // ISO date string YYYY-MM-DD
  isFavorite?: boolean;
  createdAt: string;
}

export interface WardrobeFilterOptions {
  searchQuery: string;
  category: ClothingCategory | 'all';
  gender?: GenderCategory | 'all';
  color: string | 'all';
  occasion: OccasionType | 'all';
  sortBy: 'recently_added' | 'most_worn' | 'least_worn' | 'name';
}
