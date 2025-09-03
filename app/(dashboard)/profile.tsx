import { View, Text } from 'react-native';
import React from 'react';

const Profile = () => {
    return (
        <View className="flex-1 justify-center items-center bg-gray-100">
            <Text className="text-2xl font-bold">Profile Screen</Text>
            <Text className="text-gray-600 mt-2">Your user details will go here.</Text>
        </View>
    );
};

export default Profile;