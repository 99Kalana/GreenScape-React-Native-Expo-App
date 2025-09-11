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
    const { language, changeLanguage } = useLanguage();
    
    // State for notifications permission
    const [notificationStatus, setNotificationStatus] = useState('checking...');

    // Permissions hooks for camera and gallery
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [galleryPermission, requestGalleryPermission] = useMediaLibraryPermissions();
    
    // Check initial permission status for notifications on mount
    useEffect(() => {
        (async () => {
            const { status } = await Notifications.getPermissionsAsync();
            setNotificationStatus(status === 'granted' ? 'Granted' : 'Denied');
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
                setNotificationStatus(status === 'granted' ? 'Granted' : 'Denied');
                if (status === 'granted') return;
                break;
        }

        if (permission?.status !== 'granted') {
            Alert.alert(
                "Permission Required",
                `Please enable ${type} permissions in your device settings to use this feature.`,
                [
                    { text: "Open Settings", onPress: () => Linking.openSettings() }
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
            Alert.alert("Logout Failed", "There was a problem logging you out. Please try again.");
        }
    };

    const handleLanguageChange = () => {
        const newLanguage = language === 'English' ? 'Spanish' : 'English';
        changeLanguage(newLanguage);
    };

    const containerClassName = isDarkMode ? 'bg-gray-900' : 'bg-white';
    const cardClassName = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';
    const textClassName = isDarkMode ? 'text-gray-300' : 'text-gray-800';
    const subTextClassName = isDarkMode ? 'text-gray-400' : 'text-gray-600';
    
    const getPermissionStatus = (permission: { status: string } | null | undefined) => {
        if (!permission) return 'checking...';
        return permission.status === 'granted' ? 'Granted' : 'Denied';
    };

    return (
        <SafeAreaView className={`flex-1 p-6 ${containerClassName}`}>
            <ScrollView className="flex-1">
                <View className="flex-1 justify-start items-center w-full mt-10">
                    <View className="mb-8 items-center">
                        <Ionicons name="settings-outline" size={100} color={isDarkMode ? '#22C55E' : '#22C55E'} />
                        <Text className={`text-3xl font-bold mt-2 ${textClassName}`}>Settings</Text>
                    </View>

                    {/* Account Section */}
                    <View className={`w-full max-w-sm p-6 rounded-lg shadow-md border ${cardClassName} mb-6`}>
                        <Text className={`text-lg font-bold mb-4 ${textClassName}`}>Account</Text>
                        <TouchableOpacity
                            className="w-full py-3 rounded-lg flex items-center justify-center bg-red-500 shadow-md"
                            onPress={handleLogout}
                        >
                            <Text className="text-white font-bold text-base">Logout</Text>
                        </TouchableOpacity>
                    </View>

                    {/* General Section */}
                    <View className={`w-full max-w-sm p-6 rounded-lg shadow-md border ${cardClassName} mb-6`}>
                        <Text className={`text-lg font-bold mb-2 ${textClassName}`}>General</Text>
                        
                        {/* Dark Mode */}
                        <View className={`flex-row items-center justify-between py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <View className="flex-row items-center">
                                <Ionicons name="moon-outline" size={24} color={isDarkMode ? '#bbb' : '#555'} />
                                <Text className={`ml-4 text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Dark Mode</Text>
                            </View>
                            <Switch
                                trackColor={{ false: "#ccc", true: "#81b0ff" }}
                                thumbColor={isDarkMode ? "#f4f3f4" : "#f4f3f4"}
                                onValueChange={toggleDarkMode}
                                value={isDarkMode}
                            />
                        </View>

                        {/* Language Preference */}
                        <TouchableOpacity onPress={handleLanguageChange}>
                            <View className={`flex-row items-center justify-between py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                <View className="flex-row items-center">
                                    <Ionicons name="language-outline" size={24} color={isDarkMode ? '#bbb' : '#555'} />
                                    <Text className={`ml-4 text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Language</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Text className={`mr-2 ${subTextClassName}`}>{language}</Text>
                                    <Ionicons name="chevron-forward-outline" size={18} color={isDarkMode ? '#aaa' : '#555'} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Permissions Section */}
                    <View className={`w-full max-w-sm p-6 rounded-lg shadow-md border ${cardClassName}`}>
                        <Text className={`text-lg font-bold mb-2 ${textClassName}`}>App Permissions</Text>

                        <TouchableOpacity onPress={() => requestPermission('notifications')}>
                            <SettingItem icon="notifications-outline" label="Notifications" isDarkMode={isDarkMode}>
                                <Text className={`text-sm ${notificationStatus === 'Granted' ? 'text-green-500' : 'text-red-500'}`}>{notificationStatus}</Text>
                            </SettingItem>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => requestPermission('camera')}>
                            <SettingItem icon="camera-outline" label="Camera" isDarkMode={isDarkMode}>
                                <Text className={`text-sm ${getPermissionStatus(cameraPermission) === 'Granted' ? 'text-green-500' : 'text-red-500'}`}>{getPermissionStatus(cameraPermission)}</Text>
                            </SettingItem>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => requestPermission('gallery')}>
                            <SettingItem icon="image-outline" label="Gallery" isDarkMode={isDarkMode}>
                                <Text className={`text-sm ${getPermissionStatus(galleryPermission) === 'Granted' ? 'text-green-500' : 'text-red-500'}`}>{getPermissionStatus(galleryPermission)}</Text>
                            </SettingItem>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Settings;
