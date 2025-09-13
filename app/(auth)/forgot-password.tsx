import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Pressable, Alert } from 'react-native';
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
    try {
      await forgotPassword(email);
      Alert.alert("Success", "A password reset link has been sent to your email.");
      router.back();
    } catch (err: any) {
      console.log(err);
      Alert.alert("Password Reset Failed", "Please check your email address and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-100 justify-center p-6">
      <Text className="text-2xl font-bold mb-6 text-green-600 text-center">
        Forgot Password
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#9CA3AF"
        className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 mb-4"
      />

      <TouchableOpacity
        onPress={handlePasswordReset}
        disabled={isLoading}
        className="bg-green-500 rounded-lg p-4 flex-row justify-center items-center mb-4"
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-center text-lg font-semibold">
            Send Reset Link
          </Text>
        )}
      </TouchableOpacity>

      <Pressable onPress={() => router.back()} className="mt-4">
        <Text className="text-green-600 text-center text-base font-medium">
          Back to Login
        </Text>
      </Pressable>
    </View>
  );
};

export default ForgotPassword;
