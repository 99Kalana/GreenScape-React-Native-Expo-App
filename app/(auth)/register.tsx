import { View, Text, TextInput, TouchableOpacity, Pressable, ActivityIndicator, Alert, StyleSheet, Image } from 'react-native';
import React, { useState } from "react";
import { useRouter } from 'expo-router';
import { register } from '@/services/authService';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
            Join GreenScape
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
          onPress={handleRegister}
          disabled={isLoadingReg}
          style={styles.registerButton}
        >
          <LinearGradient
            colors={['#56AB2F', '#A8E063']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.registerButtonGradient}
          >
            {isLoadingReg ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Register</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginLink}>Login</Text>
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
  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#14532d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  registerButtonGradient: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loginText: {
    color: '#4b5563', // gray 600
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  loginLink: {
    color: '#22c55e', // green 600
    fontWeight: 'bold',
  },
});

export default Register;
