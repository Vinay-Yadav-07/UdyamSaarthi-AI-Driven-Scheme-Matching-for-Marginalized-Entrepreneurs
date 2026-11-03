import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Calculator, IndianRupee, Percent, Calendar, AlertCircle, Info, PieChart, Clock, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function EmiCalculatorPage({ t }) {
  const location = useLocation();
  const schemeState = location.state || {};

  const [loanAmount, setLoanAmount] = useState(schemeState.loanAmount ?? 250000);
  const [interestRate, setInterestRate] = useState(schemeState.interestRate ?? 8.0);
  const [tenureYears, setTenureYears] = useState(schemeState.tenureYears ?? 5.0);
  const [moratoriumMonths, setMoratoriumMonths] = useState(schemeState.moratoriumMonths ?? 3);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function calculate() {
      try {
        setLoading(true);
        const data = await api.calculateEmi({
          loan_amount: parseFloat(loanAmount) || 0,
          interest_rate_pa: parseFloat(interestRate) || 0,
          tenure_years: parseFloat(tenureYears) || 1,
          moratorium_months: parseInt(moratoriumMonths) || 0,
        });
        setResult(data);
      } catch (err) {
        console.error("EMI Calculation failed:", err);
      } finally {
        setLoading(false);
      }
    }
    calculate();
  }, [loanAmount, interestRate, tenureYears, moratoriumMonths]);

  // Compute principal vs interest percentage for the visual bar
  const totalRepayment = result?.total_repayment || (parseFloat(loanAmount) || 0);
  const principalAmount = parseFloat(loanAmount) || 0;
  const totalInterest = result?.total_interest || 0;
  
  const principalPercent = totalRepayment > 0 ? Math.round((principalAmount / totalRepayment) * 100) : 100;
  const interestPercent = 100 - principalPercent;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Banner & Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xl space-y-8">
        <div className="border-b border-slate-200/80 pb-6">
          <div className="flex items-center gap-2 text-blue-700 font-black text-xs uppercase tracking-wider mb-2">
            <div className="p-1.5 bg-blue-100/70 rounded-lg text-blue-700">
              <Calculator className="w-4 h-4" />
            </div>
            <span>Official NSFDC Repayment Simulator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t.calcTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            {t.calcSub}
          </p>

          {schemeState.schemeName && (
            <div className="bg-indigo-50/80 border border-indigo-200/80 text-indigo-900 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 mt-4 shadow-2xs">
              <Info className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
              <span>
                Pre-filled parameters for selected scheme: <strong className="text-indigo-950 font-black underline">{schemeState.schemeName}</strong>
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Loan Amount Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-blue-700" />
                  {t.loanAmountLabel}
                </label>
                <div className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                  <span className="text-sm font-black text-blue-800">
                    ₹{Number(loanAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="10000"
                max="5000000"
                step="10000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
              />
              <div className="flex items-center justify-between gap-2 pt-1">
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
                />
              </div>
            </div>

            {/* Interest Rate Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-indigo-700" />
                  {t.interestRateLabel}
                </label>
                <div className="flex items-center gap-1 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">
                  <span className="text-sm font-black text-indigo-800">
                    {interestRate}% p.a.
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="4.0"
                max="18.0"
                step="0.5"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              {/* Preset buttons */}
              <div className="flex gap-2">
                {[5.0, 6.0, 8.0, 10.0].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setInterestRate(rate)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      Number(interestRate) === rate
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            {/* Tenure Years Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-700" />
                  {t.tenureYearsLabel}
                </label>
                <div className="flex items-center gap-1 bg-purple-50 px-3 py-1 rounded-xl border border-purple-200">
                  <span className="text-sm font-black text-purple-800">
                    {tenureYears} Years
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                step="1"
                value={tenureYears}
                onChange={(e) => setTenureYears(e.target.value)}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Moratorium Months */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                {t.moratoriumMonthsLabel}
              </label>
              <select
                value={moratoriumMonths}
                onChange={(e) => setMoratoriumMonths(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-2xs"
              >
                <option value="0">0 Months (No Grace Period)</option>
                <option value="3">3 Months (Standard MFS/UNY Grace)</option>
                <option value="6">6 Months (Term Loan Grace)</option>
                <option value="12">12 Months (ELS Post-Course Grace)</option>
              </select>
            </div>
          </div>

          {/* Results Summary Box (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-7 text-white flex flex-col justify-between shadow-2xl border border-slate-800 relative overflow-hidden space-y-6">
            {/* Soft Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-extrabold uppercase rounded-full border border-emerald-400/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Exact EMI Computed
                </span>
                <span className="text-[11px] font-bold text-slate-400">NSFDC Repayment Engine</span>
              </div>

              <div>
                <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">{t.calcMonthlyEmi}</p>
                <p className="text-4xl sm:text-5xl font-black text-emerald-400 mt-1 tracking-tight">
                  ₹{result?.monthly_emi?.toLocaleString('en-IN') || '0'}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  Payable monthly after {moratoriumMonths > 0 ? `${moratoriumMonths} months grace period` : 'disbursement'}
                </p>
              </div>

              {/* Visual Percentage Progress Bar */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-blue-300">Principal: {principalPercent}%</span>
                  <span className="text-amber-300">Interest: {interestPercent}%</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${principalPercent}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                  />
                  <div
                    style={{ width: `${interestPercent}%` }}
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-0.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.calcTotalInterest}</p>
                  <p className="text-base font-black text-amber-300">
                    ₹{result?.total_interest?.toLocaleString('en-IN') || '0'}
                  </p>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-0.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.calcTotalRepayment}</p>
                  <p className="text-base font-black text-slate-100">
                    ₹{result?.total_repayment?.toLocaleString('en-IN') || '0'}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{t.calcNotice}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

