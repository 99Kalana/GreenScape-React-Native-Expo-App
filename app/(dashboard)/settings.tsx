import { View, Text } from 'react-native';
import React from 'react';

const Settings = () => {
    return (
        <View className="flex-1 justify-center items-center bg-gray-100">
            <Text className="text-2xl font-bold">Settings Screen</Text>
            <Text className="text-gray-600 mt-2">Manage your app settings here.</Text>
        </View>
    );
};

export default Settings;