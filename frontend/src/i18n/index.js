import { en } from './en';
import { hi } from './hi';

export const translations = {
  en,
  hi
};

export const getTranslation = (lang = 'en') => {
  return translations[lang] || translations.en;
};
