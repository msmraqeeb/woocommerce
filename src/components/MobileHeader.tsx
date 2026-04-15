"use client";

import { Menu, LayoutDashboard } from "lucide-react";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <header className="flex lg:hidden h-16 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 sticky top-0 z-40 backdrop-blur-md bg-zinc-950/80">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
          <LayoutDashboard className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-zinc-100">
          Kids Paradise
        </span>
      </div>
      
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>
    </header>
  );
}
