import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { View, Text } from 'react-native';

const tabs = [
    { name: "home", icon: "home", label: "Home" },
    { name: "plants", icon: "sprout", label: "Plants" },
    { name: "identify/index", icon: "camera-iris", label: "Identify" },
    { name: "profile", icon: "account", label: "Profile" },
    { name: "settings", icon: "cog", label: "Settings" }
];

const DashboardLayout = () => {
    const { isDarkMode } = useTheme();
    const { language } = useLanguage();

    const getTranslatedLabel = (label: string) => {
        const translations: { [key: string]: { [lang: string]: string } } = {
            "Home": { "English": "Home", "Spanish": "Hogar", "French": "Maison", "German": "Startseite" },
            "Plants": { "English": "Plants", "Spanish": "Plantas", "French": "Plantes", "German": "Pflanzen" },
            "Identify": { "English": "Identify", "Spanish": "Identificar", "French": "Identifier", "German": "Identifizieren" },
            "Profile": { "English": "Profile", "Spanish": "Perfil", "French": "Profil", "German": "Profil" },
            "Settings": { "English": "Settings", "Spanish": "Ajustes", "French": "Paramètres", "German": "Einstellungen" }
        };
        return translations[label]?.[language] || label;
    };

    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: isDarkMode ? "#22C55E" : "#22C55E",
            tabBarInactiveTintColor: isDarkMode ? "#6B7280" : "#9CA3AF",
            headerShown: false,
            tabBarStyle: {
                backgroundColor: isDarkMode ? "#1F2937" : "#fff",
                borderTopColor: isDarkMode ? "#374151" : "#E5E7EB",
            }
        }}>
            {tabs.map(({ name, icon, label }) => (
                <Tabs.Screen
                    key={name}
                    name={name}
                    options={{
                        title: getTranslatedLabel(label),
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name={icon as any} color={color} size={size} />
                        ),
                    }}
                />
            ))}
        </Tabs>
    );
};

export default DashboardLayout;
