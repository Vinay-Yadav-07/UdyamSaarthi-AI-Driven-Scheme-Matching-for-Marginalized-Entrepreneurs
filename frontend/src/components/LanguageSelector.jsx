import React from 'react';
import { Globe } from 'lucide-react';

export default function LanguageSelector({ currentLang, onLanguageChange }) {
  return (
    <div className="inline-flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 shadow-xs">
      <Globe className="w-4 h-4 text-slate-500 ml-1 mr-1" />
      <button
        type="button"
        onClick={() => onLanguageChange('en')}
        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
          currentLang === 'en'
            ? 'bg-blue-700 text-white shadow-xs'
            : 'text-slate-700 hover:text-blue-700'
        }`}
      >
        English
      </button>
      <span className="text-slate-300 mx-1">|</span>
      <button
        type="button"
        onClick={() => onLanguageChange('hi')}
        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
          currentLang === 'hi'
            ? 'bg-blue-700 text-white shadow-xs'
            : 'text-slate-700 hover:text-blue-700'
        }`}
      >
        हिंदी
      </button>
    </div>
  );
}
