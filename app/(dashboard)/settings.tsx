import { View, Text, TouchableOpacity, Alert, Switch, ScrollView, Modal, TextInput } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { getAuth, signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCameraPermissions, useMediaLibraryPermissions } from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';


const SettingItem = ({ icon, label, children, isDarkMode }: { icon: any, label: string, children: React.ReactNode, isDarkMode: boolean }) => (
    <View className={`flex-row items-center justify-between py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <View className="flex-row items-center">
            <Ionicons name={icon} size={24} color={isDarkMode ? '#bbb' : '#555'} />
            <Text className={`ml-4 text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{label}</Text>
        </View>
        {children}
    </View>
);


const PasswordPromptModal = ({ isVisible, onClose, onConfirm, isDarkMode, getTranslatedText }: { isVisible: boolean, onClose: () => void, onConfirm: (password: string) => void, isDarkMode: boolean, getTranslatedText: (key: string) => string }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleConfirm = () => {
        onConfirm(password);
        setPassword('');
    };

    const handleClose = () => {
        setPassword('');
        onClose();
    };

    const inputClassName = `flex-1 h-12 p-3 rounded-lg border mr-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-800'}`;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={handleClose}
        >
            <View className="flex-1 justify-center items-center p-5 bg-black bg-opacity-50">
                <View className={`w-full max-w-sm p-6 rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <Text className={`text-xl font-bold mb-4 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{getTranslatedText("Confirm Deletion")}</Text>
                    <Text className={`text-base mb-4 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{getTranslatedText("Please enter your password to confirm account deletion.")}</Text>
                    <View className="flex-row items-center mb-4">
                        <TextInput
                            className={inputClassName}
                            secureTextEntry={!showPassword}
                            placeholder={getTranslatedText("Password")}
                            placeholderTextColor={isDarkMode ? '#bbb' : '#888'}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color={isDarkMode ? '#bbb' : '#555'} />
                        </TouchableOpacity>
                    </View>
                    <View className="flex-row justify-between mt-4">
                        <TouchableOpacity
                            className="flex-1 py-3 rounded-lg flex items-center justify-center bg-gray-500 mr-2"
                            onPress={handleClose}
                        >
                            <Text className="text-white font-bold">{getTranslatedText("Cancel")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-1 py-3 rounded-lg flex items-center justify-center bg-red-700 ml-2"
                            onPress={handleConfirm}
                        >
                            <Text className="text-white font-bold">{getTranslatedText("Delete")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};


const Settings = () => {
    const auth = getAuth();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const { language, changeLanguage, availableLanguages } = useLanguage();
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

    
    const translations: { [key: string]: { [lang: string]: string } } = {
        "Settings": { "English": "Settings", "Spanish": "Ajustes", "French": "Paramètres", "German": "Einstellungen" },
        "Account": { "English": "Account", "Spanish": "Cuenta", "French": "Compte", "German": "Konto" },
        "Logout": { "English": "Logout", "Spanish": "Cerrar sesión", "French": "Déconnexion", "German": "Abmelden" },
        "Delete Account": { "English": "Delete Account", "Spanish": "Eliminar cuenta", "French": "Supprimer le compte", "German": "Konto löschen" },
        "General": { "English": "General", "Spanish": "General", "French": "Général", "German": "Allgemein" },
        "Dark Mode": { "English": "Dark Mode", "Spanish": "Modo oscuro", "French": "Mode sombre", "German": "Dunkelmodus" },
        "Language": { "English": "Language", "Spanish": "Idioma", "French": "Langue", "German": "Sprache" },
        "App Permissions": { "English": "App Permissions", "Spanish": "Permisos de la app", "French": "Autorizaciones de la aplicación", "German": "App-Berechtigungen" },
        "Notifications": { "English": "Notifications", "Spanish": "Notificaciones", "French": "Notifications", "German": "Benachrichtigungen" },
        "Camera": { "English": "Camera", "Spanish": "Cámara", "French": "Caméra", "German": "Kamera" },
        "Gallery": { "English": "Gallery", "Spanish": "Galería", "French": "Galerie", "German": "Galerie" },
        "Granted": { "English": "Granted", "Spanish": "Concedido", "French": "Autorizado", "German": "Gewährt" },
        "Denied": { "English": "Denied", "Spanish": "Denegado", "French": "Rechazado", "German": "Abgelehnt" },
        "checking...": { "English": "checking...", "Spanish": "comprobando...", "French": "verificando...", "German": "prüfen..." },
        "Permission Required": { "English": "Permission Required", "Spanish": "Permiso requerido", "French": "Autorización requerida", "German": "Erforderliche Berechtigung" },
        "Please enable": { "English": "Please enable", "Spanish": "Por favor, habilite", "French": "Veuillez activer", "German": "Bitte aktivieren Sie" },
        "in your device settings to use this feature.": { "English": "in your device settings to use this feature.", "Spanish": "en la configuración de su dispositivo para usar esta función.", "French": "dans les paramètres de votre appareil para utilizar esta funcionalidad.", "German": "in den Geräteeinstellungen, um diese Funktion zu nutzen." },
        "Open Settings": { "English": "Open Settings", "Spanish": "Abrir ajustes", "French": "Ouvrir les paramètres", "German": "Einstellungen öffnen" },
        "Logout Failed": { "English": "Logout Failed", "Spanish": "Fallo al cerrar sesión", "French": "Échec de la déconnexion", "German": "Abmeldung fehlgeschlagen" },
        "There was a problem logging you out. Please try again.": { "English": "There was a problem logging you out. Please try again.", "Spanish": "Hubo un problema al cerrar su sesión. Por favor, inténtelo de nuevo.", "French": "Il y a eu un problème lors de la déconnexion. Veuillez réessayer.", "German": "Es gab ein Problem beim Abmelden. Bitte versuchen Sie es erneut." },
        "Account Deletion Failed": { "English": "Account Deletion Failed", "Spanish": "Error al eliminar la cuenta", "French": "Échec de la suppression du compte", "German": "Konto löschen fehlgeschlagen" },
        "There was a problem deleting your account. Please try again.": { "English": "There was a problem deleting your account. Please try again.", "Spanish": "Hubo un problema al eliminar su cuenta. Por favor, inténtelo de nuevo.", "French": "Il y a eu un problème lors de la suppression de votre compte. Veuillez réessayer.", "German": "Es gab ein Problem beim Löschen Ihres Kontos. Bitte versuchen Sie es erneut." },
        "Confirm Deletion": { "English": "Confirm Deletion", "Spanish": "Confirmar eliminación", "French": "Confirmer la suppression", "German": "Löschung bestätigen" },
        "This action is irreversible and will permanently delete your account and all associated data. Are you sure?": { "English": "This action is irreversible and will permanently delete your account and all associated data. Are you sure?", "Spanish": "Esta acción es irreversible y eliminará permanentemente su cuenta y todos los datos asociados. ¿Está seguro?", "French": "Cette action est irréversible et supprimera définitivement votre compte et toutes les données associées. Êtes-vous sûr ?", "German": "Diese Aktion ist irreversibel und löscht Ihr Konto und alle zugehörigen Daten endgültig. Sind Sie sicher?" },
        "Please enter your password to confirm account deletion.": { "English": "Please enter your password to confirm account deletion.", "Spanish": "Por favor, introduzca su contraseña para confirmar la eliminación de la cuenta.", "French": "Veuillez entrer votre mot de passe pour confirmer la suppression du compte.", "German": "Bitte geben Sie Ihr Passwort ein, um die Kontolöschung zu bestätigen." },
        "Password": { "English": "Password", "Spanish": "Contraseña", "French": "Mot de passe", "German": "Passwort" },
        "Incorrect Password": { "English": "Incorrect Password", "Spanish": "Contraseña incorrecta", "French": "Mot de passe incorrect", "German": "Falsches Passwort" },
        "The password you entered is incorrect. Please try again.": { "English": "The password you entered is incorrect. Please try again.", "Spanish": "La contraseña que introdujo es incorrecta. Por favor, inténtelo de nuevo.", "French": "Le mot de passe que vous avez saisi es incorrecto. Veuillez réessayer.", "German": "Das eingegebene Passwort ist falsch. Bitte versuchen Sie es erneut." },
        "Cancel": { "English": "Cancel", "Spanish": "Cancelar", "French": "Annuler", "German": "Abbrechen" },
        "Delete": { "English": "Delete", "Spanish": "Eliminar", "French": "Supprimer", "German": "Löschen" },
        "Unsupported Login": { "English": "Unsupported Login", "Spanish": "Inicio de sesión no compatible", "French": "Connexion non prise en charge", "German": "Nicht unterstützte Anmeldung" },
        "This feature is only available for accounts created with email and password. Please delete your account through your original provider.": { "English": "This feature is only available for accounts created with email and password. Please delete your account through your original provider.", "Spanish": "Esta función solo está disponible para cuentas creadas con correo electrónico y contraseña. Por favor, elimine su cuenta a través de su proveedor original.", "French": "Cette fonctionnalité est uniquement disponible pour les comptes créés avec un e-mail et un mot de passe. Veuillez supprimer votre compte via votre fournisseur d'origine.", "German": "Diese Funktion ist nur für Konten verfügbar, die mit E-Mail und Passwort erstellt wurden. Bitte löschen Sie Ihr Konto über Ihren ursprünglichen Anbieter." }
    };

    const getTranslatedText = (key: string) => {
        return translations[key]?.[language] || key;
    };

    
    const [notificationStatus, setNotificationStatus] = useState(getTranslatedText('checking...'));

    
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [galleryPermission, requestMediaLibraryPermissions] = useMediaLibraryPermissions();

    
    const checkNotificationStatus = useCallback(async () => {
        const { status } = await Notifications.getPermissionsAsync();
        setNotificationStatus(getTranslatedText(status === 'granted' ? 'Granted' : 'Denied'));
    }, [getTranslatedText]);

    
    useEffect(() => {
        checkNotificationStatus();
    }, [language, checkNotificationStatus]); 

    const requestPermission = async (type: 'camera' | 'gallery' | 'notifications') => {
        let permission;
        switch (type) {
            case 'camera':
                permission = await requestCameraPermission();
                break;
            case 'gallery':
                permission = await requestMediaLibraryPermissions();
                break;
            case 'notifications':
                const { status } = await Notifications.requestPermissionsAsync();
                
                checkNotificationStatus();
                if (status === 'granted') return;
                break;
        }

        if (permission?.status !== 'granted') {
            Alert.alert(
                getTranslatedText("Permission Required"),
                `${getTranslatedText("Please enable")} ${getTranslatedText(type)} ${getTranslatedText("in your device settings to use this feature.")}`,
                [
                    { text: getTranslatedText("Open Settings"), onPress: () => Linking.openSettings() }
                ]
            );
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.replace('/(auth)/login');
        } catch (error) {
            console.error("Logout failed:", error);
            Alert.alert(getTranslatedText("Logout Failed"), getTranslatedText("There was a problem logging you out. Please try again."));
        }
    };

    const confirmAndDeleteAccount = async (password: string | undefined) => {
        setShowPasswordPrompt(false);
        const user = auth.currentUser;
        if (!user || !user.email) {
            console.log("User or user email is null in confirmAndDeleteAccount.");
            Alert.alert(getTranslatedText("Error"), getTranslatedText("Could not find user details. Please try logging in again."));
            return;
        }

        if (!password) {
            console.log("Password is empty.");
            Alert.alert(getTranslatedText("Error"), "Password cannot be empty.");
            return;
        }

        try {
            const credential = EmailAuthProvider.credential(user.email!, password);
            await reauthenticateWithCredential(user, credential);
            await deleteUser(user);
            router.replace('/(auth)/login');
        } catch (error: any) {
            console.error("Account deletion failed:", error);
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                Alert.alert(getTranslatedText("Incorrect Password"), getTranslatedText("The password you entered is incorrect. Please try again."));
            } else {
                Alert.alert(getTranslatedText("Account Deletion Failed"), getTranslatedText("There was a problem deleting your account. Please try again."));
            }
        }
    };

    const handleDeleteAccount = () => {
        console.log("Delete Account button pressed.");
        const user = auth.currentUser;
        if (!user) {
            console.log("auth.currentUser is null. Exiting handleDeleteAccount.");
            Alert.alert(getTranslatedText("Error"), getTranslatedText("Could not find user details. Please try logging in again."));
            return;
        }

        
        const isEmailPasswordUser = user.providerData.some(provider => provider.providerId === 'password');
        console.log("User is an email/password user:", isEmailPasswordUser);

        if (!isEmailPasswordUser) {
            console.log("Exiting handleDeleteAccount. User is not an email/password user.");
            Alert.alert(getTranslatedText("Unsupported Login"), getTranslatedText("This feature is only available for accounts created with email and password. Please delete your account through your original provider."));
            return;
        }
        setShowPasswordPrompt(true);
    };

    const containerClassName = isDarkMode ? 'bg-gray-900' : 'bg-white';
    const cardClassName = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';
    const textClassName = isDarkMode ? 'text-gray-300' : 'text-gray-800';
    const subTextClassName = isDarkMode ? 'text-gray-400' : 'text-gray-600';

    const getPermissionStatus = (permission: { status: string } | null | undefined) => {
        if (!permission) return getTranslatedText('checking...');
        return getTranslatedText(permission.status === 'granted' ? 'Granted' : 'Denied');
    };

    return (
        <SafeAreaView className={`flex-1 p-6 ${containerClassName}`}>
            <ScrollView className="flex-1">
                <View className="flex-1 justify-start items-center w-full mt-10">
                    <View className="mb-8 items-center">
                        <Ionicons name="settings-outline" size={100} color={isDarkMode ? '#22C55E' : '#22C55E'} />
                        <Text className={`text-3xl font-bold mt-2 ${textClassName}`}>{getTranslatedText("Settings")}</Text>
                    </View>

                    {/* General Section */}
                    <View className={`w-full max-w-sm p-6 rounded-lg shadow-md border ${cardClassName} mb-6`}>
                        <Text className={`text-lg font-bold mb-2 ${textClassName}`}>{getTranslatedText("General")}</Text>

                        {/* Dark Mode */}
                        <View className={`flex-row items-center justify-between py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <View className="flex-row items-center">
                                <Ionicons name="moon-outline" size={24} color={isDarkMode ? '#bbb' : '#555'} />
                                <Text className={`ml-4 text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{getTranslatedText("Dark Mode")}</Text>
                            </View>
                            <Switch
                                trackColor={{ false: "#ccc", true: "#81b0ff" }}
                                thumbColor={isDarkMode ? "#f4f3f4" : "#f4f3f4"}
                                onValueChange={toggleDarkMode}
                                value={isDarkMode}
                            />
                        </View>

                        {/* Language Preference */}
                        <SettingItem icon="language-outline" label={getTranslatedText("Language")} isDarkMode={isDarkMode}>
                            <View className="flex-col items-end">
                                {availableLanguages.map(lang => (
                                    <TouchableOpacity
                                        key={lang}
                                        onPress={() => changeLanguage(lang)}
                                        className="py-1"
                                    >
                                        <Text className={`text-base ${language === lang ? 'font-bold text-green-500' : subTextClassName}`}>{lang}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </SettingItem>
                    </View>

                    {/* Permissions Section */}
                    <View className={`w-full max-w-sm p-6 rounded-lg shadow-md border ${cardClassName} mb-6`}>
                        <Text className={`text-lg font-bold mb-2 ${textClassName}`}>{getTranslatedText("App Permissions")}</Text>

                        {/* Notifications */}
                        <TouchableOpacity onPress={() => requestPermission('notifications')}>
                            <SettingItem icon="notifications-outline" label={getTranslatedText("Notifications")} isDarkMode={isDarkMode}>
                                <Text className={`text-sm ${notificationStatus === getTranslatedText('Granted') ? 'text-green-500' : 'text-red-500'}`}>{notificationStatus}</Text>
                            </SettingItem>
                        </TouchableOpacity>

                        {/* Camera */}
                        <TouchableOpacity onPress={() => requestPermission('camera')}>
                            <SettingItem icon="camera-outline" label={getTranslatedText("Camera")} isDarkMode={isDarkMode}>
                                <Text className={`text-sm ${getPermissionStatus(cameraPermission) === getTranslatedText('Granted') ? 'text-green-500' : 'text-red-500'}`}>{getPermissionStatus(cameraPermission)}</Text>
                            </SettingItem>
                        </TouchableOpacity>

                        {/* Gallery */}
                        <TouchableOpacity onPress={() => requestPermission('gallery')}>
                            <SettingItem icon="image-outline" label={getTranslatedText("Gallery")} isDarkMode={isDarkMode}>
                                <Text className={`text-sm ${getPermissionStatus(galleryPermission) === getTranslatedText('Granted') ? 'text-green-500' : 'text-red-500'}`}>{getPermissionStatus(galleryPermission)}</Text>
                            </SettingItem>
                        </TouchableOpacity>
                    </View>

                    {/* Account Section */}
                    <View className={`w-full max-w-sm p-6 rounded-lg shadow-md border ${cardClassName}`}>
                        <Text className={`text-lg font-bold mb-4 ${textClassName}`}>{getTranslatedText("Account")}</Text>
                        <TouchableOpacity
                            className="w-full py-3 rounded-lg flex items-center justify-center bg-red-500 shadow-md mb-2"
                            onPress={handleLogout}
                        >
                            <Text className="text-white font-bold text-base">{getTranslatedText("Logout")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="w-full py-3 rounded-lg flex items-center justify-center bg-red-700 shadow-md"
                            onPress={handleDeleteAccount}
                        >
                            <Text className="text-white font-bold text-base">{getTranslatedText("Delete Account")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            <PasswordPromptModal
                isVisible={showPasswordPrompt}
                onClose={() => setShowPasswordPrompt(false)}
                onConfirm={confirmAndDeleteAccount}
                isDarkMode={isDarkMode}
                getTranslatedText={getTranslatedText}
            />
        </SafeAreaView>
    );
};

export default Settings;
