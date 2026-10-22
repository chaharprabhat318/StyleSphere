import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sparkles,
  Layers,
  Compass,
  Eye,
  ShoppingBag,
  Home,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  totalItemsCount?: number;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ totalItemsCount = 12, isCollapsed = false, onToggle }) => {
  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: Compass },
    { label: 'Outfit Generator', to: '/recommendations', icon: Sparkles, badge: 'AI' },
    { label: 'My Wardrobe', to: '/wardrobe', icon: Layers, count: totalItemsCount },
    { label: 'Virtual Try-On', to: '/try-on', icon: Eye, isAccent: true },
    { label: 'Smart Shopping', to: '/shopping', icon: ShoppingBag, badge: 'Curated' },
    { label: 'Room Makeover', to: '/room-makeover', icon: Home, badge: 'Coming Soon' },
  ];

  return (
    <aside
      className="bg-[#050811] border-r border-slate-800/90 flex flex-col justify-between h-screen sticky top-0 z-40 select-none transition-all duration-300 ease-in-out overflow-hidden"
      style={{ width: isCollapsed ? '64px' : '256px' }}
    >
      {/* Brand & Studio Title */}
      <div>
        <div className="p-4 pb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Logo Icon — always visible */}
            <button
              onClick={onToggle}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="w-9 h-9 rounded-2xl bg-[#132d5e] border border-[#1e3a8a] flex items-center justify-center text-white font-semibold text-xs tracking-tighter shrink-0 cursor-pointer hover:bg-[#1e3a8a] transition-colors"
            >
              SS
            </button>
            {/* Brand text — hidden when collapsed */}
            {!isCollapsed && (
              <div className="whitespace-nowrap overflow-hidden">
                <h1 className="font-editorial text-lg tracking-wide text-white leading-none font-bold">
                  STYLESPHERE
                </h1>
                <p className="text-[10px] tracking-widest uppercase text-slate-400 mt-1 font-semibold">
                  AI Fashion Studio
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1 mt-1">
          {!isCollapsed && (
            <p className="px-3 py-2 text-[10px] tracking-widest uppercase font-bold text-slate-500">
              Navigation
            </p>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs tracking-wide transition-all duration-200 group ${
                    isCollapsed ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'bg-[#132d5e] text-white font-semibold border border-[#1e3a8a]'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                  }`
                }
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>
                {!isCollapsed && item.count !== undefined && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0a1226] text-slate-300 border border-slate-800 font-medium">
                    {item.count}
                  </span>
                )}
                {!isCollapsed && item.badge && (
                  <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#0f244d] text-blue-200 border border-[#1e3a8a]">
                    {item.badge}
                  </span>
                )}
                {!isCollapsed && item.isAccent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-3 space-y-3">
        {/* Collapse / Expand Toggle Button */}
        <button
          onClick={onToggle}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#0a1124] border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all text-xs font-bold cursor-pointer"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>

        {/* Capsule Summary — hidden when collapsed */}
        {!isCollapsed && (
          <div className="p-3 rounded-2xl bg-[#0a1124] border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                Private Capsule
              </span>
              <span className="text-[10px] text-slate-300 flex items-center gap-1.5 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                Synced
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans-clean">
              {totalItemsCount} pieces ready for outfit synthesis.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
