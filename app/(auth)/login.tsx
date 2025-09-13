import { View, Text, Pressable, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from "react";
import { useRouter } from 'expo-router';
import { login } from '@/services/authService';
import { Feather } from '@expo/vector-icons'; // Import Feather icons

const Login = () => {
    const router = useRouter();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isLoadingReg, setIsLoadingReg] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false); // State to toggle password visibility

    const handleLogin = async () => {
        if (isLoadingReg) return;
        setIsLoadingReg(true);
        await login(email, password)
            .then((res) => {
                router.push("../home");
            })
            .catch((err) => {
                console.log(err);
                Alert.alert("Login Failed", "Something went wrong.");
            })
            .finally(() => {
                setIsLoadingReg(false);
            });
    };

    return (
        <View className="flex-1 bg-gray-100 justify-center p-4">
            <Text className="text-2xl font-bold mb-6 text-green-600 text-center">
                Login to GreenScape
            </Text>
            <TextInput
                placeholder="Email"
                className="bg-slate-200 border border-gray-300 rounded px-4 py-2 text-gray-900"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
            />
            <View className="relative mt-4"> {/* Use a container for the password input and icon */}
                <TextInput
                    placeholder="Password"
                    className="bg-slate-200 border border-gray-300 rounded px-4 py-2 text-gray-900 pr-12" // Add padding to the right for the icon
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword} // Toggle based on state
                    value={password}
                    onChangeText={setPassword}
                />
                <Pressable
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    onPress={() => setShowPassword(!showPassword)}
                >
                    <Feather
                        name={showPassword ? "eye-off" : "eye"} // Change icon based on state
                        size={20}
                        color="#6B7280"
                    />
                </Pressable>
            </View>
            <TouchableOpacity 
                className="bg-green-500 p-4 rounded mt-2"
                onPress={handleLogin}>
                {isLoadingReg ? (
                    <ActivityIndicator color="#fff"/>
                ) : (
                    <Text className='text-center text-2xl text-white'>Login</Text>
                )}
            </TouchableOpacity>
            
            <View className="flex-row justify-between mt-4">
                <Pressable onPress={() => router.push('../(auth)/forgot-password')}>
                    <Text className="text-sm text-green-600">
                        Forgot Password?
                    </Text>
                </Pressable>

                <Pressable onPress={() => router.push('../(auth)/register')}>
                    <Text className="text-sm text-green-600">
                        Don't have an account? Sign Up
                    </Text>
                </Pressable>
            </View>
        </View>
    );
};

export default Login;
