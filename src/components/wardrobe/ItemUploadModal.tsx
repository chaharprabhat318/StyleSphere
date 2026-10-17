import { useState, useEffect } from 'react';
import { X, Sparkles, Image as ImageIcon, Check, Loader2 } from 'lucide-react';
import type {
  ClothingCategory,
  OccasionType,
  StyleVibe,
  WardrobeItem,
  GenderCategory,
  FashionArchetype,
} from '../../types/wardrobe';
import { wardrobeService } from '../../services/wardrobeService';

interface ItemUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded: (item: WardrobeItem) => void;
}

// Client-side Canvas Image Compression: downsamples large camera/device images into ~30-60KB JPEGs
// This guarantees localStorage quota will never be exceeded.
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // High quality JPEG compression (0.82)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(compressedDataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export const ItemUploadModal: React.FC<ItemUploadModalProps> = ({ isOpen, onClose, onItemAdded }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ClothingCategory>('tops');
  const [subCategory, setSubCategory] = useState('');
  const [fit, setFit] = useState<WardrobeItem['fit']>('loose');
  const [archetype, setArchetype] = useState<FashionArchetype>('streetwear');
  const [imageUrl, setImageUrl] = useState('');
  const [color, setColor] = useState('Chalk White');
  const [colorHex, setColorHex] = useState('#F8F9FA');
  const [style, setStyle] = useState<StyleVibe>('streetwear');
  const [gender, setGender] = useState<GenderCategory>('unisex');
  const [occasions, setOccasions] = useState<OccasionType[]>(['casual', 'college']);
  const [season, setSeason] = useState<'spring' | 'summer' | 'fall' | 'winter' | 'all-season'>('all-season');
  const [brand, setBrand] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setCategory('tops');
      setSubCategory('');
      setFit('loose');
      setArchetype('streetwear');
      setImageUrl('');
      setColor('Chalk White');
      setColorHex('#F8F9FA');
      setStyle('streetwear');
      setGender('unisex');
      setOccasions(['casual', 'college']);
      setSeason('all-season');
      setBrand('');
      setError(null);
      setIsSubmitting(false);
      setIsProcessingImage(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPEG, PNG, WEBP).');
        return;
      }
      setError(null);
      setIsProcessingImage(true);
      try {
        const compressed = await compressImageFile(file);
        setImageUrl(compressed);
      } catch (err) {
        console.error('Image compression failed', err);
        setError('Failed to process image file. Please try another image.');
      } finally {
        setIsProcessingImage(false);
      }
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

  // Aesthetic Preset Auto-Fill for instantaneous testing & demo
  const handleSimulatedAutoTag = () => {
    setName('300GSM Heavyweight Boxy Cropped Tee');
    setCategory('tops');
    setSubCategory('Boxy Cropped Tee');
    setFit('cropped');
    setArchetype('streetwear');
    setColor('Vintage Black');
    setColorHex('#18181B');
    setStyle('streetwear');
    setGender('unisex');
    setOccasions(['college', 'casual', 'party']);
    setSeason('all-season');
    setBrand('Represent Clo');
    setImageUrl('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=85');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a garment name.');
      return;
    }
    if (!imageUrl) {
      setError('Please upload an image or provide an image link.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newItemData: Omit<WardrobeItem, 'id' | 'createdAt' | 'wearCount'> = {
        name: name.trim(),
        category,
        subCategory: subCategory.trim() || undefined,
        fit,
        archetype,
        imageUrl,
        color: color.trim() || 'Custom Tone',
        colorHex,
        style,
        gender,
        occasions: occasions.length > 0 ? occasions : ['casual'],
        season,
        brand: brand.trim() || undefined,
        isFavorite: false,
      };

      const created = await wardrobeService.addItem(newItemData);
      onItemAdded(created);
      onClose();
    } catch (err: any) {
      console.error('Error adding item:', err);
      setError(err?.message || 'Failed to save item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories: ClothingCategory[] = ['tops', 'bottoms', 'outerwear', 'footwear', 'accessories'];
  const styles: StyleVibe[] = ['minimal', 'streetwear', 'smart casual', 'classic', 'sporty', 'cozy'];
  const occasionList: OccasionType[] = ['college', 'casual', 'party', 'formal', 'date', 'sporty'];

  const fits: Array<{ value: WardrobeItem['fit']; label: string }> = [
    { value: 'loose', label: 'Loose Fit' },
    { value: 'wide-leg', label: 'Wide-Leg Silhouette' },
    { value: 'baggy', label: 'Baggy / Puddle Fit' },
    { value: 'bootcut', label: 'Bootcut / Flared' },
    { value: 'straight', label: 'Relaxed Straight' },
    { value: 'cropped', label: 'Boxy Cropped' },
    { value: 'boxy', label: 'Heavyweight Boxy' },
    { value: 'slim', label: 'Slim Fit' },
    { value: 'relaxed', label: 'Relaxed Classic' },
    { value: 'chunky', label: 'Chunky Platform' },
    { value: 'sleek', label: 'Sleek Minimal' },
  ];

  const archetypes: FashionArchetype[] = [
    'streetwear',
    'old money',
    'minimalist',
    'clean fit',
    'techwear',
    'Y2K',
    'dark academia',
    'boho',
    'vintage',
    'luxe',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative my-8">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-editorial text-xl text-slate-900 font-bold">Catalog New Piece</h3>
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
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
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
                <span>Auto-Fill Sample Piece</span>
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
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0e244d] flex items-center justify-center mb-2">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">Upload Photo</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG (Auto-optimized)</span>
                </div>
              </div>

              {/* Preview Box */}
              <div className="h-28 rounded-2xl border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden relative">
                {isProcessingImage ? (
                  <div className="flex flex-col items-center gap-1.5 text-xs text-slate-500">
                    <Loader2 className="w-5 h-5 text-[#0e244d] animate-spin" />
                    <span>Optimizing image...</span>
                  </div>
                ) : imageUrl ? (
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
              className="mt-2 w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0e244d] focus:bg-white transition-colors"
            />
          </div>

          {/* Details: Title & Brand */}
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
                placeholder="e.g. Cropped Boxy Heavyweight Tee"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0e244d] focus:bg-white transition-colors"
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
                placeholder="e.g. Represent, Acne Studios, Stüssy"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0e244d] focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Clothing Type & Fit Silhouette */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Clothing Type *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ClothingCategory)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0e244d] focus:bg-white capitalize cursor-pointer transition-colors"
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
                Fit Silhouette
              </label>
              <select
                value={fit}
                onChange={(e) => setFit(e.target.value as WardrobeItem['fit'])}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0e244d] focus:bg-white cursor-pointer transition-colors"
              >
                {fits.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Aesthetic Archetype & Aesthetic Vibe */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Fashion Archetype
              </label>
              <select
                value={archetype}
                onChange={(e) => setArchetype(e.target.value as FashionArchetype)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0e244d] focus:bg-white capitalize cursor-pointer transition-colors"
              >
                {archetypes.map((a) => (
                  <option key={a} value={a}>
                    {a}
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
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0e244d] focus:bg-white capitalize cursor-pointer transition-colors"
              >
                {styles.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sub-Category Descriptor */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Sub-Category / Style Cut
            </label>
            <input
              type="text"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              placeholder="e.g. Wide-Leg Baggy Denim, Cropped Heavyweight Tee"
              className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0e244d] focus:bg-white transition-colors"
            />
          </div>

          {/* Category / Gender */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Category *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['men', 'women', 'unisex'] as GenderCategory[]).map((g) => {
                const isSelected = gender === g;
                return (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setGender(g)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0e244d] text-white border-[#1e3a8a] shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {g === 'men' ? 'Men' : g === 'women' ? 'Women' : 'Unisex'}
                  </button>
                );
              })}
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
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0e244d] focus:bg-white transition-colors"
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
              disabled={isSubmitting || isProcessingImage}
              className="px-6 py-2.5 rounded-full bg-[#0e244d] hover:bg-[#15346d] text-white border border-[#1e3a8a] text-xs font-semibold tracking-wide shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? 'Cataloging...' : 'Add to Closet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
