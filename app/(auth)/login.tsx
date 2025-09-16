import { View, Text, TextInput, TouchableOpacity, Pressable, ActivityIndicator, Alert, Image, StyleSheet } from 'react-native';
import React, { useState } from "react";
import { useRouter } from 'expo-router';
import { login } from '@/services/authService';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
      router.push('/home'); 
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
    <LinearGradient
      colors={['#A8E063', '#56AB2F']}
      style={styles.container}
    >
      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/plant-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.welcomeText}>
            Welcome Back
          </Text>
        </View>

        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#9CA3AF"
          style={styles.textInput}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor="#9CA3AF"
            style={styles.passwordInput}
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Feather name={showPassword ? "eye-off" : "eye"} size={24} color="#718096" />
          </Pressable>
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoading}
          style={styles.loginButton}
        >
          <LinearGradient
            colors={['#56AB2F', '#A8E063']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.loginButtonGradient}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
          <Text style={styles.forgotPasswordText}>
            Forgot Password?
          </Text>
        </Pressable>

        <Pressable onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.registerText}>
            Don't have an account? <Text style={styles.registerLink}>Register</Text>
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
    width: '100%',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#14532d', // deep green
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#fee2e2', // light red
    borderColor: '#fca5a5', // medium red
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#b91c1c', // dark red
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: '#f3f4f6', // light gray
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#1f2937', // gray 900
    marginBottom: 16,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  passwordInput: {
    backgroundColor: '#f3f4f6', // light gray
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#1f2937', // gray 900
    paddingRight: 48,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#14532d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  loginButtonGradient: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  forgotPasswordText: {
    color: '#4b5563', // gray 600
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  registerText: {
    color: '#4b5563', // gray 600
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  registerLink: {
    color: '#22c55e', // green 600
    fontWeight: 'bold',
  },
});

export default Login;
