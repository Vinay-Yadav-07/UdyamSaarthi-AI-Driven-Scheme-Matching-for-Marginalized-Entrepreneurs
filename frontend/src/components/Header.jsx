import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Landmark, CheckCircle, Calculator, MapPin, Bot, Home } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

export default function Header({ currentLang, onLanguageChange, t }) {
  const navItems = [
    { to: '/', label: t.navHome, icon: Home },
    { to: '/eligibility', label: t.navEligibility, icon: CheckCircle },
    { to: '/recommendations', label: t.navRecommendations, icon: Landmark },
    { to: '/calculator', label: t.navCalculator, icon: Calculator },
    { to: '/locator', label: t.navLocator, icon: MapPin },
    { to: '/assistant', label: t.navAssistant, icon: Bot },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-[9999] shadow-sm transition-all">
      {/* Top Government Banner Bar */}
      <div className="bg-slate-950 text-slate-300 text-xs py-1.5 px-4 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-amber-400 tracking-wide">MoSJE & NSFDC Supported Initiative</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector currentLang={currentLang} onLanguageChange={onLanguageChange} />
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white flex items-center justify-center shadow-md border border-indigo-700/50 group-hover:scale-105 transition-all">
            <Landmark className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                {t.brandName}
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-700 rounded-full border border-emerald-500/30">
                Official Portal
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              "{t.tagline}"
            </p>
          </div>
        </Link>

        {/* Navigation Bar */}
        <nav className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-[1.02]'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-xs'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
