// @/src/contexts/LanguageContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import { Language, locales, Translations } from '@/locales';

const STORAGE_KEY = 'mybini_lang';

function getInitialLang(): Language {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'id' ? 'id' : 'en';
}

interface LanguageContextValue {
    lang: Language;
    setLang: (lang: Language) => void;
    t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Language>(getInitialLang);

    const setLang = (newLang: Language) => {
        setLangState(newLang);
        localStorage.setItem(STORAGE_KEY, newLang);
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t: locales[lang] }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage(): LanguageContextValue {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
    return ctx;
}
