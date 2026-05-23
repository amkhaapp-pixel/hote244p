import { createContext, useState, useContext, useCallback } from 'react';
import { translations } from './translations';

const LanguageContext = createContext({
  lang: 'en',
  t: () => '',
  toggleLang: () => {},
  changeLang: () => {},
});

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');

  const changeLang = useCallback((newLang) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  }, []);

  const toggleLang = useCallback(() => {
    const next = lang === 'en' ? 'lo' : 'en';
    changeLang(next);
  }, [lang, changeLang]);

  const t = useCallback(
    (key, vars = {}) => {
      const keys = key.split('.');
      let val = translations[lang];
      for (const k of keys) {
        if (val && val[k] !== undefined) {
          val = val[k];
        } else {
          val = undefined;
          break;
        }
      }
      if (typeof val !== 'string') {
        // fallback to english
        val = translations.en;
        for (const k of keys) {
          if (val && val[k] !== undefined) val = val[k];
          else { val = key; break; }
        }
        if (typeof val !== 'string') val = key;
      }
      // replace {count} style variables
      return Object.entries(vars).reduce(
        (str, [k, v]) => str.replace(new RegExp(`\\{${k}\\}`, 'g'), v),
        val
      );
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang, changeLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
