import React from 'react';
import { Slot, Stack, useRouter } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';
import { LoaderProvider } from '@/context/LoaderContext';
import "./../global.css";
import * as Notifications from 'expo-notifications';

const RootLayout = () => {

    const router = useRouter();

    

    return (
        <LoaderProvider>
            <AuthProvider>
                <Slot/>
            </AuthProvider>
        </LoaderProvider>
    );
};

export default RootLayout;