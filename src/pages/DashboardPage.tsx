import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Layers,
  Eye,
  ArrowRight,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';
import type { WardrobeItem } from '../types/wardrobe';
import { wardrobeService } from '../services/wardrobeService';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<WardrobeItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await wardrobeService.getItems();
      setItems(data);
    };
    load();
  }, []);

  const topsCount = items.filter((i) => i.category === 'tops').length;
  const bottomsCount = items.filter((i) => i.category === 'bottoms').length;
  const outerCount = items.filter((i) => i.category === 'outerwear').length;
  const shoesCount = items.filter((i) => i.category === 'footwear').length;

  // Trending Outfit Presets (2025/2026 Golden Proportion: Cropped/Slim Top + Baggy/Wide Bottom)
  const trendingOutfits = [
    {
      id: 'trend-1',
      title: 'Boxy Cropped Streetwear Ensemble',
      occasion: 'Campus & Street',
      harmony: 99,
      pieces: [
        items.find((i) => i.id === 'item-top-1') || items.find((i) => i.category === 'tops') || items[0],
        items.find((i) => i.id === 'item-bot-1') || items.find((i) => i.category === 'bottoms') || items[1],
        items.find((i) => i.id === 'item-foot-1') || items.find((i) => i.category === 'footwear') || items[2],
      ].filter(Boolean) as WardrobeItem[],
    },
    {
      id: 'trend-2',
      title: 'Modern Clean Fit Golden Proportion',
      occasion: 'Downtown & Coffee',
      harmony: 96,
      pieces: [
        items.find((i) => i.id === 'item-top-3') || items.find((i) => i.category === 'tops') || items[0],
        items.find((i) => i.id === 'item-bot-2') || items.find((i) => i.category === 'bottoms') || items[1],
        items.find((i) => i.id === 'item-foot-2') || items.find((i) => i.category === 'footwear') || items[2],
      ].filter(Boolean) as WardrobeItem[],
    },
    {
      id: 'trend-3',
      title: 'Old Money Tailored Silhouette',
      occasion: 'Dinner & Date',
      harmony: 94,
      pieces: [
        items.find((i) => i.id === 'item-top-4') || items.find((i) => i.category === 'tops') || items[0],
        items.find((i) => i.id === 'item-bot-4') || items.find((i) => i.category === 'bottoms') || items[1],
        items.find((i) => i.id === 'item-foot-3') || items.find((i) => i.category === 'footwear') || items[2],
      ].filter(Boolean) as WardrobeItem[],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16">
      {/* 1. Simplified Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-white bg-[#0e244d] px-2.5 py-1 rounded-full border border-[#1e3a8a]">
            Studio Overview
          </span>
          <h1 className="font-editorial text-3xl md:text-4xl text-slate-900 font-bold mt-2">
            Dashboard
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-xl font-sans-clean leading-relaxed">
            Your personal wardrobe summary, quick studio actions, and curated style inspirations.
          </p>
        </div>

        <button
          onClick={() => navigate('/recommendations')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0e244d] hover:bg-[#132d5e] text-white text-xs font-bold font-sans-clean transition-all border border-[#1e3a8a] shadow-sm cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4 text-blue-200" />
          <span>Launch Outfit Generator</span>
        </button>
      </div>

      {/* 2. Key Stats Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2 hover:border-[#1e3a8a] transition-colors">
          <div className="flex items-center justify-between text-xs">
            <span className="uppercase tracking-widest font-bold text-[10px] text-slate-400">
              Wardrobe Archive
            </span>
            <Layers className="w-4 h-4 text-[#0e244d]" />
          </div>
          <div className="font-editorial text-3xl text-slate-900 font-bold">
            {items.length} <span className="text-xs font-sans text-slate-500 font-normal">Garments</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-sans-clean">
            {topsCount} Tops • {bottomsCount} Bottoms • {outerCount} Layers • {shoesCount} Footwear
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2 hover:border-[#1e3a8a] transition-colors">
          <div className="flex items-center justify-between text-xs">
            <span className="uppercase tracking-widest font-bold text-[10px] text-slate-400">
              Outfit Potential
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-editorial text-3xl text-slate-900 font-bold">
            36+ <span className="text-xs font-sans text-slate-500 font-normal">Combinations</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-sans-clean">
            Mathematically harmonized combinations across all occasions.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2 hover:border-[#1e3a8a] transition-colors">
          <div className="flex items-center justify-between text-xs">
            <span className="uppercase tracking-widest font-bold text-[10px] text-slate-400">
              Smart Shopping Gaps
            </span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <div className="font-editorial text-3xl text-slate-900 font-bold">
            4 <span className="text-xs font-sans text-slate-500 font-normal">Staples</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-sans-clean">
            High-utility pieces recommended with 10% partner discounts.
          </p>
        </div>
      </div>

      {/* 3. Streamlined Studio Navigation (3 Clean Cards) */}
      <div className="space-y-4">
        <h3 className="font-editorial text-2xl text-slate-900 font-bold">
          Studio Features
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div
            onClick={() => navigate('/recommendations')}
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-[#1e3a8a] hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0e244d] text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-blue-200" />
              </div>
              <h4 className="font-editorial text-lg text-slate-900 font-bold group-hover:text-[#0e244d] transition-colors">
                AI Outfit Generator
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-sans-clean">
                Synthesize customized looks for campus, date night, or work with color harmony scores.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0e244d]">
              <span>Launch Generator</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => navigate('/try-on')}
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-[#1e3a8a] hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0a1124] text-white flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-300" />
              </div>
              <h4 className="font-editorial text-lg text-slate-900 font-bold group-hover:text-[#0e244d] transition-colors">
                Virtual Try-On
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-sans-clean">
                Paste any clothing link from Zara, Uniqlo, or Myntra to test drape via live webcam.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0e244d]">
              <span>Open Try-On</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => navigate('/shopping')}
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-[#1e3a8a] hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#132d5e] text-white flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-blue-200" />
              </div>
              <h4 className="font-editorial text-lg text-slate-900 font-bold group-hover:text-[#0e244d] transition-colors">
                Smart Shopping
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-sans-clean">
                Bridge wardrobe gaps with curated essentials and 10% partner discount code SPHERE10.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0e244d]">
              <span>Explore Curations</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Ready-to-Wear Ensembles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-editorial text-2xl text-slate-900 font-bold">
              Ready-to-Wear Ensembles
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Curated inspirations ready to wear for different occasions
            </p>
          </div>
          <button
            onClick={() => navigate('/recommendations')}
            className="text-xs font-bold text-[#0e244d] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View in Generator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trendingOutfits.map((ensemble) => (
            <div
              key={ensemble.id}
              onClick={() => navigate('/recommendations')}
              className="rounded-3xl bg-white border border-slate-200/90 hover:border-[#1e3a8a] p-6 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-4 group"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#0e244d] bg-blue-50 px-2.5 py-0.5 rounded-full">
                  {ensemble.occasion}
                </span>
                <span className="font-editorial text-lg font-bold text-[#0e244d]">
                  {ensemble.harmony}%
                </span>
              </div>

              {/* 3-Piece Mini Collage */}
              <div className="grid grid-cols-3 gap-2">
                {ensemble.pieces.map((p, idx) => (
                  <div key={idx} className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-100">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-editorial text-base font-bold text-slate-900 group-hover:text-[#0e244d] transition-colors">
                  {ensemble.title}
                </h4>
                <div className="flex items-center gap-1 text-xs text-slate-500 font-sans-clean mt-1">
                  <span>Open in Outfit Generator</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
