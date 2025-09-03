import { View, Text, Pressable } from "react-native";
import React from "react";
import { useRouter, useSegments } from "expo-router";

// Define your app's navigation tabs and paths
const tabs = [
    { label: "Home", path: "/dashboard/home" },
    { label: "Plants", path: "/dashboard/plants" },
    { label: "Profile", path: "/dashboard/profile" }
];

const FooterNav = () => {
    const router = useRouter();
    const segments = useSegments();
    const activeRoute = segments[segments.length - 1];

    return (
        <View className="flex-row justify-around border-t border-gray-300 py-2 bg-white">
            {tabs.map((data) => (
                <Pressable
                    key={data.label}
                    className={`py-1 px-4 rounded-lg ${data.path.includes(activeRoute) ? "bg-green-600" : ""}`}
                    onPress={() => router.push(data.path as any)}
                >
                    <Text className={`text-2xl ${data.path.includes(activeRoute) ? "text-white" : "text-gray-600"}`}>
                        {data.label}
                    </Text>
                </Pressable>
            ))}
        </View>
    );
};

export default FooterNav;