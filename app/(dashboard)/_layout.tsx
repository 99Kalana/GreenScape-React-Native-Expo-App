import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import React from 'react';

const tabs = [
    { label: "Home", name: "home", icon: "home" },
    { label: "Plants", name: "plants", icon: "sprout" },
    { label: "Identify", name: "identify/index", icon: "camera-iris" },
    { label: "Profile", name: "profile", icon: "account" },
    { label: "Settings", name: "settings", icon: "cog" }
];

const DashboardLayout = () => {
    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: "#22C55E", // Green for GreenScape
            tabBarInactiveTintColor: "#9CA3AF",
            headerShown: false,
            tabBarStyle: {
                backgroundColor: "#fff",
                borderTopColor: "#E5E7EB"
            }
        }}>
            {tabs.map(({ name, icon, label }) => (
                <Tabs.Screen 
                    key={name}
                    name={name} 
                    options={{
                        title: label,
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name={icon as any} color={color} size={size} />
                        )
                    }}
                />
            ))}
        </Tabs>
    );
};

export default DashboardLayout;