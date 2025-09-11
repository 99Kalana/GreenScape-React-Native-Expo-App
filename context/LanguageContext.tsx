import React, { createContext, useState, useContext } from 'react';

// Create the context with a default value that matches the expected shape
const LanguageContext = createContext({
    language: 'English',
    changeLanguage: (newLanguage: string) => {},
});

// Create a custom hook to easily access the context
export const useLanguage = () => useContext(LanguageContext);

// Provider component that manages the state and provides it to children
export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguage] = useState('English');

    const changeLanguage = (newLanguage: string) => {
        setLanguage(newLanguage);
    };

    const value = { language, changeLanguage };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};
