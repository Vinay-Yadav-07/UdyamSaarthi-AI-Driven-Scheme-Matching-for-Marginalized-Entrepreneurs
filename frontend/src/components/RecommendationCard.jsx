import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Award, ShieldAlert, ArrowRight, Sparkles, Layers, Check, Calculator, MapPin, IndianRupee, Percent, CalendarClock, CreditCard, Bot, Info, ShieldCheck, ExternalLink, Globe, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const SCHEME_APPLICATION_URLS = {
  "Micro Finance Scheme": "https://pmsuraj.dosje.gov.in/",
  "Aajeevika Micro-Finance Yojana": "https://pmsuraj.dosje.gov.in/",
  "Term Loan": "https://pmsuraj.dosje.gov.in/",
  "Udyam Nidhi Yojana": "https://pmsuraj.dosje.gov.in/",
  "Educational Loan Scheme": "https://pmsuraj.dosje.gov.in/"
};

const getSchemeApplyUrl = (schemeName, schemeId) => {
  if (schemeName && SCHEME_APPLICATION_URLS[schemeName]) {
    return SCHEME_APPLICATION_URLS[schemeName];
  }
  return "https://pmsuraj.dosje.gov.in/";
};

export default function RecommendationCard({ result, t }) {
  const navigate = useNavigate();
  const isEligible = result.eligibility_status === 'Eligible';
  const otherSchemes = result.other_applicable_schemes || [];
  const applicantProfile = result.applicant_profile || {};
  const applicantState = applicantProfile.state || '';

  const [partnerCount, setPartnerCount] = useState(null);
  const [showBestMatchDetails, setShowBestMatchDetails] = useState(false);
  const [expandedDetailsMap, setExpandedDetailsMap] = useState({});

  const toggleSchemeDetails = (schemeId) => {
    setExpandedDetailsMap(prev => ({
      ...prev,
      [schemeId]: !prev[schemeId]
    }));
  };

  useEffect(() => {
    async function loadPartnerCount() {
      try {
        const partners = await api.getPartners(applicantState ? { state: applicantState } : {});
        setPartnerCount(partners ? partners.length : 91);
      } catch (err) {
        setPartnerCount(91);
      }
    }
    loadPartnerCount();
  }, [applicantState]);

  const handleCalculateEmi = (scheme) => {
    const loanAmount = scheme.maximum_loan || scheme.maximum_eligible_loan || result.maximum_eligible_loan || 100000;
    const interestRate = scheme.interest_rate_pa ?? result.illustrative_interest_rate_pa ?? 8.0;
    const tenureYears = scheme.tenure_years ?? result.illustrative_tenure_years ?? 5.0;

    let moratoriumMonths = 3;
    if (scheme.moratorium) {
      const match = scheme.moratorium.match(/(\d+)/);
      if (match) moratoriumMonths = parseInt(match[1], 10);
    } else if (scheme.scheme_id === 'TERM_LOAN') {
      moratoriumMonths = 6;
    } else if (scheme.scheme_id === 'ELS') {
      moratoriumMonths = 12;
    }

    navigate('/calculator', {
      state: {
        schemeName: scheme.scheme_name,
        loanAmount: loanAmount,
        interestRate: interestRate,
        tenureYears: tenureYears,
        moratoriumMonths: moratoriumMonths
      }
    });
  };

  const handleLocatePartners = (scheme) => {
    let partnerType = "";
    const channel = (scheme.channel || "").toLowerCase();
    if (channel.includes("co-op") || channel.includes("society")) partnerType = "Cooperative Society";

    navigate('/locator', {
      state: {
        schemeName: scheme.scheme_name,
        selectedState: applicantState,
        partnerType: partnerType,
        channel: scheme.channel
      }
    });
  };

  const bestMatchSchemeObj = result.best_match || {
    scheme_id: result.eligibility_reason_code,
    scheme_name: result.recommended_scheme,
    eligibility_status: result.eligibility_status,
    suitability_score: result.suitability_score,
    maximum_project_cost: result.scheme_details?.max_project_cost_inr || 5000000.0,
    maximum_loan: result.maximum_eligible_loan,
    interest_rate: `${result.illustrative_interest_rate_pa}% p.a.`,
    interest_rate_pa: result.illustrative_interest_rate_pa,
    repayment_period: `${result.illustrative_tenure_years} Years`,
    tenure_years: result.illustrative_tenure_years,
    moratorium: result.scheme_details?.moratorium || "3 months",
    channel: result.scheme_details?.channel || "SCAs/CAs",
    why_it_matches: result.explainability?.why_this_scheme || [],
    illustrative_monthly_emi: result.illustrative_monthly_emi,
    is_best_match: true,
    scheme_details: result.scheme_details
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Primary / Best Match Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden transition-all duration-300">
        {/* Recommended Header Banner */}
        <div className={`relative p-6 sm:p-8 text-white overflow-hidden ${
          isEligible 
            ? 'bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900' 
            : 'bg-gradient-to-r from-red-900 via-slate-900 to-slate-950'
        }`}>
          {/* Background Decorative Shapes */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-xs backdrop-blur-md ${
                  isEligible 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' 
                    : 'bg-red-500/20 text-red-300 border border-red-400/40'
                }`}>
                  {isEligible ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                  {isEligible ? t.statusEligible : t.statusIneligible}
                </span>

                {isEligible && (
                  <span className="inline-flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/40 text-amber-300 px-3.5 py-1 rounded-full text-xs font-extrabold backdrop-blur-md">
                    <span>🏆</span>
                    <span>{t.bestMatch}</span>
                  </span>
                )}
              </div>

              {isEligible && (
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 px-4 py-1.5 rounded-full text-xs font-black shadow-inner">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>{t.suitabilityScore}: {result.suitability_score}%</span>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs text-amber-300 font-extrabold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {t.recommendedForYou}
              </p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2 leading-tight">
                {result.recommended_scheme}
              </h2>

              <p className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{t.suitabilityScoreTooltip}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-7">

          {/* ACTION 4: "Why this matches your profile" */}
          <div>
            {isEligible ? (
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{t.whyThisScheme}</span>
                </h3>
                <div className="grid grid-cols-1 gap-2.5">
                  {result.explainability?.why_this_scheme?.map((point, i) => (
                    <div key={i} className="flex items-start gap-3 bg-emerald-50/80 border border-emerald-200/90 p-3.5 rounded-xl transition-all">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold shadow-xs">
                        ✓
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-xs font-black text-red-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span>{t.rejectionReasonTitle}</span>
                </h3>
                <div className="bg-red-50/80 border border-red-200/90 p-4 rounded-xl space-y-2">
                  {result.explainability?.rejection_reasons?.map((reason, i) => (
                    <p key={i} className="text-xs sm:text-sm text-red-800 font-semibold flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-red-600 shrink-0"></span>
                      <span>{reason}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 7: "Matching Factors" Visual Progress Breakdown */}
          {isEligible && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>{t.matchingFactorsTitle}</span>
                </h3>
                <span className="text-[11px] font-bold text-slate-500">Evaluated Rules & Constraints</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Mandatory Eligibility Condition</span>
                    <span className="text-emerald-700">100% Verified</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-full rounded-full" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Project Cost Alignment</span>
                    <span className="text-emerald-700">Fit</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 w-full rounded-full" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Loan Requirement Fit</span>
                    <span className="text-indigo-700">Suitable</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 w-full rounded-full" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Purpose & Activity Match</span>
                    <span className="text-indigo-700">Aligned</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 w-full rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACTION 2: "Local Partner Access" Card */}
          {isEligible && (
            <div className="bg-indigo-50/70 border border-indigo-200/90 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-950 font-black text-sm">
                  <MapPin className="w-4.5 h-4.5 text-indigo-700 shrink-0" />
                  <span>{t.localPartnerAccessTitle}</span>
                  {applicantState && (
                    <span className="bg-indigo-200/80 text-indigo-900 text-xs px-2.5 py-0.5 rounded-full font-bold">
                      📍 {applicantState}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 font-semibold">
                  {partnerCount !== null ? `${partnerCount} relevant channel partners found` : 'Verified disbursing institutions available'}
                </p>
              </div>

              <button
                onClick={() => handleLocatePartners(bestMatchSchemeObj)}
                className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 shrink-0 active:scale-[0.99]"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-300" />
                <span>{t.btnLocatePartners}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ACTION 3 & ACTION 5: Financial Metrics, EMI Calculator, and Scheme Details */}
          {isEligible && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  Financing & Repayment Terms
                </h3>
                <span className="text-[11px] font-semibold text-slate-400">NSFDC Scheme Rules</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/90 p-5 rounded-2xl border border-slate-200/80">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <IndianRupee className="w-3.5 h-3.5 text-blue-600" />
                    <span>{t.maxEligibleLoan}</span>
                  </div>
                  <p className="text-xl font-black text-slate-900 tracking-tight">
                    ₹{result.maximum_eligible_loan?.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <Percent className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{t.interestRate}</span>
                  </div>
                  <p className="text-xl font-black text-blue-700 tracking-tight">
                    {result.illustrative_interest_rate_pa}% <span className="text-xs font-semibold text-slate-500">p.a.</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <CalendarClock className="w-3.5 h-3.5 text-purple-600" />
                    <span>{t.tenure}</span>
                  </div>
                  <p className="text-xl font-black text-slate-900 tracking-tight">
                    {result.illustrative_tenure_years} <span className="text-xs font-semibold text-slate-500">Years</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t.monthlyEmi}</span>
                  </div>
                  <p className="text-xl font-black text-emerald-700 tracking-tight">
                    ₹{result.illustrative_monthly_emi?.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Action Toolbar: EMI Calculator & View Scheme Details */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setShowBestMatchDetails(!showBestMatchDetails)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-300/80 transition-all flex items-center gap-1.5 active:scale-[0.99]"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>{t.viewSchemeDetails || "View Scheme Details"}</span>
                  {showBestMatchDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => handleCalculateEmi(bestMatchSchemeObj)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 active:scale-[0.99]"
                >
                  <Calculator className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.btnRecalculateEmi}</span>
                </button>
              </div>

              {/* ACTION 5: Expandable Scheme Details */}
              {showBestMatchDetails && (
                <div className="bg-slate-100/90 border border-slate-200 rounded-2xl p-5 space-y-3 text-xs text-slate-700 mt-2 transition-all">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>Official NSFDC Scheme Parameters ({result.recommended_scheme})</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="font-bold text-slate-900 block">Disbursing Channel:</span>
                      <span>{bestMatchSchemeObj.channel}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">Moratorium Grace Period:</span>
                      <span>{bestMatchSchemeObj.moratorium}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">Maximum Project Cost Ceiling:</span>
                      <span>₹{bestMatchSchemeObj.maximum_project_cost ? bestMatchSchemeObj.maximum_project_cost.toLocaleString('en-IN') : 'As per Project Plan'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">Target Beneficiaries:</span>
                      <span>Scheduled Caste (SC) Entrepreneurs & Students</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ACTION 1: Official Application Portal (Placed at the LAST of the block with scheme-specific URL) */}
          {isEligible && (
            <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
                    <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{t.officialGovtPortalSub || "Official Government Application Portal"}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    Official application processing for <strong className="text-white font-bold">{bestMatchSchemeObj.scheme_name}</strong>
                  </p>
                </div>

                <a
                  href={getSchemeApplyUrl(bestMatchSchemeObj.scheme_name, bestMatchSchemeObj.scheme_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all flex items-center justify-center gap-2.5 shrink-0 active:scale-[0.99] group cursor-pointer"
                >
                  <span>{t.btnApplyScheme || "Apply for This Scheme"} →</span>
                  <ExternalLink className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t.trustApplicationDisclaimer || "UdyamSaarthi helps identify suitable schemes. Application and final approval are handled through the official government/authorized channel."}</span>
              </div>
            </div>
          )}

          {/* Grounded AI Assistance Callout */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-5 rounded-2xl border border-blue-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                <Bot className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">{t.needHelpTitle}</h4>
                <p className="text-xs text-slate-300 font-medium">{t.needHelpDesc}</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/assistant')}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0 active:scale-[0.99]"
            >
              <Bot className="w-4 h-4 text-slate-950" />
              <span>{t.btnAskAssistant}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section: "Other Schemes You May Be Eligible For" */}
      {isEligible && otherSchemes.length > 0 && (
        <div className="space-y-6 pt-4">
          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2.5 text-slate-900">
              <div className="w-9 h-9 rounded-2xl bg-indigo-900 text-amber-400 flex items-center justify-center shadow-md">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">{t.otherApplicableSchemes}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {t.otherSchemesSub}
                </p>
              </div>
              <span className="ml-auto bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-black px-3.5 py-1 rounded-full shadow-2xs">
                {otherSchemes.length} Alternatives
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {otherSchemes.map((scheme, idx) => {
              const isDetailsExpanded = !!expandedDetailsMap[scheme.scheme_id || idx];
              const applyUrl = getSchemeApplyUrl(scheme.scheme_name, scheme.scheme_id);
              return (
                <div key={idx} className="bg-white border border-slate-200/90 rounded-3xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                  {/* Header Banner */}
                  <div className="relative bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 text-white p-6 sm:p-7 overflow-hidden space-y-3">
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          {t.applicableBadge}
                        </span>
                        <span className="bg-indigo-400/20 text-indigo-300 border border-indigo-400/40 text-xs font-extrabold px-3 py-1 rounded-full backdrop-blur-md">
                          Alternative Option #{idx + 1}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 px-3.5 py-1 rounded-full text-xs font-black shadow-inner">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>{t.suitabilityScore}: {scheme.suitability_score}%</span>
                      </div>
                    </div>

                    <div className="relative z-10 space-y-1">
                      <p className="text-[11px] text-amber-300 font-extrabold uppercase tracking-wider">
                        Applicable Government Scheme
                      </p>
                      <h4 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                        {scheme.scheme_name}
                      </h4>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-7 space-y-6">

                    {/* ACTION 4: Why it matches */}
                    {scheme.why_it_matches && scheme.why_it_matches.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{t.whyThisScheme}</span>
                        </h5>
                        <div className="grid grid-cols-1 gap-2.5">
                          {scheme.why_it_matches.map((reason, rIdx) => (
                            <div key={rIdx} className="flex items-start gap-3 bg-emerald-50/80 border border-emerald-200/90 p-3 rounded-xl transition-all">
                              <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold shadow-xs">
                                ✓
                              </div>
                              <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">{reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ACTION 2: Local Partner Access Card for Alternative Scheme */}
                    <div className="bg-indigo-50/70 border border-indigo-200/90 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-indigo-950 font-black text-xs">
                          <MapPin className="w-4 h-4 text-indigo-700 shrink-0" />
                          <span>Disbursing Institution Channel: <strong className="text-indigo-900 font-black">{scheme.channel}</strong></span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-semibold">
                          {partnerCount !== null ? `${partnerCount} partners available${applicantState ? ` in ${applicantState}` : ''}` : 'Official partners available'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleLocatePartners(scheme)}
                        className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 active:scale-[0.99]"
                      >
                        <MapPin className="w-3.5 h-3.5 text-amber-300" />
                        <span>{t.btnLocatePartners}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* ACTION 3 & ACTION 5: Scheme Financial Detail Grid & Action Buttons */}
                    <div className="space-y-2">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                        Financing Terms
                      </span>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[11px] uppercase font-bold tracking-wider">Max Loan Cap</span>
                          <span className="text-base font-black text-slate-900 mt-0.5 block">₹{scheme.maximum_loan?.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px] uppercase font-bold tracking-wider">Interest Rate</span>
                          <span className="text-base font-black text-blue-700 mt-0.5 block">{scheme.interest_rate}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px] uppercase font-bold tracking-wider">Tenure</span>
                          <span className="text-base font-black text-slate-900 mt-0.5 block">{scheme.repayment_period}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px] uppercase font-bold tracking-wider">Monthly EMI</span>
                          <span className="text-base font-black text-emerald-700 mt-0.5 block">
                            {scheme.illustrative_monthly_emi ? `₹${scheme.illustrative_monthly_emi.toLocaleString('en-IN')}` : 'Calculated'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Toolbar for Alternative Scheme */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => toggleSchemeDetails(scheme.scheme_id || idx)}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-300/80 transition-all flex items-center justify-center gap-1.5 active:scale-[0.99]"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-600" />
                        <span>{t.viewSchemeDetails || "View Scheme Details"}</span>
                        {isDetailsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleLocatePartners(scheme)}
                        className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                      >
                        <MapPin className="w-3.5 h-3.5 text-amber-300" />
                        <span>{t.btnLocatePartners} ({scheme.scheme_name})</span>
                      </button>

                      <button
                        onClick={() => handleCalculateEmi(scheme)}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                      >
                        <Calculator className="w-3.5 h-3.5 text-amber-400" />
                        <span>{t.btnRecalculateEmi}</span>
                      </button>
                    </div>

                    {/* ACTION 5: Expandable Scheme Details for Alternative Scheme */}
                    {isDetailsExpanded && (
                      <div className="bg-slate-100/90 border border-slate-200 rounded-2xl p-5 space-y-3 text-xs text-slate-700 mt-2 transition-all">
                        <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
                          <FileText className="w-4 h-4 text-indigo-600" />
                          <span>Official NSFDC Scheme Parameters ({scheme.scheme_name})</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <span className="font-bold text-slate-900 block">Disbursing Channel:</span>
                            <span>{scheme.channel}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">Moratorium Grace Period:</span>
                            <span>{scheme.moratorium}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">Maximum Project Cost Ceiling:</span>
                            <span>₹{scheme.maximum_project_cost ? scheme.maximum_project_cost.toLocaleString('en-IN') : 'As per Project Plan'}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">Target Beneficiaries:</span>
                            <span>Scheduled Caste (SC) Entrepreneurs & Students</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ACTION 1: Official Application Portal (Placed at the LAST of the block) */}
                    <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
                            <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>{t.officialGovtPortalSub || "Official Government Application Portal"}</span>
                          </div>
                          <p className="text-xs text-slate-300 font-medium">
                            Official application processing for <strong className="text-white font-bold">{scheme.scheme_name}</strong>
                          </p>
                        </div>

                        <a
                          href={applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all flex items-center justify-center gap-2 shrink-0 active:scale-[0.99] group cursor-pointer"
                        >
                          <span>{t.btnApplyScheme || "Apply for This Scheme"} →</span>
                          <ExternalLink className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </a>
                      </div>

                      <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-medium flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{t.trustApplicationDisclaimer || "UdyamSaarthi helps identify suitable schemes. Application and final approval are handled through the official government/authorized channel."}</span>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transparent Disclaimer Notice */}
      <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200/90 text-center text-xs text-slate-500 font-semibold space-y-1">
        <p className="flex items-center justify-center gap-1.5 text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{t.disclaimerText}</span>
        </p>
      </div>
    </div>
  );
}
