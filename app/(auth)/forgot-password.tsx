import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Pressable } from 'react-native';
import React, { useState } from "react";
import { useRouter } from 'expo-router';
import { forgotPassword } from '@/services/authService';

const ForgotPassword = () => {
    const router = useRouter();
    const [email, setEmail] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handlePasswordReset = async () => {
        if (isLoading) return;
        if (!email) {
            Alert.alert("Error", "Please enter your email address.");
            return;
        }

        setIsLoading(true);
        await forgotPassword(email)
            .then(() => {
                Alert.alert("Success", "A password reset link has been sent to your email.");
                router.back();
            })
            .catch((err) => {
                console.log(err);
                Alert.alert("Password Reset Failed", "Please check your email address and try again.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <View className="flex-1 bg-gray-100 justify-center p-4">
            <Text className="text-2xl font-bold mb-6 text-green-600 text-center">
                Forgot Password
            </Text>
            <TextInput
                placeholder="Email"
                className="bg-slate-200 border border-gray-300 rounded px-4 py-2 text-gray-900"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TouchableOpacity 
                className="bg-green-500 p-4 rounded mt-2"
                onPress={handlePasswordReset}>
                {isLoading ? (
                    <ActivityIndicator color="#fff"/>
                ) : (
                    <Text className='text-center text-2xl text-white'>Send Reset Link</Text>
                )}
            </TouchableOpacity>
            <Pressable onPress={() => router.back()}>
                <Text className="text-center text-green-600 mt-4">
                    Back to Login
                </Text>
            </Pressable>
        </View>
    );
};

export default ForgotPassword;
