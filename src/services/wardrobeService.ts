import type { WardrobeItem, WardrobeFilterOptions } from '../types/wardrobe';
import { INITIAL_WARDROBE, CURATED_SAMPLE_WARDROBE } from '../data/mockWardrobe';

const LEGACY_STORAGE_KEYS = [
  'stylesphere_wardrobe_items_v1',
  'stylesphere_wardrobe_items_v2',
  'stylesphere_wardrobe_items_v3',
  'stylesphere_wardrobe_items_v3_trending',
  'stylesphere_wardrobe_items',
  'stylesphere_wardrobe_trending_2026_v4',
  'stylesphere_wardrobe_trending_2026_v5_pro',
  'stylesphere_wardrobe_user_v6',
  'stylesphere_wardrobe_bottoms_v8_fresh',
  'stylesphere_wardrobe_official_bottoms_v9',
  'stylesphere_wardrobe_official_bottoms_v10',
  'stylesphere_wardrobe_complete_v11',
];

const STORAGE_KEY = 'stylesphere_wardrobe_complete_v12';

// Base API configuration for Member 3's FastAPI backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class WardrobeService {
  private memoryCache: WardrobeItem[] | null = null;

  private getStoredItems(): WardrobeItem[] {
    if (this.memoryCache !== null) {
      return this.memoryCache;
    }

    try {
      // Actively purge older version keys from user browser cache
      LEGACY_STORAGE_KEYS.forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {}
      });

      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        this.memoryCache = [...INITIAL_WARDROBE];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_WARDROBE));
        } catch (e) {
          console.warn('Could not persist initial wardrobe to localStorage', e);
        }
        return this.memoryCache;
      }

      const parsed: WardrobeItem[] = JSON.parse(stored);
      this.memoryCache = parsed;
      return parsed;
    } catch (e) {
      console.warn('Failed to parse wardrobe from localStorage, falling back to initial data', e);
      this.memoryCache = [...INITIAL_WARDROBE];
      return this.memoryCache;
    }
  }

  private saveStoredItems(items: WardrobeItem[]): void {
    this.memoryCache = items;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save wardrobe to localStorage (quota or disabled), retained in memoryCache', e);
      try {
        LEGACY_STORAGE_KEYS.forEach((k) => {
          try {
            localStorage.removeItem(k);
          } catch {}
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (err2) {
        console.warn('LocalStorage quota still exceeded, retained in memory cache only', err2);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('stylesphere:wardrobe-updated'));
    }
  }

  async getItems(filters?: Partial<WardrobeFilterOptions>): Promise<WardrobeItem[]> {
    // If backend is active and configured:
    if (import.meta.env.VITE_USE_REAL_BACKEND === 'true') {
      try {
        const res = await fetch(`${API_BASE_URL}/wardrobe`);
        if (res.ok) {
          const remoteItems = await res.json();
          return remoteItems;
        }
      } catch (err) {
        console.warn('Real backend unreachable, falling back to local storage', err);
      }
    }

    // Local / Offline fallback
    let items = this.getStoredItems();

    if (filters) {
      if (filters.gender && filters.gender !== 'all') {
        if (filters.gender === 'unisex') {
          items = items.filter((item) => item.gender === 'unisex');
        } else {
          items = items.filter((item) => item.gender === filters.gender || item.gender === 'unisex');
        }
      }
      if (filters.category && filters.category !== 'all') {
        items = items.filter((item) => item.category === filters.category);
      }
      if (filters.occasion && filters.occasion !== 'all') {
        items = items.filter((item) => item.occasions.includes(filters.occasion as any));
      }
      if (filters.color && filters.color !== 'all') {
        items = items.filter((item) => item.color.toLowerCase() === filters.color?.toLowerCase());
      }
      if (filters.searchQuery && filters.searchQuery.trim() !== '') {
        const query = filters.searchQuery.toLowerCase();
        items = items.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.subCategory?.toLowerCase().includes(query) ||
            item.brand?.toLowerCase().includes(query) ||
            item.style.toLowerCase().includes(query)
        );
      }
      if (filters.sortBy) {
        items = [...items].sort((a, b) => {
          if (filters.sortBy === 'recently_added') {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          if (filters.sortBy === 'most_worn') {
            return b.wearCount - a.wearCount;
          }
          if (filters.sortBy === 'least_worn') {
            return a.wearCount - b.wearCount;
          }
          if (filters.sortBy === 'name') {
            return a.name.localeCompare(b.name);
          }
          return 0;
        });
      }
    }

    return items;
  }

  async getItemById(id: string): Promise<WardrobeItem | null> {
    const items = this.getStoredItems();
    return items.find((item) => item.id === id) || null;
  }

  async addItem(itemData: Omit<WardrobeItem, 'id' | 'createdAt' | 'wearCount'>): Promise<WardrobeItem> {
    const newItem: WardrobeItem = {
      ...itemData,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      wearCount: 0,
    };

    const currentItems = this.getStoredItems();
    const updated = [newItem, ...currentItems];
    this.saveStoredItems(updated);

    // Sync with backend if available
    if (import.meta.env.VITE_USE_REAL_BACKEND === 'true') {
      try {
        await fetch(`${API_BASE_URL}/wardrobe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem),
        });
      } catch (err) {
        console.warn('Failed to sync new item with backend', err);
      }
    }

    return newItem;
  }

  async updateItem(id: string, updates: Partial<WardrobeItem>): Promise<WardrobeItem> {
    const currentItems = this.getStoredItems();
    const index = currentItems.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Item with ID ${id} not found.`);
    }

    const updatedItem = { ...currentItems[index], ...updates };
    currentItems[index] = updatedItem;
    this.saveStoredItems(currentItems);

    return updatedItem;
  }

  async deleteItem(id: string): Promise<boolean> {
    const currentItems = this.getStoredItems();
    const filtered = currentItems.filter((item) => item.id !== id);
    this.saveStoredItems(filtered);

    if (import.meta.env.VITE_USE_REAL_BACKEND === 'true') {
      try {
        await fetch(`${API_BASE_URL}/wardrobe/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('Failed to sync item deletion with backend', err);
      }
    }

    return true;
  }

  async toggleFavorite(id: string): Promise<WardrobeItem> {
    const item = await this.getItemById(id);
    if (!item) throw new Error('Item not found');
    return this.updateItem(id, { isFavorite: !item.isFavorite });
  }

  async recordWear(id: string, dateStr: string = new Date().toISOString().split('T')[0]): Promise<WardrobeItem> {
    const item = await this.getItemById(id);
    if (!item) throw new Error('Item not found');
    return this.updateItem(id, {
      wearCount: item.wearCount + 1,
      lastWornDate: dateStr,
    });
  }

  async clearWardrobe(): Promise<WardrobeItem[]> {
    this.memoryCache = [];
    this.saveStoredItems([]);
    return [];
  }

  async loadSampleWardrobe(): Promise<WardrobeItem[]> {
    this.memoryCache = [...CURATED_SAMPLE_WARDROBE];
    this.saveStoredItems(this.memoryCache);
    return this.memoryCache;
  }

  async resetToDefault(): Promise<WardrobeItem[]> {
    this.memoryCache = [...INITIAL_WARDROBE];
    this.saveStoredItems(this.memoryCache);
    return this.memoryCache;
  }
}

export const wardrobeService = new WardrobeService();
