import { View, Text, TextInput, TouchableOpacity, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useState } from "react";
import { useRouter } from 'expo-router';
import { register } from '@/services/authService';

const Register = () => {
    const router = useRouter();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isLoadingReg, setIsLoadingReg] = useState<boolean>(false);

    const handleRegister = async () => {
        if (isLoadingReg) return;
        setIsLoadingReg(true);
        await register(email, password)
            .then(() => {
                router.back();
            })
            .catch((err) => {
                console.log(err);
                Alert.alert("Registration Failed", "Something went wrong.");
            })
            .finally(() => {
                setIsLoadingReg(false);
            });
    };

    return (
        <View className="flex-1 bg-gray-100 justify-center p-4">
            <Text className="text-2xl font-bold mb-6 text-green-600 text-center">
                Register for GreenScape
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
                onPress={handleRegister}>
                {isLoadingReg ? (
                    <ActivityIndicator color="#fff"/>
                ) : (
                    <Text className='text-center text-2xl text-white'>Register</Text>
                )}
            </TouchableOpacity>
            <Pressable onPress={() => router.back()}>
                <Text className="text-center text-green-600 mt-4">
                    Already have an account? Login
                </Text>
            </Pressable>
        </View>
    );
};

export default Register;