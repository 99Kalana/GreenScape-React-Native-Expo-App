import { View, Text, TextInput, TouchableOpacity, Pressable, ActivityIndicator, Alert } from 'react-native';
import React, { useState } from "react";
import { useRouter } from 'expo-router';
import { login } from '@/services/authService';
import { Feather } from '@expo/vector-icons';

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (isLoading) return;
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      Alert.alert("Success", "Login successful!");
      router.push('/home'); // redirect to home after login
    } catch (err: any) {
      console.log(err);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setErrorMessage("Invalid email or password.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-100 justify-center p-6">
      <Text className="text-3xl font-bold mb-6 text-green-600 text-center">Welcome Back</Text>

      {errorMessage && (
        <View className="bg-yellow-100 border border-yellow-400 rounded-lg p-3 mb-4">
          <Text className="text-yellow-800 text-center">{errorMessage}</Text>
        </View>
      )}

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#9CA3AF"
        className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 mb-4"
      />

      <View className="relative mb-4">
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor="#9CA3AF"
          className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 pr-12"
        />
        <Pressable
          onPress={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <Feather name={showPassword ? "eye-off" : "eye"} size={24} color="#718096" />
        </Pressable>
      </View>

      <TouchableOpacity
        onPress={handleLogin}
        disabled={isLoading}
        className="bg-green-500 rounded-lg p-4 flex-row justify-center items-center mb-4"
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-lg font-semibold text-center">Login</Text>
        )}
      </TouchableOpacity>

      <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
        <Text className="text-green-600 text-center text-base font-medium mb-4">
          Forgot Password?
        </Text>
      </Pressable>

      <Pressable onPress={() => router.push('/(auth)/register')}>
        <Text className="text-green-600 text-center text-base font-medium">
          Don't have an account? Register
        </Text>
      </Pressable>
    </View>
  );
};

export default Login;
