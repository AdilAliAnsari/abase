import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { translations, Translations, LanguageCode } from './translations';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  t: Translations;
  languages: { code: LanguageCode; name: string; native: string }[];
}

const STORAGE_KEY = 'abase_app_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  const languages: { code: LanguageCode; name: string; native: string }[] = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  ];

  useEffect(() => {
    // Load saved language preference
    const loadSavedLang = async () => {
      try {
        let saved: string | null = null;
        if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
          saved = localStorage.getItem(STORAGE_KEY);
        } else {
          saved = await AsyncStorage.getItem(STORAGE_KEY);
        }

        if (saved && (saved === 'en' || saved === 'hi' || saved === 'kn')) {
          setLanguageState(saved as LanguageCode);
        }
      } catch (e) {
        console.warn('Could not restore language preference:', e);
      }
    };
    loadSavedLang();
  }, []);

  const setLanguage = async (newLang: LanguageCode) => {
    setLanguageState(newLang);
    try {
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, newLang);
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, newLang);
      }
    } catch (e) {
      console.warn('Could not persist language preference:', e);
    }
  };

  const t = translations[language] || translations.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export type TranslationResult = Translations & {
  t: Translations;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  languages: { code: LanguageCode; name: string; native: string }[];
};

export const useTranslation = (): TranslationResult => {
  const { t, language, setLanguage, languages } = useLanguage();
  return { ...t, t, language, setLanguage, languages };
};

export default LanguageContext;
