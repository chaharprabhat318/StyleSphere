import React from 'react';
import { Plus } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenUpload?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onOpenUpload }) => {
  return (
    <header className="h-20 px-8 border-b border-blue-900/60 bg-gradient-to-r from-[#071126] via-[#0b1a3e] to-[#0f2456] flex items-center justify-between sticky top-0 z-30 shadow-lg shadow-blue-950/20 backdrop-blur-xl">
      <div>
        <h2 className="font-editorial text-2xl tracking-tight text-white font-bold drop-shadow-sm">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-blue-200/80 mt-0.5 tracking-wide font-sans-clean font-medium">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Primary Catalog Trigger */}
        {onOpenUpload && (
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#132d5e] hover:bg-[#193a77] text-white border border-[#1e3a8a] transition-all font-semibold text-xs tracking-wide cursor-pointer active:scale-95 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Piece</span>
          </button>
        )}

        {/* Minimal User Monogram */}
        <div className="w-9 h-9 rounded-full bg-[#060e22] border border-[#1e3a8a] flex items-center justify-center text-xs font-bold text-white shadow-sm">
          AV
        </div>
      </div>
    </header>
  );
};
