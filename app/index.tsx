import { View, Text, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

const index = () => {
    const router = useRouter();
    const { user, loading } = useAuth();
    // State to track when the welcome screen timer has finished
    const [isSplashComplete, setSplashComplete] = useState(false);

    useEffect(() => {
        // Set a timer to finish the splash screen after 3 seconds
        const timer = setTimeout(() => {
            setSplashComplete(true);
        }, 3000);

        // Clear the timer when the component unmounts
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Only navigate once the splash screen is complete AND the authentication status has loaded
        if (isSplashComplete && !loading) {
            if (user) {
                // If the user is logged in, navigate to the home screen
                router.replace("/home");
            } else {
                // Otherwise, navigate to the login screen
                router.replace("/login");
            }
        }
    }, [isSplashComplete, loading, user]);

    // We will always render the welcome screen while waiting for the timer or authentication to finish
    return (
        <View className="flex-1 justify-center items-center bg-emerald-50 p-4">
            <Text className="text-5xl font-bold text-green-800 mb-2">GreenScape 🌱</Text>
            <Text className="text-lg text-emerald-400 mb-5 font-semibold">Your personal plant care companion</Text>
            <ActivityIndicator size="large" color="#16a34a" className="mt-10" />
        </View>
    );
};

export default index;
