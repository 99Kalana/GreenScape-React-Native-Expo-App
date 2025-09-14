import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Pressable, StyleSheet, Alert } from 'react-native';
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
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.logo}>🌱</Text>
        <Text style={styles.title}>
          Forgot Password
        </Text>
        <Text style={styles.subtitle}>
          Enter your email to receive a password reset link.
        </Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />

        <TouchableOpacity
          onPress={handlePasswordReset}
          disabled={isLoading}
          style={styles.buttonContainer}
        >
          <LinearGradient
            colors={['#56AB2F', '#A8E063']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.gradientButton}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                Send Reset Link
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>
            Back to Login
          </Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: 'white',
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    color: '#34d399',
    marginBottom: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#14532d',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#1f2937',
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#16a34a',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  gradientButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 16,
  },
  backButtonText: {
    color: '#16a34a',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ForgotPassword;
