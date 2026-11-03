import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, ArrowLeft, CheckCircle2, User, IndianRupee, MapPin, Briefcase, Layers } from 'lucide-react';
import RecommendationCard from '../components/RecommendationCard';

export default function RecommendationsPage({ recommendationResult, t }) {
  const navigate = useNavigate();

  if (!recommendationResult) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto text-blue-700 shadow-md">
          <Landmark className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">{t.resultTitle}</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          No active evaluation session found. Please fill out your profile details first to compute your scheme match.
        </p>
        <button
          onClick={() => navigate('/eligibility')}
          className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
        >
          {t.navEligibility}
        </button>
      </div>
    );
  }

  const profile = recommendationResult.applicant_profile || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/eligibility')}
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-700 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4 text-blue-700" />
          <span>{t.btnBack}</span>
        </button>

        <span className="text-xs font-bold text-slate-500 bg-slate-200/60 px-3 py-1 rounded-full border border-slate-300/60">
          Official MoSJE & NSFDC Schemes
        </span>
      </div>

      {/* Top Matching Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-blue-800/80 shadow-xl relative overflow-hidden space-y-2">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-extrabold uppercase tracking-wider mb-1">
            <span>✨</span>
            <span>Profile-Based Scheme Match</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t.matchingHeroTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl">
            {t.matchingHeroSub}
          </p>
        </div>
      </div>

      <RecommendationCard result={recommendationResult} t={t} />
    </div>
  );
}

