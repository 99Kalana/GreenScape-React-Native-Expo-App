import React from 'react';
import { Stack } from 'expo-router';
import { useLanguage } from '../../../../context/LanguageContext';
import { useTheme } from '../../../../context/ThemeContext';

const NotificationsLayout = () => {
    const { language } = useLanguage();
    const { isDarkMode } = useTheme();

    const translations: { [key: string]: { [lang: string]: string } } = {
        "Notifications": { "English": "Notifications", "Spanish": "Notificaciones", "French": "Notifications", "German": "Benachrichtigungen" },
    };

    const getTranslatedText = (key: string) => {
        return translations[key]?.[language] || key;
    };

    const headerStyle = {
        backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
    };

    const headerTintColor = isDarkMode ? '#FFFFFF' : '#000000';

    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: getTranslatedText("Notifications"),
                    headerShown: true,
                    headerStyle: headerStyle,
                    headerTintColor: headerTintColor,
                }}
            />
        </Stack>
    );
};

export default NotificationsLayout;
