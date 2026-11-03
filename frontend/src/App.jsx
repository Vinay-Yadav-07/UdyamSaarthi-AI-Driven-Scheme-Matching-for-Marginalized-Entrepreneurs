import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CheckEligibilityPage from './pages/CheckEligibilityPage';
import RecommendationsPage from './pages/RecommendationsPage';
import EmiCalculatorPage from './pages/EmiCalculatorPage';
import PartnerLocatorPage from './pages/PartnerLocatorPage';
import AiAssistantPage from './pages/AiAssistantPage';
import { getTranslation } from './i18n';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

export default function App() {
  const [lang, setLang] = useState(() => {
    return sessionStorage.getItem('udyamSaarthiLang') || 'en';
  });

  const [recommendationResult, setRecommendationResult] = useState(null);

  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    sessionStorage.setItem('udyamSaarthiLang', newLang);
  };

  const t = getTranslation(lang);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans antialiased">
      <ScrollToTop />
      <Header
        currentLang={lang}
        onLanguageChange={handleLanguageChange}
        t={t}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage t={t} />} />
          <Route
            path="/eligibility"
            element={
              <CheckEligibilityPage
                t={t}
                onEvaluateComplete={(result) => setRecommendationResult(result)}
              />
            }
          />
          <Route
            path="/recommendations"
            element={
              <RecommendationsPage
                recommendationResult={recommendationResult}
                t={t}
              />
            }
          />
          <Route path="/calculator" element={<EmiCalculatorPage t={t} />} />
          <Route path="/locator" element={<PartnerLocatorPage t={t} />} />
          <Route path="/assistant" element={<AiAssistantPage currentLang={lang} t={t} />} />
        </Routes>
      </main>

      <Footer t={t} />
    </div>
  );
}
