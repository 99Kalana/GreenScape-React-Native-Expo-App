import React from 'react';
import { Text } from 'react-native';
import { Stack } from 'expo-router';

const AuthLayout = () => {
    return (
        <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
            <Stack.Screen 
                name="login" 
                options={{ headerTitle: () => <Text>Login</Text> }} 
            />
            <Stack.Screen 
                name="register" 
                options={{ headerTitle: () => <Text>Register</Text> }} 
            />
            <Stack.Screen 
                name="forgot-password" 
                options={{ headerTitle: () => <Text>Forgot Password</Text> }} 
            />
        </Stack>
    );
};

export default AuthLayout;
