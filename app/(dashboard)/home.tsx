import { View, Text, TouchableOpacity, Alert } from 'react-native';
import React, {useEffect} from 'react';
import { useAuth } from '@/context/AuthContext';
import { logout } from '@/services/authService';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';

const Home = () => {
    const router = useRouter();
    const { user } = useAuth();

    // Add this useEffect hook to request notification permissions when the component mounts
    useEffect(() => {
        const requestPermissions = async () => {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                console.log('Notification permissions not granted!');
                // Optionally, you can alert the user or show a UI to ask them again
                Alert.alert(
                    "Notifications Disabled",
                    "Please enable notifications in your device settings to receive plant care reminders."
                );
            }
        };

        requestPermissions();
    }, []); // Empty dependency array ensures this runs only once

    const handleLogout = async () => {
        try {
            await logout();
            router.replace('/login');
        } catch (error) {
            console.error("Logout failed:", error);
            Alert.alert("Logout Failed", "Something went wrong.");
        }
    };

    return (
        <View className="flex-1 justify-center items-center bg-gray-100">
            <Text className="text-2xl font-bold">Welcome to GreenScape!</Text>
            {user && (
                <Text className="text-lg mt-2 text-gray-600">
                    Logged in as: {user.email}
                </Text>
            )}
            <TouchableOpacity 
                onPress={handleLogout}
                className="bg-red-500 p-4 rounded mt-6">
                <Text className="text-white font-bold text-lg">Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Home;