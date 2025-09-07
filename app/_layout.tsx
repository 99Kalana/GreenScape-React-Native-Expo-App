import React ,{useEffect} from 'react';
import { Slot, Stack, useRouter } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';
import { LoaderProvider } from '@/context/LoaderContext';
import "./../global.css";
import * as Notifications from 'expo-notifications';

const RootLayout = () => {

    const router = useRouter();

    useEffect(() => {
        // Set up the listener for notification responses
        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            const { plantId } = response.notification.request.content.data;
            if (plantId) {
                // Navigate to the correct plant details screen
                router.push(`/(dashboard)/plants/${plantId}`);
            }
        });

        // Clean up the listener when the component unmounts
        return () => {
            Notifications.removeNotificationSubscription(responseListener);
        };
    }, []);

    return (
        <LoaderProvider>
            <AuthProvider>
                <Slot/>
            </AuthProvider>
        </LoaderProvider>
    );
};

export default RootLayout;