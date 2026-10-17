import React, { useState } from 'react';
import {
  Sparkles,
  Home,
  Check,
  Send,
  Sliders,
  Layers,
  Palette,
  Eye,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const RoomMakeoverPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
  };

  const previewAesthetics = [
    {
      title: 'Nordic Warm Minimalist',
      palette: 'Warm Ivory • Light Raw Oak • Textured Linen',
      description: 'Airy natural light, flush-mounted oak racks, and warm neutral tones mirroring your minimalist wardrobe.',
      imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=85',
    },
    {
      title: 'Obsidian Studio Loft',
      palette: 'Matte Black Steel • Navy Velvet • Architectural Concrete',
      description: 'Industrial open-rail wardrobe systems, museum-grade spotlights, and deep monochrome contrasts.',
      imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=85',
    },
    {
      title: 'Modern Japandi Haven',
      palette: 'Charcoal Slate • Muted Woven Bamboo • Raw Earth',
      description: 'Low-profile platform dressers, organic linen dividers, and zen wardrobe organization.',
      imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=85',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-white bg-[#0e244d] px-2.5 py-1 rounded-full border border-[#1e3a8a]">
              Interior Studio • Phase 2
            </span>
            <span className="text-[10px] font-bold text-[#132d5e] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#132d5e]" />
              Coming Soon
            </span>
          </div>
          <h1 className="font-editorial text-3xl md:text-4xl text-slate-900 font-bold mt-2">
            Room Makeover
          </h1>
          <p className="text-xs text-slate-600 mt-1.5 max-w-2xl font-sans-clean leading-relaxed">
            Your wardrobe reflects your personal aesthetic. Soon, StyleSphere will use spatial AI to redesign your bedroom, dressing area, and closet space to harmonize with the exact colors and silhouettes you wear.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs font-bold text-[#0e244d]">
          <Home className="w-4 h-4 text-[#132d5e]" />
          <span>Spatial AI Interior Engine</span>
        </div>
      </div>

      {/* Hero Coming Soon Showcase Card */}
      <div className="relative overflow-hidden rounded-3xl bg-[#060a14] border border-slate-800 p-8 sm:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/[0.08] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0b1329] border border-slate-700 text-blue-300 text-xs font-sans-clean">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Currently Under Architectural Development</span>
          </div>

          <h2 className="font-editorial text-3xl sm:text-5xl text-white font-bold leading-tight">
            Your closet has style. <br />
            <span className="text-blue-300">Give your room the same vibe.</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 font-sans-clean leading-relaxed">
            Upload a quick photo of your bedroom or dressing corner. StyleSphere will analyze your personal wardrobe color palette and propose complete aesthetic 3D makeovers — from paint tones and open-concept garment rails to ambient lighting and storage geometry.
          </p>

          {/* Early Access Notification Form */}
          <div className="pt-2">
            {subscribed ? (
              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 text-xs font-bold">
                <Check className="w-4 h-4" />
                <span>You&apos;re on the VIP Beta Access list! We&apos;ll notify you at launch.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email for VIP Beta access..."
                  className="px-4 py-3 rounded-2xl bg-[#0b1329] border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-400 flex-1"
                  required
                />
                <button
                  type="submit"
                  className="px-5 py-3 rounded-2xl bg-[#0e244d] hover:bg-[#132d5e] text-white text-xs font-bold font-sans-clean transition-colors flex items-center justify-center gap-2 shrink-0 border border-[#1e3a8a]"
                >
                  <span>Notify Me</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
            <p className="text-[10px] text-slate-500 mt-2">
              Join 1,400+ style enthusiasts on the early preview list. Zero spam.
            </p>
          </div>
        </div>
      </div>

      {/* Planned Feature Pillars */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-editorial text-2xl text-slate-900 font-bold">
            What to Expect in Room Makeover
          </h3>
          <span className="text-xs text-slate-500">Upcoming in Phase 2</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2 hover:border-[#1e3a8a] transition-colors">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0e244d] flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Wardrobe Palette Sync</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Extracts dominant tones from your clothing archive to recommend matching wall paints, curtains, and linens.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2 hover:border-[#1e3a8a] transition-colors">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0e244d] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Modular Rack Geometry</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Calculates optimal hanging vs folded storage ratios based on how many jackets, shirts, and trousers you own.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2 hover:border-[#1e3a8a] transition-colors">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0e244d] flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Virtual Room Preview</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Generates photorealistic AI renders of your remodeled space before you buy furniture or paint.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2 hover:border-[#1e3a8a] transition-colors">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0e244d] flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Curated Decor Staples</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Direct shopping links for minimal floor mirrors, warm lighting, and hanger sets that match the aesthetic.
            </p>
          </div>
        </div>
      </div>

      {/* Aesthetic Moodboard Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-editorial text-2xl text-slate-900 font-bold">
            Curated Architectural Aesthetics
          </h3>
          <span className="text-xs text-slate-500">Preview concepts</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {previewAesthetics.map((concept, idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-white border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[4/3] bg-slate-900 overflow-hidden relative">
                  <img
                    src={concept.imageUrl}
                    alt={concept.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-bold text-white border border-white/20">
                    Concept 0{idx + 1}
                  </div>
                </div>

                <div className="p-6 space-y-2">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#132d5e]">
                    {concept.palette}
                  </span>
                  <h4 className="font-editorial text-lg text-slate-900 font-bold">
                    {concept.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-sans-clean leading-relaxed">
                    {concept.description}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0e244d] group-hover:text-blue-700 transition-colors">
                  <span>Explore Design Concept</span>
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
