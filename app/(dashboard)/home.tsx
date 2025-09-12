import { View, Text, TouchableOpacity, Alert } from 'react-native';
import React, {useEffect, useState} from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const Home = () => {
    const router = useRouter();
    const auth = getAuth();
    const user = auth.currentUser;
    const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<'granted' | 'denied' | 'checking'>('checking');
    const [notificationBannerVisible, setNotificationBannerVisible] = useState(false);

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

    const handleLogout = async () => {
        try {
            await auth.signOut();
            router.replace('/(auth)/login');
        } catch (error) {
            console.error("Logout failed:", error);
            Alert.alert("Logout Failed", "Something went wrong.");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 justify-center items-center p-6">
                <Ionicons name="leaf-outline" size={120} color="#22C55E" />
                <Text className="text-4xl font-extrabold text-green-700 mt-4">GreenScape</Text>
                <Text className="text-lg mt-2 text-gray-600">
                    Hello, {user?.email || 'Guest'}!
                </Text>

                {notificationPermissionStatus === 'denied' && notificationBannerVisible && (
                    <View className="absolute top-16 w-full p-4 mx-4 bg-yellow-100 border border-yellow-300 rounded-lg flex-row items-center justify-between shadow-md">
                        <View className="flex-row items-center flex-1">
                            <Ionicons name="warning-outline" size={24} color="#D97706" />
                            <Text className="text-yellow-700 ml-2 flex-wrap text-sm">
                                Please enable notifications to receive plant care reminders.
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => setNotificationBannerVisible(false)} className="ml-4">
                            <Ionicons name="close-circle-outline" size={24} color="#D97706" />
                        </TouchableOpacity>
                    </View>
                )}

                <TouchableOpacity 
                    onPress={handleLogout}
                    className="bg-red-500 w-full max-w-sm p-4 rounded-lg mt-6 shadow-md"
                >
                    <Text className="text-white font-bold text-lg text-center">Logout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default Home;
