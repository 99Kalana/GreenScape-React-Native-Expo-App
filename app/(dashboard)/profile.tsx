import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
    const auth = getAuth();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Handle password change functionality with old password verification
    const handleChangePassword = async () => {
        setError('');
        setSuccess('');

        // Basic validation
        if (!oldPassword || !newPassword || !confirmPassword) {
            setError('All password fields are required.');
            return;
        }

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }

        setIsLoading(true);
        try {
            if (auth.currentUser && auth.currentUser.email) {
                // Re-authenticate the user with their old password
                const credential = EmailAuthProvider.credential(auth.currentUser.email, oldPassword);
                await reauthenticateWithCredential(auth.currentUser, credential);

                // If re-authentication is successful, update the password
                await updatePassword(auth.currentUser, newPassword);
                setSuccess('Password updated successfully!');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                Alert.alert("Success", "Your password has been changed successfully.");
            } else {
                // Handle cases where user is not signed in or has no email
                setError("Cannot change password for this account type. Please try again.");
                router.replace('/(auth)/login');
            }
        } catch (err: any) {
            // Handle Firebase-specific errors
            if (err.code === 'auth/wrong-password') {
                setError('Incorrect old password. Please try again.');
            } else {
                setError("Failed to update password. Please try again.");
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white p-6">
            <View className="flex-1 justify-start items-center w-full mt-10">
                <View className="mb-8 items-center">
                    <Ionicons name="person-circle-outline" size={100} color="#22C55E" />
                    <Text className="text-3xl font-bold text-gray-800 mt-2">Profile</Text>
                    {auth.currentUser && (
                        <Text className="text-gray-600 mt-1">{auth.currentUser.email}</Text>
                    )}
                </View>

                {/* Password Change Form */}
                <View className="w-full max-w-sm bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
                    <Text className="text-lg font-bold text-gray-800 mb-4">Change Password</Text>
                    <TextInput
                        className="w-full bg-white p-3 rounded-md border border-gray-300 mb-3 text-gray-700 focus:border-green-500"
                        placeholder="Current Password"
                        secureTextEntry
                        value={oldPassword}
                        onChangeText={setOldPassword}
                    />
                    <TextInput
                        className="w-full bg-white p-3 rounded-md border border-gray-300 mb-3 text-gray-700 focus:border-green-500"
                        placeholder="New Password"
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />
                    <TextInput
                        className="w-full bg-white p-3 rounded-md border border-gray-300 mb-4 text-gray-700 focus:border-green-500"
                        placeholder="Confirm New Password"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                    
                    {error ? (
                        <Text className="text-red-500 text-sm mb-2">{error}</Text>
                    ) : null}
                    
                    {success ? (
                        <Text className="text-green-500 text-sm mb-2">{success}</Text>
                    ) : null}

                    <TouchableOpacity
                        className={`w-full py-3 rounded-lg flex items-center justify-center ${isLoading ? 'bg-green-300' : 'bg-green-500'}`}
                        onPress={handleChangePassword}
                        disabled={isLoading}
                    >
                        <Text className="text-white font-bold text-base">
                            {isLoading ? 'Updating...' : 'Change Password'}
                        </Text>
                    </TouchableOpacity>
                </View>

            </View>
        </SafeAreaView>
    );
};

export default Profile;
