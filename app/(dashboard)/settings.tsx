import { View, Text, TouchableOpacity, Alert, Switch, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCameraPermissions, useMediaLibraryPermissions } from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

// Helper component for a single setting item
const SettingItem = ({ icon, label, children, isDarkMode }: { icon: any, label: string, children: React.ReactNode, isDarkMode: boolean }) => (
    <View className={`flex-row items-center justify-between py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <View className="flex-row items-center">
            <Ionicons name={icon} size={24} color={isDarkMode ? '#bbb' : '#555'} />
            <Text className={`ml-4 text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{label}</Text>
        </View>
        {children}
    </View>
);

const Settings = () => {
    const auth = getAuth();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const { language, changeLanguage, availableLanguages } = useLanguage();

    // Translations for the settings page
    const translations: { [key: string]: { [lang: string]: string } } = {
        "Settings": { "English": "Settings", "Spanish": "Ajustes", "French": "Paramètres", "German": "Einstellungen" },
        "Account": { "English": "Account", "Spanish": "Cuenta", "French": "Compte", "German": "Konto" },
        "Logout": { "English": "Logout", "Spanish": "Cerrar sesión", "French": "Déconnexion", "German": "Abmelden" },
        "General": { "English": "General", "Spanish": "General", "French": "Général", "German": "Allgemein" },
        "Dark Mode": { "English": "Dark Mode", "Spanish": "Modo oscuro", "French": "Mode sombre", "German": "Dunkelmodus" },
        "Language": { "English": "Language", "Spanish": "Idioma", "French": "Langue", "German": "Sprache" },
        "App Permissions": { "English": "App Permissions", "Spanish": "Permisos de la app", "French": "Autorisations de l'application", "German": "App-Berechtigungen" },
        "Notifications": { "English": "Notifications", "Spanish": "Notificaciones", "French": "Notifications", "German": "Benachrichtigungen" },
        "Camera": { "English": "Camera", "Spanish": "Cámara", "French": "Caméra", "German": "Kamera" },
        "Gallery": { "English": "Gallery", "Spanish": "Galería", "French": "Galerie", "German": "Galerie" },
        "Granted": { "English": "Granted", "Spanish": "Concedido", "French": "Autorisé", "German": "Gewährt" },
        "Denied": { "English": "Denied", "Spanish": "Denegado", "French": "Refusé", "German": "Abgelehnt" },
        "checking...": { "English": "checking...", "Spanish": "comprobando...", "French": "vérification...", "German": "prüfen..." },
        "Permission Required": { "English": "Permission Required", "Spanish": "Permiso requerido", "French": "Autorisation requise", "German": "Erforderliche Berechtigung" },
        "Please enable": { "English": "Please enable", "Spanish": "Por favor, habilite", "French": "Veuillez activer", "German": "Bitte aktivieren Sie" },
        "in your device settings to use this feature.": { "English": "in your device settings to use this feature.", "Spanish": "en la configuración de su dispositivo para usar esta función.", "French": "dans les paramètres de votre appareil pour utiliser cette fonctionnalité.", "German": "in den Geräteeinstellungen, um diese Funktion zu nutzen." },
        "Open Settings": { "English": "Open Settings", "Spanish": "Abrir ajustes", "French": "Ouvrir les paramètres", "German": "Einstellungen öffnen" },
        "Logout Failed": { "English": "Logout Failed", "Spanish": "Fallo al cerrar sesión", "French": "Échec de la déconnexion", "German": "Abmeldung fehlgeschlagen" },
        "There was a problem logging you out. Please try again.": { "English": "There was a problem logging you out. Please try again.", "Spanish": "Hubo un problema al cerrar su sesión. Por favor, inténtelo de nuevo.", "French": "Il y a eu un problème lors de la déconnexion. Veuillez réessayer.", "German": "Es gab ein Problem beim Abmelden. Bitte versuchen Sie es erneut." }
    };

    const getTranslatedText = (key: string) => {
        return translations[key]?.[language] || key;
    };

    // State for notifications permission
    const [notificationStatus, setNotificationStatus] = useState(getTranslatedText('checking...'));

    // Permissions hooks for camera and gallery
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [galleryPermission, requestGalleryPermission] = useMediaLibraryPermissions();
    
    // Check initial permission status for notifications on mount
    useEffect(() => {
        (async () => {
            const { status } = await Notifications.getPermissionsAsync();
            setNotificationStatus(getTranslatedText(status === 'granted' ? 'Granted' : 'Denied'));
        })();
    }, []);

    const requestPermission = async (type: 'camera' | 'gallery' | 'notifications') => {
        let permission;
        switch (type) {
            case 'camera':
                permission = await requestCameraPermission();
                break;
            case 'gallery':
                permission = await requestGalleryPermission();
                break;
            case 'notifications':
                const { status } = await Notifications.requestPermissionsAsync();
                setNotificationStatus(getTranslatedText(status === 'granted' ? 'Granted' : 'Denied'));
                if (status === 'granted') return;
                break;
        }

        if (permission?.status !== 'granted') {
            Alert.alert(
                getTranslatedText("Permission Required"),
                `${getTranslatedText("Please enable")} ${getTranslatedText(type)} ${getTranslatedText("in your device settings to use this feature.")}`,
                [
                    { text: getTranslatedText("Open Settings"), onPress: () => Linking.openSettings() }
                ]
            );
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.replace('/(auth)/login');
        } catch (error) {
            console.error("Logout failed:", error);
            Alert.alert(getTranslatedText("Logout Failed"), getTranslatedText("There was a problem logging you out. Please try again."));
        }
    };

    const containerClassName = isDarkMode ? 'bg-gray-900' : 'bg-white';
    const cardClassName = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';
    const textClassName = isDarkMode ? 'text-gray-300' : 'text-gray-800';
    const subTextClassName = isDarkMode ? 'text-gray-400' : 'text-gray-600';
    
    const getPermissionStatus = (permission: { status: string } | null | undefined) => {
        if (!permission) return getTranslatedText('checking...');
        return getTranslatedText(permission.status === 'granted' ? 'Granted' : 'Denied');
    };

    return (
        <SafeAreaView className={`flex-1 p-6 ${containerClassName}`}>
            <ScrollView className="flex-1">
                <View className="flex-1 justify-start items-center w-full mt-10">
                    <View className="mb-8 items-center">
                        <Ionicons name="settings-outline" size={100} color={isDarkMode ? '#22C55E' : '#22C55E'} />
                        <Text className={`text-3xl font-bold mt-2 ${textClassName}`}>{getTranslatedText("Settings")}</Text>
                    </View>

                    {/* Account Section */}
                    <View className={`w-full max-w-sm p-6 rounded-lg shadow-md border ${cardClassName} mb-6`}>
                        <Text className={`text-lg font-bold mb-4 ${textClassName}`}>{getTranslatedText("Account")}</Text>
                        <TouchableOpacity
                            className="w-full py-3 rounded-lg flex items-center justify-center bg-red-500 shadow-md"
                            onPress={handleLogout}
                        >
                            <Text className="text-white font-bold text-base">{getTranslatedText("Logout")}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* General Section */}
                    <View className={`w-full max-w-sm p-6 rounded-lg shadow-md border ${cardClassName} mb-6`}>
                        <Text className={`text-lg font-bold mb-2 ${textClassName}`}>{getTranslatedText("General")}</Text>
                        
                        {/* Dark Mode */}
                        <View className={`flex-row items-center justify-between py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <View className="flex-row items-center">
                                <Ionicons name="moon-outline" size={24} color={isDarkMode ? '#bbb' : '#555'} />
                                <Text className={`ml-4 text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{getTranslatedText("Dark Mode")}</Text>
                            </View>
                            <Switch
                                trackColor={{ false: "#ccc", true: "#81b0ff" }}
                                thumbColor={isDarkMode ? "#f4f3f4" : "#f4f3f4"}
                                onValueChange={toggleDarkMode}
                                value={isDarkMode}
                            />
                        </View>

                        {/* Language Preference */}
                        <SettingItem icon="language-outline" label={getTranslatedText("Language")} isDarkMode={isDarkMode}>
                            <View className="flex-col items-end">
                                {availableLanguages.map(lang => (
                                    <TouchableOpacity 
                                        key={lang} 
                                        onPress={() => changeLanguage(lang)} 
                                        className="py-1"
                                    >
                                        <Text className={`text-base ${language === lang ? 'font-bold text-green-500' : subTextClassName}`}>{lang}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </SettingItem>
                    </View>

                    {/* Permissions Section */}
                    <View className={`w-full max-w-sm p-6 rounded-lg shadow-md border ${cardClassName}`}>
                        <Text className={`text-lg font-bold mb-2 ${textClassName}`}>{getTranslatedText("App Permissions")}</Text>

                        <TouchableOpacity onPress={() => requestPermission('notifications')}>
                            <SettingItem icon="notifications-outline" label={getTranslatedText("Notifications")} isDarkMode={isDarkMode}>
                                <Text className={`text-sm ${notificationStatus === getTranslatedText('Granted') ? 'text-green-500' : 'text-red-500'}`}>{notificationStatus}</Text>
                            </SettingItem>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => requestPermission('camera')}>
                            <SettingItem icon="camera-outline" label={getTranslatedText("Camera")} isDarkMode={isDarkMode}>
                                <Text className={`text-sm ${getPermissionStatus(cameraPermission) === getTranslatedText('Granted') ? 'text-green-500' : 'text-red-500'}`}>{getPermissionStatus(cameraPermission)}</Text>
                            </SettingItem>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => requestPermission('gallery')}>
                            <SettingItem icon="image-outline" label={getTranslatedText("Gallery")} isDarkMode={isDarkMode}>
                                <Text className={`text-sm ${getPermissionStatus(galleryPermission) === getTranslatedText('Granted') ? 'text-green-500' : 'text-red-500'}`}>{getPermissionStatus(galleryPermission)}</Text>
                            </SettingItem>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Settings;
