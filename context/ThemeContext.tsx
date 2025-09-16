import React, { createContext, useState, useContext } from 'react';


const ThemeContext = createContext({
    isDarkMode: false,
    toggleDarkMode: () => {},
});


export const useTheme = () => useContext(ThemeContext);


export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    };

    const value = { isDarkMode, toggleDarkMode };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
