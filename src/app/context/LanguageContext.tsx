'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Lang = 'EN' | 'VN';

interface LanguageContextProps {
  language: Lang;
  setLanguage: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Lang>('EN');

  useEffect(() => {
    const storedLang = localStorage.getItem('language') as Lang;
    if (storedLang) setLanguageState(storedLang);
  }, []);

  const setLanguage = (lang: Lang) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
