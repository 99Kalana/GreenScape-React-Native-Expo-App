import React, { createContext, useState, useContext } from 'react';


const LanguageContext = createContext({
    language: 'English',
    changeLanguage: (newLanguage: string) => {},
    availableLanguages: ['English', 'Spanish', 'French', 'German']
});


export const useLanguage = () => useContext(LanguageContext);


export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguage] = useState('English');
    const availableLanguages = ['English', 'Spanish', 'French', 'German'];

    const changeLanguage = (newLanguage: string) => {
        setLanguage(newLanguage);
    };

    const value = { language, changeLanguage, availableLanguages };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};
