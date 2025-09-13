import { View, Text, TextInput, TouchableOpacity, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useState } from "react";
import { useRouter } from 'expo-router';
import { register } from '@/services/authService';
import { Feather } from '@expo/vector-icons';

const Register = () => {
    const router = useRouter();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isLoadingReg, setIsLoadingReg] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const handleRegister = async () => {
        if (isLoadingReg) return;

        // Validation for empty fields
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        // Simple regex to validate email format
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Error", "Please enter a valid email address.");
            return;
        }

        setIsLoadingReg(true);
        await register(email, password)
            .then(() => {
                router.back();
            })
            .catch((err) => {
                console.log(err);
                if (err.code === "auth/email-already-in-use") {
                    Alert.alert("Registration Failed", "This email address is already in use.");
                } else if (err.code === "auth/invalid-email") {
                    Alert.alert("Registration Failed", "The email address is invalid.");
                } else if (err.code === "auth/weak-password") {
                    Alert.alert("Registration Failed", "Password should be at least 6 characters.");
                } else {
                    Alert.alert("Registration Failed", "Something went wrong. Please try again.");
                }
            })
            .finally(() => {
                setIsLoadingReg(false);
            });
    };

    return (
        <View className="flex-1 bg-gray-100 justify-center p-8">
            <Text className="text-3xl font-extrabold mb-8 text-green-700 text-center tracking-wide">
                Join GreenScape
            </Text>

            <TextInput
                placeholder="Email"
                className="bg-white border border-gray-300 rounded-xl px-5 py-4 text-gray-900 shadow-sm focus:border-green-500 transition-all mb-4"
                placeholderTextColor="#A0AEC0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <View className="relative">
                <TextInput
                    placeholder="Password"
                    className="bg-white border border-gray-300 rounded-xl px-5 py-4 text-gray-900 shadow-sm focus:border-green-500 transition-all"
                    placeholderTextColor="#A0AEC0"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                />
                <Pressable
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    onPress={() => setShowPassword(!showPassword)}
                >
                    <Feather
                        name={showPassword ? "eye-off" : "eye"}
                        size={24}
                        color="#718096"
                    />
                </Pressable>
            </View>

            <TouchableOpacity 
                className="bg-green-600 p-4 rounded-xl mt-6 shadow-md"
                style={{ opacity: isLoadingReg ? 0.7 : 1 }}
                onPress={handleRegister}
                disabled={isLoadingReg}
            >
                {isLoadingReg ? (
                    <ActivityIndicator color="#fff"/>
                ) : (
                    <Text className='text-center text-xl text-white font-bold tracking-wide'>Register</Text>
                )}
            </TouchableOpacity>

            <Pressable onPress={() => router.back()} className="mt-6">
                <Text className="text-center text-green-600 font-semibold">
                    Already have an account? Login
                </Text>
            </Pressable>
        </View>
    );
};

export default Register;
