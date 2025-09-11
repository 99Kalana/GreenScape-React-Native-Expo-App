import { View, Text, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const Settings = () => {
    const auth = getAuth();

    // Handle user logout
    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.replace('/(auth)/login');
        } catch (error) {
            console.error("Logout failed:", error);
            Alert.alert("Logout Failed", "There was a problem logging you out. Please try again.");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white p-6">
            <View className="flex-1 justify-start items-center w-full mt-10">
                <View className="mb-8 items-center">
                    <Ionicons name="settings-outline" size={100} color="#22C55E" />
                    <Text className="text-3xl font-bold text-gray-800 mt-2">Settings</Text>
                </View>

                <View className="w-full max-w-sm bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
                    <Text className="text-lg font-bold text-gray-800 mb-4">Account</Text>
                    
                    {/* Logout Button */}
                    <TouchableOpacity
                        className="w-full py-3 rounded-lg flex items-center justify-center bg-red-500 shadow-md"
                        onPress={handleLogout}
                    >
                        <Text className="text-white font-bold text-base">Logout</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </SafeAreaView>
    );
};

export default Settings;
