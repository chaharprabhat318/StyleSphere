import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Layers,
  Eye,
  ShoppingBag,
  Check,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050811] text-white flex flex-col selection:bg-[#132d5e] selection:text-white">
      {/* Top Navbar in Deep Navy Blue */}
      <header className="h-20 px-8 sm:px-16 border-b border-slate-800 bg-[#09142e]/90 backdrop-blur-xl flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#132d5e] border border-[#1e3a8a] flex items-center justify-center text-white font-semibold text-xs tracking-tighter shadow-sm">
            SS
          </div>
          <div>
            <span className="font-editorial text-lg tracking-wider text-white font-bold">
              STYLESPHERE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 transition-all font-semibold text-xs tracking-wide shadow-sm cursor-pointer active:scale-95"
          >
            <span>Enter Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-24 sm:py-32 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/[0.12] rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0e244d] border border-[#1e3a8a] text-blue-200 text-xs font-sans-clean mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-blue-300" />
          <span>L'Intelligence Artificielle au Service du Style</span>
        </div>

        <h1 className="font-editorial text-5xl sm:text-7xl md:text-8xl text-white font-bold tracking-tight leading-[1.05] max-w-4xl">
          Your World. Your Style. <br />
          <span className="text-[#3b82f6]">Your AI.</span>
        </h1>

        <p className="mt-8 text-sm sm:text-base text-slate-300 max-w-2xl font-sans-clean leading-relaxed">
          StyleSphere unites digital wardrobe cataloging, intelligent outfit synthesis, virtual mirror try-on, and smart gap-shopping into one personal styling studio.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#132d5e] hover:bg-[#1a3a78] text-white border border-[#1e3a8a] font-semibold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer active:scale-95"
          >
            <span>Launch Studio Lookbook</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/wardrobe"
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white border border-slate-700 text-xs font-semibold tracking-wider uppercase transition-colors"
          >
            <span>Explore My Wardrobe</span>
          </Link>
        </div>

        {/* 4 Feature Columns: Obsidian Black & Navy */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl text-left">
          <div className="p-6 rounded-3xl bg-[#091124] border border-slate-800 space-y-2">
            <Layers className="w-5 h-5 text-blue-400 mb-2" />
            <h4 className="font-editorial text-lg text-white font-bold">My Wardrobe</h4>
            <p className="text-xs text-slate-400 font-sans-clean leading-relaxed">
              Tag, index, and organize every piece with color coordinate swatches.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#091124] border border-slate-800 space-y-2">
            <Sparkles className="w-5 h-5 text-blue-400 mb-2" />
            <h4 className="font-editorial text-lg text-white font-bold">Outfit Curator</h4>
            <p className="text-xs text-slate-400 font-sans-clean leading-relaxed">
              Interactive flat-lay composition with live item swapping and color theory.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#091124] border border-slate-800 space-y-2">
            <Eye className="w-5 h-5 text-blue-400 mb-2" />
            <h4 className="font-editorial text-lg text-white font-bold">Virtual Try-On</h4>
            <p className="text-xs text-slate-400 font-sans-clean leading-relaxed">
              Simulate silhouette fit and garment drape dynamics on model frames.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#091124] border border-slate-800 space-y-2">
            <ShoppingBag className="w-5 h-5 text-blue-400 mb-2" />
            <h4 className="font-editorial text-lg text-white font-bold">Smart Shopping</h4>
            <p className="text-xs text-slate-400 font-sans-clean leading-relaxed">
              Curated partner essentials that pair with your closet and bridge wardrobe gaps.
            </p>
          </div>
        </div>
      </section>

      {/* Editorial Manifesto Section */}
      <section className="border-t border-slate-800 bg-[#040711] py-20 px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-[10px] tracking-widest uppercase font-bold text-blue-300">
              The Philosophy
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl text-white font-bold">
              More Style, Less Noise.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-[#080e1c] border border-slate-800 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                The Closet Dilemma
              </span>
              <ul className="space-y-3 text-xs text-slate-300 font-sans-clean leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="text-slate-500 font-bold">&times;</span>
                  <span>Owning dozens of pieces while wearing the same 3 safe combinations.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-slate-500 font-bold">&times;</span>
                  <span>Impulsive purchases that match zero existing clothes you already own.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-slate-500 font-bold">&times;</span>
                  <span>Wasting time each morning debating silhouette proportions and colors.</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-[#0e244d] border border-[#1e3a8a] space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                The StyleSphere Approach
              </span>
              <ul className="space-y-3 text-xs text-blue-100 font-sans-clean leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Interactive Flat-Lay Studio to remix clothes you actually own.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Capsule Gap Analysis pinpointing high-utility missing staples.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>5-Day duplicate wear alerts ensuring fresh rotation every week.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 py-10 px-8 text-center text-xs text-slate-500 bg-[#050811]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-sans-clean">
          <p>&copy; 2026 StyleSphere. Studio de Mode & AI Wardrobe Intelligence.</p>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Curated Edition</span>
            <span>•</span>
            <span>Black, Navy & White Harmony</span>
            <span>•</span>
            <span>Offline First</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
