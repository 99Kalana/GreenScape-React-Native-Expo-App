import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import React, {useEffect, useState} from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

const Home = () => {
    const router = useRouter();
    const auth = getAuth();
    const user = auth.currentUser;
    const { isDarkMode } = useTheme();
    const { language } = useLanguage();

    const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<'granted' | 'denied' | 'checking'>('checking');
    const [notificationBannerVisible, setNotificationBannerVisible] = useState(false);

    // Translations for the home page
    const translations: { [key: string]: { [lang: string]: string } } = {
        "GreenScape": { "English": "GreenScape", "Spanish": "GreenScape", "French": "GreenScape", "German": "GreenScape" },
        "Hello, ": { "English": "Hello, ", "Spanish": "¡Hola, ", "French": "Bonjour, ", "German": "Hallo, " },
        "!": { "English": "!", "Spanish": "!", "French": " !", "German": "!" },
        "Please enable notifications to receive plant care reminders.": { "English": "Please enable notifications to receive plant care reminders.", "Spanish": "Por favor, active las notificaciones para recibir recordatorios de cuidado de plantas.", "French": "Veuillez activer les notifications pour recevoir des rappels d'entretien de plantes.", "German": "Bitte aktivieren Sie Benachrichtigungen, um Pflanzpflege-Erinnerungen zu erhalten." },
        "My Plants": { "English": "My Plants", "Spanish": "Mis Plantas", "French": "Mes Plantes", "German": "Meine Pflanzen" },
        "Identify": { "English": "Identify", "Spanish": "Identificar", "French": "Identifier", "German": "Identifizieren" },
        "Profile": { "English": "Profile", "Spanish": "Perfil", "French": "Profil", "German": "Profil" },
        "Settings": { "English": "Settings", "Spanish": "Ajustes", "French": "Paramètres", "German": "Einstellungen" }
    };

    const getTranslatedHomeText = (key: string) => {
        return translations[key]?.[language] || key;
    };
    
    useEffect(() => {
        const checkPermissions = async () => {
            const { status } = await Notifications.getPermissionsAsync();
            if (status === 'granted') {
                setNotificationPermissionStatus('granted');
                setNotificationBannerVisible(false);
            } else {
                setNotificationPermissionStatus('denied');
                setNotificationBannerVisible(true);
            }
        };

        checkPermissions();
    }, []);

    const requestNotificationPermissions = async () => {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status === 'granted') {
            setNotificationPermissionStatus('granted');
            setNotificationBannerVisible(false);
        } else {
            setNotificationPermissionStatus('denied');
        }
    };

    const containerClassName = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
    const headerTextClassName = isDarkMode ? 'text-green-500' : 'text-green-700';
    const subTextClassName = isDarkMode ? 'text-gray-300' : 'text-gray-600';
    const bannerBgClassName = isDarkMode ? 'bg-yellow-900 border-yellow-800' : 'bg-yellow-100 border-yellow-300';
    const bannerTextClassName = isDarkMode ? 'text-yellow-300' : 'text-yellow-700';
    const cardBgClassName = (color: string) => `${color}-500`;

    return (
        <SafeAreaView className={`flex-1 ${containerClassName}`}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 p-6">
                <View className="flex-1 items-center">
                    {/* Header Section */}
                    <View className="flex-row items-center justify-center w-full mt-8 mb-4">
                        <Ionicons name="leaf-outline" size={60} color="#22C55E" />
                        <Text className={`text-4xl font-extrabold ml-2 ${headerTextClassName}`}>{getTranslatedHomeText("GreenScape")}</Text>
                    </View>
                    <Text className={`text-lg mt-2 ${subTextClassName}`}>
                        {getTranslatedHomeText("Hello, ")} {user?.email || 'Guest'} {getTranslatedHomeText("!")}
                    </Text>

                    {/* Notification Banner */}
                    {notificationPermissionStatus === 'denied' && notificationBannerVisible && (
                        <View className={`top-6 z-10 w-[95%] p-4 rounded-lg flex-row items-center justify-between shadow-md ${bannerBgClassName}`}>
                            <View className="flex-row items-center flex-1">
                                <Ionicons name="warning-outline" size={24} color={isDarkMode ? '#FCD34D' : '#D97706'} />
                                <Text className={`ml-2 flex-wrap text-sm ${bannerTextClassName}`}>
                                    {getTranslatedHomeText("Please enable notifications to receive plant care reminders.")}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setNotificationBannerVisible(false)} className="ml-4 p-1">
                                <Ionicons name="close-circle-outline" size={24} color={isDarkMode ? '#FCD34D' : '#D97706'} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Navigation Grid */}
                    <View className="flex-row flex-wrap justify-center mt-12 w-full max-w-xl">
                        {/* My Plants Card */}
                        <TouchableOpacity
                            onPress={() => router.push('/(dashboard)/plants')}
                            className={`w-40 h-40 m-2 rounded-2xl bg-green-500 justify-center items-center shadow-lg`}
                        >
                            <Ionicons name="flower-outline" size={50} color="white" />
                            <Text className="text-white text-lg font-bold mt-2">{getTranslatedHomeText("My Plants")}</Text>
                        </TouchableOpacity>

                        {/* Identify Card */}
                        <TouchableOpacity
                            onPress={() => router.push('/(dashboard)/identify')}
                            className={`w-40 h-40 m-2 rounded-2xl bg-blue-500 justify-center items-center shadow-lg`}
                        >
                            <Ionicons name="scan-outline" size={50} color="white" />
                            <Text className="text-white text-lg font-bold mt-2">{getTranslatedHomeText("Identify")}</Text>
                        </TouchableOpacity>

                        {/* Profile Card */}
                        <TouchableOpacity
                            onPress={() => router.push('/(dashboard)/profile')}
                            className={`w-40 h-40 m-2 rounded-2xl bg-purple-500 justify-center items-center shadow-lg`}
                        >
                            <Ionicons name="person-circle-outline" size={50} color="white" />
                            <Text className="text-white text-lg font-bold mt-2">{getTranslatedHomeText("Profile")}</Text>
                        </TouchableOpacity>

                        {/* Settings Card */}
                        <TouchableOpacity
                            onPress={() => router.push('/(dashboard)/settings')}
                            className={`w-40 h-40 m-2 rounded-2xl bg-gray-500 justify-center items-center shadow-lg`}
                        >
                            <Ionicons name="settings-outline" size={50} color="white" />
                            <Text className="text-white text-lg font-bold mt-2">{getTranslatedHomeText("Settings")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Home;
