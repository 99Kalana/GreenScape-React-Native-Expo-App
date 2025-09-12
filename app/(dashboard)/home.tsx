import { View, Text, TouchableOpacity } from 'react-native';
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

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
            <View className="flex-1 items-center p-6">
                {/* Header Section */}
                <View className="flex-row items-center justify-center w-full mt-8 mb-4">
                    <Ionicons name="leaf-outline" size={60} color="#22C55E" />
                    <Text className="text-4xl font-extrabold text-green-700 dark:text-green-500 ml-2">GreenScape</Text>
                </View>
                <Text className="text-lg mt-2 text-gray-600 dark:text-gray-300">
                    Hello, {user?.email || 'Guest'}!
                </Text>

                {/* Notification Banner */}
                {notificationPermissionStatus === 'denied' && notificationBannerVisible && (
                    <View className="absolute top-28 z-10 w-[95%] p-4 bg-yellow-100 border border-yellow-300 rounded-lg flex-row items-center justify-between shadow-md">
                        <View className="flex-row items-center flex-1">
                            <Ionicons name="warning-outline" size={24} color="#D97706" />
                            <Text className="text-yellow-700 ml-2 flex-wrap text-sm">
                                Please enable notifications to receive plant care reminders.
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => setNotificationBannerVisible(false)} className="ml-4 p-1">
                            <Ionicons name="close-circle-outline" size={24} color="#D97706" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Navigation Grid */}
                <View className="flex-row flex-wrap justify-center mt-12 w-full max-w-xl">
                    {/* My Plants Card */}
                    <TouchableOpacity
                        onPress={() => router.push('/(dashboard)/plants')}
                        className="w-40 h-40 m-2 rounded-2xl bg-green-500 justify-center items-center shadow-lg"
                    >
                        <Ionicons name="flower-outline" size={50} color="white" />
                        <Text className="text-white text-lg font-bold mt-2">My Plants</Text>
                    </TouchableOpacity>

                    {/* Identify Card */}
                    <TouchableOpacity
                        onPress={() => router.push('/(dashboard)/identify')}
                        className="w-40 h-40 m-2 rounded-2xl bg-blue-500 justify-center items-center shadow-lg"
                    >
                        <Ionicons name="scan-outline" size={50} color="white" />
                        <Text className="text-white text-lg font-bold mt-2">Identify</Text>
                    </TouchableOpacity>

                    {/* Profile Card */}
                    <TouchableOpacity
                        onPress={() => router.push('/(dashboard)/profile')}
                        className="w-40 h-40 m-2 rounded-2xl bg-purple-500 justify-center items-center shadow-lg"
                    >
                        <Ionicons name="person-circle-outline" size={50} color="white" />
                        <Text className="text-white text-lg font-bold mt-2">Profile</Text>
                    </TouchableOpacity>

                    {/* Settings Card */}
                    <TouchableOpacity
                        onPress={() => router.push('/(dashboard)/settings')}
                        className="w-40 h-40 m-2 rounded-2xl bg-gray-500 justify-center items-center shadow-lg"
                    >
                        <Ionicons name="settings-outline" size={50} color="white" />
                        <Text className="text-white text-lg font-bold mt-2">Settings</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </SafeAreaView>
    );
};

export default Home;
