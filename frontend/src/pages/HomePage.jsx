import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, ArrowRight, ShieldCheck, Calculator, MapPin, Sparkles, CheckCircle2, Building2, ChevronRight, Percent, Calendar } from 'lucide-react';
import { api } from '../services/api';

export default function HomePage({ t }) {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSchemes() {
      try {
        setLoading(true);
        const data = await api.getSchemes();
        setSchemes(data || []);
      } catch (err) {
        console.error("Failed to fetch schemes:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSchemes();
  }, []);

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-800">
        {/* Subtle Decorative Background Glow */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold uppercase tracking-wider backdrop-blur-md shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Official Government Scheme Matching Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-xs">
            {t.heroTitle}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-medium">
            {t.heroSubtitle}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => navigate('/eligibility')}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-xl hover:shadow-emerald-600/30 transition-all flex items-center gap-2 group cursor-pointer"
            >
              <span>{t.heroCheckBtn}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/calculator')}
              className="px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-extrabold text-sm sm:text-base rounded-xl border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Calculator className="w-5 h-5 text-amber-400" />
              <span>{t.heroCalcBtn}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Trust Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all text-center space-y-1">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-1">
            <Landmark className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black text-slate-900">5</p>
          <p className="text-xs font-bold text-slate-500">Official NSFDC Schemes</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all text-center space-y-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto mb-1">
            <Building2 className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black text-indigo-700">91</p>
          <p className="text-xs font-bold text-slate-500">Verified Channel Partners</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all text-center space-y-1">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-1">
            <MapPin className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black text-emerald-700">36</p>
          <p className="text-xs font-bold text-slate-500">States & Union Territories</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all text-center space-y-1">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-1">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black text-amber-600">100%</p>
          <p className="text-xs font-bold text-slate-500">Rule Engine Transparency</p>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all card-hover-lift space-y-3">
          <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-blue-700 shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">{t.feat1Title}</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">{t.feat1Desc}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all card-hover-lift space-y-3">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-center text-indigo-700 shadow-xs">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">{t.feat2Title}</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">{t.feat2Desc}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all card-hover-lift space-y-3">
          <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center text-amber-700 shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">{t.feat3Title}</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">{t.feat3Desc}</p>
        </div>
      </div>

      {/* How UdyamSaarthi Works - 4-Step Interactive Workflow */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
            Simple 4-Step Application Journey
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">How UdyamSaarthi Guides You</h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">From eligibility verification to official channel partner application</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-3 relative">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">01</div>
            <h3 className="text-sm font-bold text-white">1. Enter Profile Details</h3>
            <p className="text-xs text-slate-300 leading-snug">Fill in age, social category, income, location, and project funding requirements.</p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-3 relative">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">02</div>
            <h3 className="text-sm font-bold text-white">2. Rule-Engine Audit</h3>
            <p className="text-xs text-slate-300 leading-snug">Evaluates mandatory criteria: SC category, income ceiling (≤ ₹5L), and project cost limits.</p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-3 relative">
            <div className="w-8 h-8 rounded-full bg-indigo-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">03</div>
            <h3 className="text-sm font-bold text-white">3. Scheme Matching</h3>
            <p className="text-xs text-slate-300 leading-snug">Computes suitability scores, max eligible loan caps, interest rates, and monthly EMI.</p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-3 relative">
            <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">04</div>
            <h3 className="text-sm font-bold text-white">4. Apply & Disburse</h3>
            <p className="text-xs text-slate-300 leading-snug">Locate nearby channel partners (SCAs/Banks) and apply via official government portal.</p>
          </div>
        </div>
      </div>

      {/* Schemes Showcase Section */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.schemesSectionTitle}</h2>
            <p className="text-xs font-semibold text-slate-500 mt-1">{t.schemesSectionSub}</p>
          </div>
          <button
            onClick={() => navigate('/eligibility')}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 px-3.5 py-2 rounded-xl border border-indigo-200/90 transition-colors shadow-xs"
          >
            <span>Explore Matching</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 font-semibold text-sm">
            Loading official schemes...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schemes.map((scheme) => (
              <div key={scheme.scheme_id} className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-all card-hover-lift flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-800 font-black text-[11px] rounded-lg border border-indigo-200">
                      {scheme.scheme_id}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {scheme.beneficiary_interest_rate}% p.a.
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 mb-2 leading-snug">
                    {scheme.scheme_name}
                  </h3>

                  <div className="space-y-2 text-xs text-slate-600 bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/80 font-medium">
                    <p><strong className="text-slate-900 font-bold">Max Loan:</strong> {scheme.max_loan_inr}</p>
                    <p><strong className="text-slate-900 font-bold">Tenure:</strong> {scheme.repayment_period}</p>
                    <p><strong className="text-slate-900 font-bold">Grace Period:</strong> {scheme.moratorium}</p>
                    <p><strong className="text-slate-900 font-bold">Channel:</strong> {scheme.channel}</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/eligibility')}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 group cursor-pointer"
                >
                  <span>Check Your Match</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-amber-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
