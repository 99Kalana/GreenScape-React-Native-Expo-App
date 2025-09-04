import React from 'react';
import { Stack } from 'expo-router';

const PlantsLayout = () => {
    return (
        <Stack screenOptions={{ animation: "slide_from_right" }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="[id]" options={{ title: "Plant Details" }} />
        </Stack>
    );
};

export default PlantsLayout;