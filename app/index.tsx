import { View, Text, ActivityIndicator, Image, Animated } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient'; 

const Index = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isSplashComplete, setSplashComplete] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current; 

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => setSplashComplete(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isSplashComplete && !loading) {
      if (user) router.replace("/home");
      else router.replace("/login");
    }
  }, [isSplashComplete, loading, user]);

  return (
    <LinearGradient
      colors={['#A8E063', '#56AB2F']} 
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}
    >
      <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
        
        <Image
          source={require('@/assets/plant-logo.png')}
          style={{ width: 100, height: 100, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 2, height: 2 }, shadowRadius: 4 }}
          resizeMode="contain"
        />
        <Text className="text-5xl font-bold text-white mb-2">
          GreenScape 🌱
        </Text>
        <Text className="text-lg text-white mb-5 font-semibold text-center">
          Your personal plant care companion
        </Text>
      </Animated.View>
      <ActivityIndicator size="large" color="#ffffff" className="mt-10" />
    </LinearGradient>
  );
};

export default Index;
