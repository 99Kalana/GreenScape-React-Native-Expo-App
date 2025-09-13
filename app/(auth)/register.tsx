import { View, Text, TextInput, TouchableOpacity, Pressable, ActivityIndicator, Alert } from 'react-native';
import React, { useState } from "react";
import { useRouter } from 'expo-router';
import { register } from '@/services/authService';
import { Feather } from '@expo/vector-icons';

const Register = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoadingReg, setIsLoadingReg] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    if (isLoadingReg) return;

    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsLoadingReg(true);
    try {
      await register(email, password);
      Alert.alert("Success", "Registration successful!");
      router.back();
    } catch (err: any) {
      console.log(err);
      if (err.code === "auth/email-already-in-use") {
        setErrorMessage("This email address is already in use.");
      } else if (err.code === "auth/invalid-email") {
        setErrorMessage("The email address is invalid.");
      } else if (err.code === "auth/weak-password") {
        setErrorMessage("Password should be at least 6 characters.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoadingReg(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-100 justify-center p-6">
      <Text className="text-3xl font-bold mb-6 text-green-600 text-center">Join GreenScape</Text>

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
        onPress={handleRegister}
        disabled={isLoadingReg}
        className="bg-green-500 rounded-lg p-4 flex-row justify-center items-center mb-4"
      >
        {isLoadingReg ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-lg font-semibold text-center">Register</Text>
        )}
      </TouchableOpacity>

      <Pressable onPress={() => router.back()}>
        <Text className="text-green-600 text-center text-base font-medium">Already have an account? Login</Text>
      </Pressable>
    </View>
  );
};

export default Register;
