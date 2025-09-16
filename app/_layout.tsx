import React, { useEffect } from 'react';
import { Slot, Stack, useRouter } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';
import { LoaderProvider } from '@/context/LoaderContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import "./../global.css";
import * as Notifications from 'expo-notifications';

const RootLayout = () => {

    const router = useRouter();

    useEffect(() => {
        
        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            const { plantId } = response.notification.request.content.data;
            if (plantId) {
                
                router.push(`/(dashboard)/plants/${plantId}`);
            }
        });

        
        return () => {
            Notifications.removeNotificationSubscription(responseListener);
        };
    }, []);

    return (
        <ThemeProvider>
            <LanguageProvider>
                <LoaderProvider>
                    <AuthProvider>
                        <Slot />
                    </AuthProvider>
                </LoaderProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
};

export default RootLayout;
