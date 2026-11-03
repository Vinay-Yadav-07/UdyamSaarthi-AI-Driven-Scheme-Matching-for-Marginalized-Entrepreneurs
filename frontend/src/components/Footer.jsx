import React from 'react';
import { Landmark, ShieldCheck, ExternalLink, ChevronRight, PhoneCall, Building2, Sparkles, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer({ t }) {
  return (
    <footer className="relative bg-slate-950 text-slate-300 border-t border-slate-800/80 pt-12 pb-8 overflow-hidden font-sans">
      {/* Decorative background glow elements */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-32 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-0 right-1/4 translate-x-1/2 w-96 h-32 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 via-emerald-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-10">
          
          {/* Brand & Purpose Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">
                  {t.brandName}
                </span>
                <p className="text-[11px] font-medium text-amber-400/80 tracking-wide uppercase">
                  {t.tagline || "Government Scheme Matching Platform"}
                </p>
              </div>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-lg">
              {t.footerAbout}
            </p>

            <div className="pt-1">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-2 bg-slate-900/90 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-300 shadow-lg shadow-emerald-950/40 backdrop-blur-sm group hover:border-emerald-400/60 transition-colors">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="tracking-wide">Official Ministry & NSFDC Platform</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation Links Column */}
          <div className="lg:col-span-3">
            <h3 className="text-white font-bold mb-4 text-base flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
              <span className="w-1.5 h-4 bg-amber-400 rounded-full inline-block"></span>
              {t.footerLinks}
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {[
                { to: '/eligibility', label: t.navEligibility },
                { to: '/recommendations', label: t.navRecommendations },
                { to: '/calculator', label: t.navCalculator },
                { to: '/locator', label: t.navLocator },
                { to: '/assistant', label: t.navAssistant }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.to}
                    className="group inline-flex items-center gap-2 text-slate-400 hover:text-amber-300 transition-all duration-200 hover:translate-x-1"
                  >
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-amber-400 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Government Support Desk Column */}
          <div className="lg:col-span-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-inner backdrop-blur-sm space-y-4">
              <h3 className="text-white font-bold text-base flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <Building2 className="w-4 h-4 text-amber-400" />
                {t.footerContact}
              </h3>
              
              <div>
                <p className="text-xs font-semibold text-slate-200 leading-snug">{t.footerMinistry}</p>
                <p className="text-xs text-slate-400 mt-1 leading-snug">{t.footerOrg}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <PhoneCall className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">National Helpdesk</span>
                    <a href="tel:1800110303" className="font-semibold text-amber-300 hover:underline">
                      1800-11-0303 (Toll Free)
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-slate-300">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Official Portal</span>
                    <a
                      href="https://nsfdc.nic.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-300 hover:text-cyan-200 font-medium inline-flex items-center gap-1 hover:underline"
                    >
                      nsfdc.nic.in <ExternalLink className="w-3 h-3 text-cyan-400" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar / Copyright */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-3">
          <p className="text-slate-400 text-center sm:text-left">{t.copyright}</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 border border-slate-800 rounded-full text-slate-300 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Official Scheme Matching & Channel Partner Portal</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

