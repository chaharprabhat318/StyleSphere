import { useState, useEffect } from 'react';
import { X, Sparkles, Image as ImageIcon, Check } from 'lucide-react';
import type { ClothingCategory, OccasionType, StyleVibe, WardrobeItem } from '../../types/wardrobe';
import { wardrobeService } from '../../services/wardrobeService';

interface ItemUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded: (item: WardrobeItem) => void;
}

export const ItemUploadModal: React.FC<ItemUploadModalProps> = ({ isOpen, onClose, onItemAdded }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ClothingCategory>('tops');
  const [subCategory, setSubCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [color, setColor] = useState('Chalk White');
  const [colorHex, setColorHex] = useState('#F8F9FA');
  const [style, setStyle] = useState<StyleVibe>('minimal');
  const [occasions, setOccasions] = useState<OccasionType[]>(['casual', 'college']);
  const [season, setSeason] = useState<'spring' | 'summer' | 'fall' | 'winter' | 'all-season'>('all-season');
  const [brand, setBrand] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setCategory('tops');
      setSubCategory('');
      setImageUrl('');
      setColor('Chalk White');
      setColorHex('#F8F9FA');
      setStyle('minimal');
      setOccasions(['casual', 'college']);
      setSeason('all-season');
      setBrand('');
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPEG, PNG, WEBP).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be under 5MB.');
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleOccasion = (occ: OccasionType) => {
    if (occasions.includes(occ)) {
      if (occasions.length > 1) {
        setOccasions(occasions.filter((o) => o !== occ));
      }
    } else {
      setOccasions([...occasions, occ]);
    }
  };

  // Aesthetic Preset Auto-Fill for instantaneous demo
  const handleSimulatedAutoTag = () => {
    setName('Structured Cashmere Knit Crewneck');
    setCategory('tops');
    setSubCategory('Cashmere Knit');
    setColor('Warm Oatmeal');
    setColorHex('#E6D5B8');
    setStyle('smart casual');
    setOccasions(['college', 'casual', 'date']);
    setSeason('fall');
    setBrand('Loro Piana');
    setImageUrl('https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=85');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a garment name.');
      return;
    }
    if (!imageUrl) {
      setError('Please upload an image or select a link.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newItemData: Omit<WardrobeItem, 'id' | 'createdAt' | 'wearCount'> = {
        name: name.trim(),
        category,
        subCategory: subCategory.trim() || undefined,
        imageUrl,
        color,
        colorHex,
        style,
        occasions,
        season,
        brand: brand.trim() || undefined,
        isFavorite: false,
      };

      const created = await wardrobeService.addItem(newItemData);
      onItemAdded(created);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories: ClothingCategory[] = ['tops', 'bottoms', 'outerwear', 'footwear', 'accessories'];
  const styles: StyleVibe[] = ['minimal', 'streetwear', 'smart casual', 'classic', 'sporty', 'cozy'];
  const occasionList: OccasionType[] = ['college', 'casual', 'party', 'formal', 'date'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-editorial text-xl text-slate-900 font-normal">Catalog New Piece</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-sans-clean">
              Archive a garment into your private digital capsule
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto font-sans-clean">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs">
              {error}
            </div>
          )}

          {/* Image Upload Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Garment Photograph *
              </label>
              <button
                type="button"
                onClick={handleSimulatedAutoTag}
                className="flex items-center gap-1.5 text-xs text-[#0e244d] hover:text-[#193a77] cursor-pointer font-bold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Fill Editorial Piece</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div className="border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/30 transition-colors rounded-2xl p-4 text-center cursor-pointer relative bg-slate-50/70">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">Upload Photo</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG under 5MB</span>
                </div>
              </div>

              {/* Preview Box */}
              <div className="h-28 rounded-2xl border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden relative">
                {imageUrl ? (
                  <img src={imageUrl} alt="Garment Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-slate-400 font-sans-clean">Image Preview</span>
                )}
              </div>
            </div>

            {/* URL input */}
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Or paste an image web link (https://...)"
              className="mt-2 w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Piece Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Poplin Overshirt"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Brand / Atelier
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Lemaire, Acne, Uniqlo"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Category & Style */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ClothingCategory)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white capitalize cursor-pointer transition-colors"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Aesthetic Vibe
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as StyleVibe)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white capitalize cursor-pointer transition-colors"
              >
                {styles.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Color & Tone Swatch */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Dominant Tone
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Chalk White, Muted Sage"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Color Swatch
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="w-10 h-10 rounded-xl bg-transparent border border-slate-200 cursor-pointer p-0.5"
                />
                <span className="text-xs text-slate-500 font-medium">{colorHex}</span>
              </div>
            </div>
          </div>

          {/* Occasions */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Occasions
            </label>
            <div className="flex flex-wrap gap-2">
              {occasionList.map((occ) => {
                const isSelected = occasions.includes(occ);
                return (
                  <button
                    type="button"
                    key={occ}
                    onClick={() => toggleOccasion(occ)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-colors capitalize flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#0e244d] text-white font-semibold border border-[#1e3a8a] shadow-xs'
                        : 'bg-slate-50 border border-slate-200/90 text-slate-600 hover:text-[#0e244d] hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                    <span>{occ}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full bg-[#0e244d] hover:bg-[#15346d] text-white border border-[#1e3a8a] text-xs font-semibold tracking-wide shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Cataloging...' : 'Add to Closet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
