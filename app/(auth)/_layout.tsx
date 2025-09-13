import React from 'react';
import { Stack } from 'expo-router';

const AuthLayout = () => {
    return (
        <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
            <Stack.Screen name="login" options={{ title: "Login" }}/>
            <Stack.Screen name="register" options={{ title: "Register" }}/>
            {/* Added a new screen for forgot password functionality */}
            <Stack.Screen name="forgot-password" options={{ title: "Forgot Password" }}/>
        </Stack>
    );
};

export default AuthLayout;