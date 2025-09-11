import React, { createContext, useState, useContext } from 'react';

// Create the context with a default value that matches the expected shape
const ThemeContext = createContext({
    isDarkMode: false,
    toggleDarkMode: () => {},
});

// Create a custom hook to easily access the context
export const useTheme = () => useContext(ThemeContext);

// Provider component that manages the state and provides it to children
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
