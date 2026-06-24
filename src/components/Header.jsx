import React from 'react';
import { Leaf, LogOut, User } from 'lucide-react';

export default function Header({ user, onLogout }) {
  return (
    <header className="w-full max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-800/80 bg-gray-950/20 backdrop-blur-md sticky top-0 z-50">
      {/* Brand Logo */}
      <div className="flex items-center select-none">
        <img src="/logo.png" alt="Unloan Logo" className="h-10 md:h-12 w-auto object-contain" />
      </div>

      {/* Styled Tagline Box */}
      <div className="mt-4 md:mt-0 flex flex-col items-start md:items-center text-left md:text-center md:mx-auto max-w-xl px-4 py-2 rounded-2xl bg-gray-900/40 border border-gray-800/60 backdrop-blur-sm">
        <h1 className="text-lg font-bold tracking-tight text-emerald-400">
          Build Wealth. Not Debt.
        </h1>
        <p className="text-sm font-medium text-gray-300 mt-0.5">
          Simple investing lessons for all.
        </p>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1.5">
          <span>Wealth</span>
          <span className="text-emerald-500/50">•</span>
          <span>Markets</span>
          <span className="text-emerald-500/50">•</span>
          <span>Risk</span>
          <span className="text-emerald-500/50">•</span>
          <span>Discipline</span>
        </div>
        <p className="text-xs text-emerald-500/80 mt-1 font-medium">
          Follow <span className="underline font-semibold">@live.unloan</span> to get loan free in smart way.
        </p>
      </div>

      {/* Auth State Button */}
      <div className="mt-4 md:mt-0 flex items-center justify-end">
        {user ? (
          <div className="flex items-center gap-3 bg-gray-900/60 border border-gray-800 px-4 py-2 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <User className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs text-gray-400">Welcome</p>
              <p className="text-sm font-semibold text-gray-200 leading-tight">{user.username}</p>
            </div>
            <button
              id="header-logout-btn"
              onClick={onLogout}
              className="ml-2 p-1.5 rounded-lg bg-gray-800 hover:bg-red-500/10 hover:border-red-500/30 border border-transparent text-gray-400 hover:text-red-400 transition-all duration-200 cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span className="text-sm font-medium text-gray-500 italic bg-gray-900/20 px-3 py-1 rounded-lg border border-gray-900">
            Secure Portal
          </span>
        )}
      </div>
    </header>
  );
}
