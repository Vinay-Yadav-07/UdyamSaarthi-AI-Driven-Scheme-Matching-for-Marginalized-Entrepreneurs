import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, User, IndianRupee, Briefcase, AlertCircle, Info, MapPin, Sparkles, ArrowRight, ShieldCheck, Award } from 'lucide-react';
import LocationDropdown from '../components/LocationDropdown';
import { api } from '../services/api';

export default function CheckEligibilityPage({ t, onEvaluateComplete }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    age: 28,
    gender: 'Female',
    social_category: 'SC',
    caste_certificate: 'Yes',
    annual_family_income: 180000,
    application_purpose: 'business',
    project_type: 'income_generating_activity',
    estimated_project_cost: 150000,
    requested_loan_amount: 120000,
    education_status: 'Secondary',
    employment_status: 'self_employed',
    business_experience: '1-3 Years',
    vocational_training: 'Formally Trained (PMKVY / ITI / Skill Center)',
    promoter_contribution_ready: 'Yes',
    state: '',
    district: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const projectCostNum = parseFloat(formData.estimated_project_cost) || 0;
  const promoterPct = projectCostNum <= 500000 ? 5 : 10;
  const promoterAmount = Math.round(projectCostNum * (promoterPct / 100));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const age = parseInt(formData.age, 10);
    const projectCost = parseFloat(formData.estimated_project_cost);
    const requestedLoan = parseFloat(formData.requested_loan_amount);

    if (isNaN(age) || age < 18 || age > 70) {
      setError('Applicant age must be between 18 and 70 years.');
      return;
    }

    if (isNaN(projectCost) || projectCost <= 0) {
      setError('Estimated project cost must be greater than ₹0.');
      return;
    }

    if (isNaN(requestedLoan) || requestedLoan < 0) {
      setError('Requested loan amount must be a valid positive number.');
      return;
    }

    if (requestedLoan > projectCost) {
      setError(`Requested loan amount (₹${requestedLoan.toLocaleString('en-IN')}) cannot exceed the estimated project cost (₹${projectCost.toLocaleString('en-IN')}).`);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        age: age,
        gender: formData.gender,
        social_category: formData.social_category,
        caste_certificate: formData.caste_certificate,
        annual_family_income: parseFloat(formData.annual_family_income) || 0,
        estimated_project_cost: projectCost,
        requested_loan_amount: requestedLoan,
        application_purpose: formData.application_purpose,
        project_type: formData.project_type,
        education_status: formData.education_status,
        employment_status: formData.employment_status,
        vocational_training: formData.vocational_training,
        promoter_contribution_ready: formData.promoter_contribution_ready,
        state: formData.state,
        district: formData.district,
      };

      const result = await api.getRecommendation(payload);

      const fullResult = {
        ...result,
        applicant_profile: {
          ...payload,
          business_experience: formData.business_experience,
          promoter_amount: promoterAmount,
          promoter_pct: promoterPct,
        }
      };

      if (onEvaluateComplete) {
        onEvaluateComplete(fullResult);
      }
      navigate('/recommendations');
    } catch (err) {
      setError(err.message || 'Evaluation failed. Please verify API server status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 font-sans">
      
      {/* Main Form Container Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl space-y-8">
        
        {/* Header Title Section */}
        <div className="border-b border-slate-200/80 pb-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Grounded AI Matching Engine</span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-semibold bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Official NSFDC Scheme Parameters</span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {t.formTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              {t.formSub}
            </p>
          </div>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-900 text-xs sm:text-sm font-semibold shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* SECTION 1: "About You" */}
          <div className="bg-slate-50/70 p-5 sm:p-7 rounded-2xl border border-slate-200/90 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  1
                </div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {t.step1Title}
                </h2>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                Applicant Background
              </span>
            </div>

            {/* 2-Column Grid Layout (2 options per row) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Applicant Age */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{t.labelAge}</span>
                </label>
                <input
                  type="number"
                  min="18"
                  max="70"
                  step="1"
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none transition-all shadow-xs hover:border-slate-400"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.labelGender || 'Gender Identity'}
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none transition-all shadow-xs hover:border-slate-400"
                >
                  <option value="Female">Female (Women Entrepreneur)</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other / Self Help Group</option>
                </select>
              </div>

              {/* Social Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.labelCategory}
                </label>
                <select
                  value={formData.social_category}
                  onChange={(e) => handleChange('social_category', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none transition-all shadow-xs hover:border-slate-400"
                >
                  <option value="SC">{t.optionSC}</option>
                  <option value="Non-SC">{t.optionNonSC}</option>
                </select>
              </div>

              {/* Caste Certificate */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.labelCasteCert}
                </label>
                <select
                  value={formData.caste_certificate}
                  onChange={(e) => handleChange('caste_certificate', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none transition-all shadow-xs hover:border-slate-400"
                >
                  <option value="Yes">{t.optionYes}</option>
                  <option value="No">{t.optionNo}</option>
                </select>
              </div>
            </div>

            {/* Social Category Information Notice */}
            <div className="bg-indigo-50/80 border border-indigo-200 text-indigo-950 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-700 shrink-0" />
              <span>{t.scNotice}</span>
            </div>

            {/* Annual Family Income */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{t.labelIncome}</span>
                </label>
                <span className="text-[11px] font-bold text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200">
                  {t.incomeHint}
                </span>
              </div>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.annual_family_income}
                onChange={(e) => handleChange('annual_family_income', e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none transition-all shadow-xs hover:border-slate-400"
              />
            </div>

            {/* Profile Details in 2-column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.labelEducation}
                </label>
                <select
                  value={formData.education_status}
                  onChange={(e) => handleChange('education_status', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none transition-all shadow-xs hover:border-slate-400"
                >
                  <option value="Primary">Primary Education</option>
                  <option value="Secondary">Secondary (10th)</option>
                  <option value="Higher Secondary">Higher Secondary (12th)</option>
                  <option value="Graduate">Graduate Degree</option>
                  <option value="Post-Graduate">Post-Graduate</option>
                  <option value="Professional / Technical">Professional / Technical Degree</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.labelEmployment}
                </label>
                <select
                  value={formData.employment_status}
                  onChange={(e) => handleChange('employment_status', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none transition-all shadow-xs hover:border-slate-400"
                >
                  <option value="self_employed">Self Employed / Artisan</option>
                  <option value="unemployed">First-Time Entrepreneur / Unemployed</option>
                  <option value="micro_entrepreneur">Existing Micro Entrepreneur</option>
                  <option value="student">Student (Higher Education)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{t.labelVocational || 'Vocational & Skill Certification'}</span>
                </label>
                <select
                  value={formData.vocational_training}
                  onChange={(e) => handleChange('vocational_training', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none transition-all shadow-xs hover:border-slate-400"
                >
                  <option value="Formally Trained (PMKVY / ITI / Skill Center)">Formally Certified (PMKVY / ITI / Skill Center)</option>
                  <option value="NSFDC Skill Trainee">NSFDC Sponsored Skill Trainee</option>
                  <option value="None">None / Self-Taught</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.labelExperience}
                </label>
                <select
                  value={formData.business_experience}
                  onChange={(e) => handleChange('business_experience', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none transition-all shadow-xs hover:border-slate-400"
                >
                  <option value="New Entrant">New Entrant (0 Experience)</option>
                  <option value="1-3 Years">1-3 Years Experience</option>
                  <option value="3+ Years">3+ Years Experienced</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: "Where You Are" */}
          <div className="bg-slate-50/70 p-5 sm:p-7 rounded-2xl border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  2
                </div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {t.step2Title}
                </h2>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                36 States & UTs
              </span>
            </div>

            <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>{t.step2Expl}</span>
            </p>

            <LocationDropdown
              selectedState={formData.state}
              selectedDistrict={formData.district}
              onStateChange={(val) => handleChange('state', val)}
              onDistrictChange={(val) => handleChange('district', val)}
              t={t}
            />
          </div>

          {/* SECTION 3: "What Are You Planning?" */}
          <div className="bg-slate-50/70 p-5 sm:p-7 rounded-2xl border border-slate-200/90 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  3
                </div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {t.step3Title}
                </h2>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                Project & Goal Specs
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Application Purpose */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{t.labelPurpose}</span>
                </label>
                <select
                  value={formData.application_purpose}
                  onChange={(e) => {
                    const purpose = e.target.value;
                    handleChange('application_purpose', purpose);
                    if (purpose === 'education') {
                      handleChange('project_type', 'professional_education');
                    } else {
                      handleChange('project_type', 'income_generating_activity');
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none transition-all shadow-xs hover:border-slate-400"
                >
                  <option value="business">{t.purposeBusiness}</option>
                  <option value="education">{t.purposeEducation}</option>
                </select>
              </div>

              {/* Project Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.labelProjectType}
                </label>
                <select
                  value={formData.project_type}
                  onChange={(e) => handleChange('project_type', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none transition-all shadow-xs hover:border-slate-400"
                >
                  {formData.application_purpose === 'education' ? (
                    <option value="professional_education">{t.typeProfEducation}</option>
                  ) : (
                    <>
                      <option value="income_generating_activity">{t.typeIncomeActivity}</option>
                      <option value="new_business">{t.typeNewBusiness}</option>
                      <option value="business_expansion">{t.typeExpansion}</option>
                      <option value="self_employment">{t.typeSelfEmployment}</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Estimated Project Cost */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>{t.labelProjectCost}</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.estimated_project_cost}
                onChange={(e) => {
                  const cost = parseFloat(e.target.value) || 0;
                  handleChange('estimated_project_cost', e.target.value);
                  handleChange('requested_loan_amount', Math.round(cost * 0.80));
                }}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none transition-all shadow-xs hover:border-slate-400"
              />
            </div>
          </div>

          {/* SECTION 4: "Funding Need" */}
          <div className="bg-slate-50/70 p-5 sm:p-7 rounded-2xl border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  4
                </div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {t.step4Title}
                </h2>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                Loan Requirement
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Requested Loan Amount */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>{t.labelRequestedLoan}</span>
                  </label>
                  <span className="text-[10px] font-semibold text-slate-500">
                    ≤ Estimated Cost
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.requested_loan_amount}
                  onChange={(e) => handleChange('requested_loan_amount', e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none transition-all shadow-xs hover:border-slate-400"
                />
              </div>

              {/* Promoter Contribution Ready */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {t.labelPromoterShare || 'Promoter Share Ready?'}
                  </label>
                  <span className="text-[10px] font-bold text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200">
                    {promoterPct}% Share (₹{promoterAmount.toLocaleString('en-IN')})
                  </span>
                </div>
                <select
                  value={formData.promoter_contribution_ready}
                  onChange={(e) => handleChange('promoter_contribution_ready', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none transition-all shadow-xs hover:border-slate-400"
                >
                  <option value="Yes">Yes — Ready to contribute ₹{promoterAmount.toLocaleString('en-IN')}</option>
                  <option value="No">No — Seeking full bank loan support</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-900 hover:from-indigo-800 hover:to-indigo-950 text-white font-extrabold text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2.5 group active:scale-[0.99] cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Matching Scheme Profile...</span>
              </div>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>{t.btnMatchSchemes}</span>
                <ArrowRight className="w-5 h-5 text-slate-200 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
