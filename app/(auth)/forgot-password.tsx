import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Pressable, Alert } from 'react-native';
import React, { useState } from "react";
import { useRouter } from 'expo-router';
import { forgotPassword } from '@/services/authService';
import { LinearGradient } from 'expo-linear-gradient';

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
    <LinearGradient
      colors={['#A8E063', '#56AB2F']}
      className="flex-1 justify-center items-center p-6"
    >
      <View className="bg-white w-full rounded-3xl p-8 shadow-2xl space-y-6">
        {/* A simple icon to replace the missing image asset */}
        <Text className="text-5xl text-green-700 text-center mb-4">🌱</Text>
        <Text className="text-3xl font-bold text-green-800 text-center">
          Forgot Password
        </Text>
        <Text className="text-base text-gray-600 text-center">
          Enter your email to receive a password reset link.
        </Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#9CA3AF"
          className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-4 text-gray-900 focus:border-green-500"
        />

        <TouchableOpacity
          onPress={handlePasswordReset}
          disabled={isLoading}
          className="w-full h-14 rounded-xl overflow-hidden shadow-lg"
        >
          <LinearGradient
            colors={['#56AB2F', '#A8E063']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            className="flex-1 flex-row justify-center items-center"
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center text-lg font-semibold">
                Send Reset Link
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-green-600 text-center text-base font-medium">
            Back to Login
          </Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
};

export default ForgotPassword;
