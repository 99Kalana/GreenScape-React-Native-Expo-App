import { View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const Profile = () => {
    const { language } = useLanguage();
    const { isDarkMode } = useTheme();
    const auth = getAuth();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const translations: { [key: string]: { [lang: string]: string } } = {
        "Profile": { "English": "Profile", "Spanish": "Perfil", "French": "Profil", "German": "Profil" },
        "Change Password": { "English": "Change Password", "Spanish": "Cambiar contraseña", "French": "Changer le mot de passe", "German": "Passwort ändern" },
        "Current Password": { "English": "Current Password", "Spanish": "Contraseña actual", "French": "Mot de passe actuel", "German": "Aktuelles Passwort" },
        "New Password": { "English": "New Password", "Spanish": "Nueva contraseña", "French": "Nouveau mot de passe", "German": "Neues Passwort" },
        "Confirm New Password": { "English": "Confirm New Password", "Spanish": "Confirmar nueva contraseña", "French": "Confirmer le nouveau mot de passe", "German": "Neues Passwort bestätigen" },
        "Updating...": { "English": "Updating...", "Spanish": "Actualizando...", "French": "Mise à jour...", "German": "Aktualisieren..." },
        "All password fields are required.": { "English": "All password fields are required.", "Spanish": "Todos los campos de contraseña son obligatorios.", "French": "Tous les champs de mot de passe sont obligatoires.", "German": "Alle Passwortfelder sind erforderlich." },
        "New password must be at least 6 characters long.": { "English": "New password must be at least 6 characters long.", "Spanish": "La nueva contraseña debe tener al menos 6 caracteres.", "French": "Le nouveau mot de passe doit contenir au moins 6 caractères.", "German": "Das neue Passwort muss mindestens 6 Zeichen lang sein." },
        "New passwords do not match.": { "English": "New passwords do not match.", "Spanish": "Las nuevas contraseñas no coinciden.", "French": "Les nouveaux mots de passe ne correspondent pas.", "German": "Die neuen Passwörter stimmen nicht überein." },
        "Success": { "English": "Success", "Spanish": "Éxito", "French": "Succès", "German": "Erfolg" },
        "Password updated successfully!": { "English": "Password updated successfully!", "Spanish": "¡Contraseña actualizada con éxito!", "French": "Mot de passe mis à jour avec succès !", "German": "Passwort erfolgreich aktualisiert!" },
        "Failed to update password. Please try again.": { "English": "Failed to update password. Please try again.", "Spanish": "No se pudo actualizar la contraseña. Por favor, inténtelo de nuevo.", "French": "Échec de la mise à jour du mot de passe. Veuillez réessayer.", "German": "Passwort konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut." },
        "Incorrect old password. Please try again.": { "English": "Incorrect old password. Please try again.", "Spanish": "Contraseña anterior incorrecta. Por favor, inténtelo de nuevo.", "French": "Ancien mot de passe incorrect. Veuillez réessayer.", "German": "Altes Passwort ist falsch. Bitte versuchen Sie es erneut." },
        "Cannot change password for this account type. Please try again.": { "English": "Cannot change password for this account type. Please try again.", "Spanish": "No se puede cambiar la contraseña para este tipo de cuenta. Por favor, inténtelo de nuevo.", "French": "Impossible de changer le mot de passe pour ce type de compte. Veuillez réessayer.", "German": "Passwort kann für diesen Kontotyp nicht geändert werden. Bitte versuchen Sie es erneut." },
        "Update your password": { "English": "Update your password", "Spanish": "Actualiza tu contraseña", "French": "Mettez à jour votre mot de passe", "German": "Passwort aktualisieren" },
        "Keep your account secure by regularly updating your password.": { "English": "Keep your account secure by regularly updating your password.", "Spanish": "Mantén tu cuenta segura actualizando tu contraseña regularmente.", "French": "Gardez votre compte sécurisé en mettant à jour régulièrement votre mot de passe.", "German": "Halten Sie Ihr Konto sicher, indem Sie Ihr Passwort regelmäßig aktualisieren." },
        "Confirm Password Change": { "English": "Confirm Password Change", "Spanish": "Confirmar cambio de contraseña", "French": "Confirmer le changement de mot de passe", "German": "Passwortänderung bestätigen" },
        "Are you sure you want to change your password? This action is irreversible.": { "English": "Are you sure you want to change your password? This action is irreversible.", "Spanish": "¿Estás seguro de que quieres cambiar tu contraseña? Esta acción es irreversible.", "French": "Êtes-vous sûr de vouloir changer votre mot de passe ? Cette action est irréversible.", "German": "Sind Sie sicher, dass Sie Ihr Passwort ändern möchten? Diese Aktion ist irreversibel." },
        "Cancel": { "English": "Cancel", "Spanish": "Cancelar", "French": "Annuler", "German": "Abbrechen" }
    };

    const getTranslatedText = (key: string) => {
        return translations[key]?.[language] || key;
    };

    const handleInitialChangePassword = () => {
        // Basic validation before showing the modal
        if (!oldPassword || !newPassword || !confirmPassword) {
            setError(getTranslatedText('All password fields are required.'));
            return;
        }
        if (newPassword.length < 6) {
            setError(getTranslatedText('New password must be at least 6 characters long.'));
            return;
        }
        if (newPassword !== confirmPassword) {
            setError(getTranslatedText('New passwords do not match.'));
            return;
        }

        setError(''); // Clear previous errors
        setModalVisible(true);
    };

    const handleConfirmChangePassword = async () => {
        setModalVisible(false); // Hide the modal
        setIsLoading(true);
        try {
            if (auth.currentUser && auth.currentUser.email) {
                const credential = EmailAuthProvider.credential(auth.currentUser.email, oldPassword);
                await reauthenticateWithCredential(auth.currentUser, credential);
                await updatePassword(auth.currentUser, newPassword);
                setSuccess(getTranslatedText('Password updated successfully!'));
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setError(getTranslatedText("Cannot change password for this account type. Please try again."));
                router.replace('/(auth)/login');
            }
        } catch (err: any) {
            if (err.code === 'auth/wrong-password') {
                setError(getTranslatedText('Incorrect old password. Please try again.'));
            } else {
                setError(getTranslatedText("Failed to update password. Please try again."));
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const containerClassName = isDarkMode ? 'bg-gray-900' : 'bg-white';
    const cardClassName = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';
    const textClassName = isDarkMode ? 'text-gray-300' : 'text-gray-800';
    const inputClassName = isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-700';
    const placeholderColor = isDarkMode ? '#a1a1aa' : '#9ca3af';

    return (
        <KeyboardAvoidingView
            className={`flex-1 ${containerClassName}`}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
        >
            <SafeAreaView className={`flex-1 p-6 ${containerClassName}`}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start', alignItems: 'center' }}>
                    <View className="flex-1 justify-start items-center w-full mt-10">
                        <View className="mb-8 items-center">
                            <Ionicons name="person-circle-outline" size={100} color="#22C55E" />
                            <Text className={`text-3xl font-bold ${textClassName} mt-2`}>{getTranslatedText("Profile")}</Text>
                            {auth.currentUser && (
                                <Text className={`text-gray-600 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>{auth.currentUser.email}</Text>
                            )}
                        </View>

                        {/* Password Change Form */}
                        <View className={`w-full max-w-sm p-6 rounded-lg shadow-md border ${cardClassName}`}>
                            <Text className={`text-lg font-bold ${textClassName} mb-4`}>{getTranslatedText("Change Password")}</Text>

                            {/* Old Password Input with eye icon */}
                            <View className="relative w-full mb-3">
                                <TextInput
                                    className={`w-full p-3 pr-10 rounded-md border focus:border-green-500 ${inputClassName}`}
                                    placeholder={getTranslatedText("Current Password")}
                                    secureTextEntry={!showOldPassword}
                                    value={oldPassword}
                                    onChangeText={setOldPassword}
                                    placeholderTextColor={placeholderColor}
                                />
                                <TouchableOpacity
                                    className="absolute right-3 top-3"
                                    onPress={() => setShowOldPassword(!showOldPassword)}
                                >
                                    <Ionicons name={showOldPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={isDarkMode ? '#a1a1aa' : '#9ca3af'} />
                                </TouchableOpacity>
                            </View>

                            {/* New Password Input with eye icon */}
                            <View className="relative w-full mb-3">
                                <TextInput
                                    className={`w-full p-3 pr-10 rounded-md border focus:border-green-500 ${inputClassName}`}
                                    placeholder={getTranslatedText("New Password")}
                                    secureTextEntry={!showNewPassword}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholderTextColor={placeholderColor}
                                />
                                <TouchableOpacity
                                    className="absolute right-3 top-3"
                                    onPress={() => setShowNewPassword(!showNewPassword)}
                                >
                                    <Ionicons name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={isDarkMode ? '#a1a1aa' : '#9ca3af'} />
                                </TouchableOpacity>
                            </View>

                            {/* Confirm Password Input with eye icon */}
                            <View className="relative w-full mb-4">
                                <TextInput
                                    className={`w-full p-3 pr-10 rounded-md border focus:border-green-500 ${inputClassName}`}
                                    placeholder={getTranslatedText("Confirm New Password")}
                                    secureTextEntry={!showConfirmPassword}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholderTextColor={placeholderColor}
                                />
                                <TouchableOpacity
                                    className="absolute right-3 top-3"
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={isDarkMode ? '#a1a1aa' : '#9ca3af'} />
                                </TouchableOpacity>
                            </View>

                            {error ? (
                                <Text className="text-red-500 text-sm mb-2">{error}</Text>
                            ) : null}

                            {success ? (
                                <Text className="text-green-500 text-sm mb-2">{success}</Text>
                            ) : null}

                            <TouchableOpacity
                                className={`w-full py-3 rounded-lg flex items-center justify-center ${isLoading ? 'bg-green-300' : 'bg-green-500'}`}
                                onPress={handleInitialChangePassword}
                                disabled={isLoading}
                            >
                                <Text className="text-white font-bold text-base">
                                    {isLoading ? getTranslatedText('Updating...') : getTranslatedText('Change Password')}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Information Card */}
                        <View className={`w-full max-w-sm mt-6 p-6 rounded-lg shadow-md border flex-row items-center ${cardClassName}`}>
                            <Ionicons name="shield-checkmark-outline" size={30} color="#22C55E" />
                            <View className="ml-4 flex-1">
                                <Text className={`text-lg font-bold ${textClassName}`}>{getTranslatedText("Update your password")}</Text>
                                <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>{getTranslatedText("Keep your account secure by regularly updating your password.")}</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
            
            {/* Confirmation Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                    <View className={`w-11/12 max-w-sm p-6 rounded-lg shadow-lg ${cardClassName}`}>
                        <Text className={`text-lg font-bold ${textClassName} mb-4 text-center`}>{getTranslatedText("Confirm Password Change")}</Text>
                        <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-center mb-6`}>
                            {getTranslatedText("Are you sure you want to change your password? This action is irreversible.")}
                        </Text>
                        <View className="flex-row justify-center">
                            <TouchableOpacity
                                className="flex-1 py-3 px-6 rounded-lg bg-red-500 mr-2 flex items-center justify-center"
                                onPress={() => setModalVisible(false)}
                            >
                                <Text className="text-white font-bold">{getTranslatedText("Cancel")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 py-3 px-6 rounded-lg bg-green-500 ml-2 flex items-center justify-center"
                                onPress={handleConfirmChangePassword}
                            >
                                <Text className="text-white font-bold">{getTranslatedText("Change Password")}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

export default Profile;
