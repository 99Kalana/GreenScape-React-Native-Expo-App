import { View, Text, StyleSheet, Image, ActivityIndicator, Alert, TouchableOpacity, ScrollView, TextInput, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';
import { useLoader } from '@/context/LoaderContext';
import { deletePlant, plantsRef } from '@/services/plantService';
import { Plant } from '@/types/plant';
import { auth } from '@/firebase';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import * as Notifications from 'expo-notifications';
import { DateTriggerInput } from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';

const PlantsScreen = () => {
    const [plants, setPlants] = useState<Plant[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const { showLoader, hideLoader } = useLoader();
    const { language } = useLanguage();
    const { isDarkMode } = useTheme();

    const translations: { [key: string]: { [lang: string]: string } } = {
        "My Plants": { "English": "My Plants", "Spanish": "Mis plantas", "French": "Mes plantes", "German": "Meine Pflanzen" },
        "Search by name or species...": { "English": "Search by name or species...", "Spanish": "Buscar por nombre o especie...", "French": "Rechercher par nom ou espèce...", "German": "Nach Name oder Art suchen..." },
        "No matching plants found.": { "English": "No matching plants found.", "Spanish": "No se encontraron plantas coincidentes.", "French": "Aucune plante correspondante trouvée.", "German": "Keine passenden Pflanzen gefunden." },
        "You have no plants yet. Add one!": { "English": "You have no plants yet. Add one!", "Spanish": "Aún no tienes plantas. ¡Añade una!", "French": "Vous n'avez pas encore de plantes. Ajoutez-en une !", "German": "Sie haben noch keine Pflanzen. Fügen Sie eine hinzu!" },
        "Last Watered": { "English": "Last Watered", "Spanish": "Último riego", "French": "Dernier arrosage", "German": "Zuletzt gegossen" },
        "Last Fertilized": { "English": "Last Fertilized", "Spanish": "Última fertilización", "French": "Dernière fertilisation", "German": "Zuletzt gedüngt" },
        "Water Now": { "English": "Water Now", "Spanish": "Regar ahora", "French": "Arroser maintenant", "German": "Jetzt gießen" },
        "Fertilize Now": { "English": "Fertilize Now", "Spanish": "Fertilizar ahora", "French": "Fertiliser maintenant", "German": "Jetzt düngen" },
        "Edit": { "English": "Edit", "Spanish": "Editar", "French": "Modifier", "German": "Bearbeiten" },
        "Delete": { "English": "Delete", "Spanish": "Eliminar", "French": "Supprimer", "German": "Löschen" },
        "Delete Plant": { "English": "Delete Plant", "Spanish": "Eliminar planta", "French": "Supprimer la plante", "German": "Pflanze löschen" },
        "Are you sure you want to delete this plant?": { "English": "Are you sure you want to delete this plant?", "Spanish": "¿Estás seguro de que quieres eliminar esta planta?", "French": "Voulez-vous vraiment supprimer cette plante ?", "German": "Möchten Sie diese Pflanze wirklich löschen?" },
        "Cancel": { "English": "Cancel", "Spanish": "Cancelar", "French": "Annuler", "German": "Abbrechen" },
        "Error": { "English": "Error", "Spanish": "Error", "French": "Erreur", "German": "Fehler" },
        "Failed to delete plant.": { "English": "Failed to delete plant.", "Spanish": "No se pudo eliminar la planta.", "French": "Échec de la suppression de la plante.", "German": "Fehler beim Löschen der Pflanze." },
        "Failed to update plant.": { "English": "Failed to update plant.", "Spanish": "No se pudo actualizar la planta.", "French": "Échec de la mise à jour de la planta.", "German": "Fehler beim Aktualisieren der Pflanze." },
        "Watered!": { "English": "Watered!", "Spanish": "¡Regado!", "French": "Arrosé !", "German": "Gegossen!" },
        "Fertilized!": { "English": "Fertilized!", "Spanish": "¡Fertilizado!", "French": "Fertilisé !", "German": "Gedüngt!" },
        "Plant deleted successfully.": { "English": "Plant deleted successfully.", "Spanish": "Planta eliminada con éxito.", "French": "Plante supprimée avec succès.", "German": "Pflanze erfolgreich gelöscht." },
        "Notifications": { "English": "Notifications", "Spanish": "Notificaciones", "French": "Notifications", "German": "Benachrichtigungen" },
    };

    const getTranslatedText = (key: string) => {
        return translations[key]?.[language] || key;
    };

    useEffect(() => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
            console.log("No user is logged in.");
            hideLoader();
            return;
        }

        const q = query(plantsRef, where("userId", "==", userId));
        showLoader();

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const allPlants = snapshot.docs.map(
                    (d) => {
                        const data = d.data();
                        return {
                            id: d.id,
                            ...data,
                            // Convert Firestore Timestamps to JavaScript Date objects
                            lastWatered: data.lastWatered?.toDate(),
                            lastFertilized: data.lastFertilized?.toDate(),
                        } as Plant;
                    }
                );
                setPlants(allPlants);
                hideLoader();
            },
            (err) => {
                console.error("Error listening to plants:", err);
                Alert.alert(getTranslatedText("Error"), getTranslatedText("Failed to fetch plants in real-time."));
                hideLoader();
            }
        );

        return () => unsubscribe();
    }, []);

    const filteredPlants = plants.filter(plant =>
        plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plant.species.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // This function schedules the new notification
    const scheduleNotificationForPlant = async (plantId: string, plantName: string, type: 'watering' | 'fertilizing') => {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
            await Notifications.requestPermissionsAsync();
        }

        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
        for (const notification of scheduledNotifications) {
            if (notification.content.data && notification.content.data.plantId === plantId) {
                await Notifications.cancelScheduledNotificationAsync(notification.identifier);
            }
        }

        const body = type === 'watering' ? `Time to water your ${plantName}!` : `Time to fertilize your ${plantName}!`;

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "🌱 Plant Care Reminder",
                body,
                data: { plantId, type },
            },
            //@ts-ignore
            trigger: {
                type: 'date',
                date: new Date(Date.now() + 2 * 60 * 1000), // Schedules for 2 minutes from now
            },
        });
        console.log(`Notification scheduled for plant ${plantName} (${type}).`);

        console.log("Notifications scheduled successfully.");
        const newScheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
        console.log("Current scheduled notifications:", newScheduledNotifications);

        newScheduledNotifications.forEach(notification => {
            console.log("Notification ID:", notification.identifier);
            console.log("Notification Data:", notification.content.data);
        });

    };

    const handleDelete = async (id: string) => {
        Alert.alert(getTranslatedText("Delete Plant"), getTranslatedText("Are you sure you want to delete this plant?"), [
            { text: getTranslatedText("Cancel") },
            {
                text: getTranslatedText("Delete"),
                onPress: async () => {
                    try {
                        showLoader();
                        await deletePlant(id);
                        // Also cancel any scheduled notifications for this plant
                        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
                        for (const notification of scheduledNotifications) {
                            if (notification.content.data && notification.content.data.plantId === id) {
                                await Notifications.cancelScheduledNotificationAsync(notification.identifier);
                            }
                        }
                    } catch (err) {
                        console.error("Error deleting plant:", err);
                        Alert.alert(getTranslatedText("Error"), getTranslatedText("Failed to delete plant."));
                    } finally {
                        hideLoader();
                    }
                },
            },
        ]);
    };

    const handleUpdate = async (plantId: string, plantName: string, field: "lastWatered" | "lastFertilized") => {
        if (!plantId) {
            console.error("Plant ID is missing.");
            return;
        }

        try {
            showLoader();
            const plantDocRef = doc(plantsRef, plantId);
            await updateDoc(plantDocRef, {
                [field]: new Date(),
            });
            // Schedule a new notification after a successful update
            await scheduleNotificationForPlant(plantId, plantName, field === "lastWatered" ? 'watering' : 'fertilizing');

        } catch (err) {
            console.error(`Error updating ${field}:`, err);
            Alert.alert(getTranslatedText("Error"), getTranslatedText("Failed to update plant."));
        } finally {
            hideLoader();
        }
    };


    return (
        <View style={[styles.container, isDarkMode ? styles.darkBackground : styles.lightBackground]}>
            {/* Header */}
            <LinearGradient
                colors={isDarkMode ? ['#16a34a', '#10b981'] : ['#4ade80', '#16a34a']}
                style={styles.headerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.notificationButton}
                        onPress={() => router.push("/(dashboard)/plants/notifications")}
                    >
                        <Ionicons name="notifications-outline" size={28} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <MaterialIcons name="local-florist" size={40} color="#fff" />
                        <Text style={styles.headerText}>{getTranslatedText("My Plants")}</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Search Input */}
            <View style={[styles.searchInputContainer, isDarkMode ? styles.darkSearchInput : styles.lightSearchInput]}>
                <Ionicons name="search-outline" size={20} color={isDarkMode ? '#A0AEC0' : '#4A5568'} />
                <TextInput
                    placeholder={getTranslatedText("Search by name or species...")}
                    placeholderTextColor={isDarkMode ? '#A0AEC0' : '#4A5568'}
                    style={[styles.searchInput, isDarkMode ? styles.darkSearchInputText : styles.lightSearchInputText]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Main Content */}
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {filteredPlants.length === 0 ? (
                    <Text style={[styles.noPlantsText, isDarkMode ? styles.darkText : styles.lightText]}>
                        {searchQuery ? getTranslatedText("No matching plants found.") : getTranslatedText("You have no plants yet. Add one!")}
                    </Text>
                ) : (
                    filteredPlants.map((plant) => (
                        <View key={plant.id} style={[styles.plantCard, isDarkMode ? styles.darkCard : styles.lightCard]}>
                            {plant.imageUrl && (
                                <View style={styles.imageContainer}>
                                    <Image
                                        source={{ uri: plant.imageUrl }}
                                        style={styles.plantImage}
                                        resizeMode="cover"
                                    />
                                </View>
                            )}
                            <View style={styles.plantDetails}>
                                <Text style={[styles.plantName, isDarkMode ? styles.darkCardTitle : styles.lightCardTitle]}>{plant.name}</Text>
                                <Text style={[styles.plantSpecies, isDarkMode ? styles.darkCardSubText : styles.lightCardSubText]}>Species: {plant.species}</Text>
                                <Text style={[styles.plantDate, isDarkMode ? styles.darkCardSubText : styles.lightCardSubText]}>{getTranslatedText("Last Watered")}: {plant.lastWatered?.toLocaleDateString()}</Text>
                                <Text style={[styles.plantDate, isDarkMode ? styles.darkCardSubText : styles.lightCardSubText]}>{getTranslatedText("Last Fertilized")}: {plant.lastFertilized?.toLocaleDateString()}</Text>
                            </View>
                            <View style={styles.buttonGroup}>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.waterButton]}
                                    onPress={() => { if (plant.id) handleUpdate(plant.id, plant.name, "lastWatered"); }}
                                >
                                    <MaterialIcons name="water-drop" size={20} color="#fff" />
                                    <Text style={styles.buttonText}>{getTranslatedText("Water Now")}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.fertilizeButton]}
                                    onPress={() => { if (plant.id) handleUpdate(plant.id, plant.name, "lastFertilized"); }}
                                >
                                    <MaterialIcons name="local-florist" size={20} color="#fff" />
                                    <Text style={styles.buttonText}>{getTranslatedText("Fertilize Now")}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.cardActions}>
                                <TouchableOpacity
                                    style={[styles.editButton, isDarkMode ? styles.darkEditButton : styles.lightEditButton]}
                                    onPress={() => router.push(`/(dashboard)/plants/${plant.id}`)}
                                >
                                    <Text style={styles.actionText}>{getTranslatedText("Edit")}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.deleteButton, isDarkMode ? styles.darkDeleteButton : styles.lightDeleteButton]}
                                    onPress={() => { if (plant.id) handleDelete(plant.id); }}
                                >
                                    <Text style={styles.actionText}>{getTranslatedText("Delete")}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Add Plant FAB */}
            <Pressable
                style={styles.fab}
                onPress={() => router.push("/(dashboard)/plants/new")}
            >
                <Ionicons name="add" size={28} color="#fff" />
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    lightBackground: {
        backgroundColor: '#f3f4f6',
    },
    darkBackground: {
        backgroundColor: '#1f2937',
    },
    headerGradient: {
        width: '100%',
        paddingVertical: 40,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        top: 20,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 32,
        fontWeight: 'bold',
        marginLeft: 10,
        color: '#fff',
    },
    notificationButton: {
        position: 'absolute',
        right: 10,
        padding: 5,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 25,
        marginHorizontal: 20,
        paddingVertical: 10,
        paddingHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
        marginBottom: 20,
    },
    lightSearchInput: {
        backgroundColor: '#fff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
    },
    darkSearchInput: {
        backgroundColor: '#374151',
        borderColor: '#4b5563',
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
    },
    lightSearchInputText: {
        color: '#1f2937',
    },
    darkSearchInputText: {
        color: '#d1d5db',
    },
    scrollViewContent: {
        paddingBottom: 100,
        paddingHorizontal: 20,
    },
    plantCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    lightCard: {
        backgroundColor: '#fff',
    },
    darkCard: {
        backgroundColor: '#374151',
    },
    imageContainer: {
        width: '100%',
        height: 150,
        borderRadius: 10,
        marginBottom: 15,
        overflow: 'hidden',
    },
    plantImage: {
        width: '100%',
        height: '100%',
    },
    plantDetails: {
        marginBottom: 15,
    },
    plantName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    lightCardTitle: {
        color: '#16a34a',
    },
    darkCardTitle: {
        color: '#6ee7b7',
    },
    plantSpecies: {
        fontSize: 16,
        fontStyle: 'italic',
        marginBottom: 5,
    },
    plantDate: {
        fontSize: 14,
        marginBottom: 3,
    },
    lightCardSubText: {
        color: '#4b5563',
    },
    darkCardSubText: {
        color: '#9ca3af',
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        borderRadius: 10,
        paddingVertical: 12,
        marginHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    waterButton: {
        backgroundColor: '#3b82f6',
    },
    fertilizeButton: {
        backgroundColor: '#10b981',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    editButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginRight: 10,
    },
    lightEditButton: {
        backgroundColor: '#f59e0b',
    },
    darkEditButton: {
        backgroundColor: '#d97706',
    },
    deleteButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
    },
    lightDeleteButton: {
        backgroundColor: '#ef4444',
    },
    darkDeleteButton: {
        backgroundColor: '#dc2626',
    },
    actionText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    noPlantsText: {
        textAlign: 'center',
        fontSize: 18,
        marginTop: 40,
    },
    lightText: {
        color: '#4b5563',
    },
    darkText: {
        color: '#d1d5db',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#10b981',
        borderRadius: 35,
        width: 70,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
});

export default PlantsScreen;
