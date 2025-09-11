import React from 'react';
import { Stack } from 'expo-router';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';

const PlantsLayout = () => {
    const { language } = useLanguage();
    const { isDarkMode } = useTheme();

    const translations: { [key: string]: { [lang: string]: string } } = {
        "Plant Details": { "English": "Plant Details", "Spanish": "Detalles de la planta", "French": "Détails de la plante", "German": "Pflanzendetails" },
    };

    const getTranslatedText = (key: string) => {
        return translations[key]?.[language] || key;
    };

    const headerStyle = {
        backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
    };

    const headerTintColor = isDarkMode ? '#FFFFFF' : '#000000';

    return (
        <Stack screenOptions={{ animation: "slide_from_right" }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
                name="[id]"
                options={{
                    title: getTranslatedText("Plant Details"),
                    headerStyle: headerStyle,
                    headerTintColor: headerTintColor,
                }}
            />
        </Stack>
    );
};

export default PlantsLayout;
