import { View, Text, Pressable, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from "react";
import { useRouter } from 'expo-router';
import { login } from '@/services/authService';

const Login = () => {
    const router = useRouter();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isLoadingReg, setIsLoadingReg] = useState<boolean>(false);

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
            <TextInput
                placeholder="Password"
                className="bg-slate-200 border border-gray-300 rounded px-4 py-2 text-gray-900 mt-4"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <TouchableOpacity 
                className="bg-green-500 p-4 rounded mt-2"
                onPress={handleLogin}>
                {isLoadingReg ? (
                    <ActivityIndicator color="#fff"/>
                ) : (
                    <Text className='text-center text-2xl text-white'>Login</Text>
                )}
            </TouchableOpacity>
            <Pressable onPress={() => router.push('../(auth)/register')}>
                <Text className="text-center text-green-600 mt-4">
                    Don't have an account? Sign Up
                </Text>
            </Pressable>
        </View>
    );
};

export default Login;