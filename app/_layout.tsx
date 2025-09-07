import React from 'react';
import { Slot, Stack, useRouter } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';
import { LoaderProvider } from '@/context/LoaderContext';
import "./../global.css";

const RootLayout = () => {
    return (
        <LoaderProvider>
            <AuthProvider>
                <Slot/>
            </AuthProvider>
        </LoaderProvider>
    );
};

export default RootLayout;