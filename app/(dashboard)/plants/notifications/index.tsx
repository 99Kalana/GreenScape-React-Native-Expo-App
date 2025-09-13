import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../../../../context/ThemeContext';
import { useLanguage } from '../../../../context/LanguageContext';

const NotificationsScreen = () => {
    const [scheduledNotifications, setScheduledNotifications] = useState<Notifications.NotificationRequest[]>([]);
    const { isDarkMode } = useTheme();
    const { language } = useLanguage();

    const translations: { [key: string]: { [lang: string]: string } } = {
        "Notifications": { "English": "Notifications", "Spanish": "Notificaciones", "French": "Notifications", "German": "Benachrichtigungen" },
        "No scheduled notifications.": { "English": "No scheduled notifications.", "Spanish": "No hay notificaciones programadas.", "French": "Aucune notification programmée.", "German": "Keine geplanten Benachrichtigungen." },
        "Error fetching notifications.": { "English": "Error fetching notifications.", "Spanish": "Error al obtener las notificaciones.", "French": "Erreur lors de la récupération des notifications.", "German": "Fehler beim Abrufen der Benachrichtigung." },
        "Failed to cancel notification.": { "English": "Failed to cancel notification.", "Spanish": "No se pudo cancelar la notificación.", "French": "Échec de l'annulation de la notification.", "German": "Fehler beim Abbrechen der Benachrichtigung." },
        "Cancel All": { "English": "Cancel All", "Spanish": "Cancelar todo", "French": "Annuler tout", "German": "Alle abbrechen" },
        "Are you sure you want to cancel all notifications?": { "English": "Are you sure you want to cancel all notifications?", "Spanish": "¿Estás seguro de que quieres cancelar todas las notificaciones?", "French": "Voulez-vous vraiment annuler toutes les notifications ?", "German": "Möchten Sie wirklich alle Benachrichtigungen abbrechen?" },
        "Cancel": { "English": "Cancel", "Spanish": "Cancelar", "French": "Annuler", "German": "Abbrechen" },
        "Scheduled for": { "English": "Scheduled for", "Spanish": "Programada para", "French": "Prévue pour", "German": "Geplant für" },
    };

    const getTranslatedText = (key: string) => {
        return translations[key]?.[language] || key;
    };

    const containerClassName = isDarkMode ? 'bg-gray-900' : 'bg-white';
    const textClassName = isDarkMode ? 'text-gray-300' : 'text-gray-800';
    const cardClassName = isDarkMode ? 'bg-gray-800' : 'bg-gray-100';

    const fetchNotifications = async () => {
        try {
            const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
            setScheduledNotifications(allNotifications);
        } catch (error) {
            console.error("Error fetching scheduled notifications:", error);
            Alert.alert(getTranslatedText("Error fetching notifications."));
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleCancelAll = async () => {
        Alert.alert(
            getTranslatedText("Cancel All"),
            getTranslatedText("Are you sure you want to cancel all notifications?"),
            [
                { text: getTranslatedText("Cancel"), style: 'cancel' },
                {
                    text: getTranslatedText("Cancel All"),
                    onPress: async () => {
                        try {
                            await Notifications.cancelAllScheduledNotificationsAsync();
                            setScheduledNotifications([]);
                            console.log('All notifications cancelled.');
                        } catch (error) {
                            console.error("Error cancelling all notifications:", error);
                            Alert.alert(getTranslatedText("Failed to cancel notification."));
                        }
                    },
                },
            ]
        );
    };

    return (
        <View className={`flex-1 ${containerClassName}`}>
            <ScrollView className="flex-1 px-4">
                {scheduledNotifications.length > 0 && (
                    <View className="flex-row items-center justify-end p-4">
                        <TouchableOpacity onPress={handleCancelAll} className="p-2 rounded-full">
                            <Text className="text-red-500 font-semibold">{getTranslatedText("Cancel All")}</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {scheduledNotifications.length === 0 ? (
                    <Text className={`text-center text-lg mt-10 ${textClassName}`}>
                        {getTranslatedText("No scheduled notifications.")}
                    </Text>
                ) : (
                    scheduledNotifications.map((notification) => {
                        const trigger: any = notification.trigger;
                        const date = (trigger.type === 'date' && trigger.date) ? new Date(trigger.date) : null;
                        const dateString = date ? date.toLocaleString() : "N/A";

                        return (
                            <View key={notification.identifier} className={`p-4 mb-3 rounded-lg border border-gray-200 ${cardClassName}`}>
                                <Text className={`text-lg font-bold ${textClassName}`}>{notification.content.title}</Text>
                                <Text className={`text-md mt-1 ${textClassName}`}>{notification.content.body}</Text>
                                <Text className={`text-xs mt-1 italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {getTranslatedText("Scheduled for")}: {dateString}
                                </Text>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
};

export default NotificationsScreen;
