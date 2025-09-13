import { View, Text, Button, Image, ActivityIndicator, Alert, TouchableOpacity, ScrollView, TextInput, Pressable } from "react-native";
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

    const containerClassName = isDarkMode ? 'bg-gray-900' : 'bg-white';
    const headerTextClassName = isDarkMode ? 'text-green-500' : 'text-green-700';
    const textClassName = isDarkMode ? 'text-gray-300' : 'text-gray-800';
    const cardClassName = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const cardTitleClassName = isDarkMode ? 'text-green-400' : 'text-green-700';
    const cardSubTextClassName = isDarkMode ? 'text-gray-400' : 'text-gray-600';
    const editButtonColor = isDarkMode ? 'bg-yellow-500' : 'bg-yellow-400';
    const deleteButtonColor = isDarkMode ? 'bg-red-600' : 'bg-red-500';
    const waterButtonColor = isDarkMode ? 'bg-blue-600' : 'bg-blue-500';
    const fertilizeButtonColor = isDarkMode ? 'bg-green-600' : 'bg-green-500';
    const searchInputClassName = isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300 bg-white';
    const searchIconColor = isDarkMode ? '#A0AEC0' : '#4A5568';
    const headerIconColor = isDarkMode ? '#34D399' : '#10B981';

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
        <View className={`flex-1 w-full ${containerClassName}`}>
            {/* Title with icon */}
            <View className="flex-row items-center justify-center mt-10 mb-3">
                <MaterialIcons name="local-florist" size={40} color={headerIconColor} />
                <Text className={`text-4xl ml-2 font-bold ${headerTextClassName}`}>
                    {getTranslatedText("My Plants")}
                </Text>
            </View>

            {/* Search Input with icon */}
            <View className={`flex-row items-center border rounded-full mx-4 p-2 ${searchInputClassName}`}>
                <Ionicons name="search-outline" size={20} color={searchIconColor} style={{ marginRight: 8 }} />
                <TextInput
                    placeholder={getTranslatedText("Search by name or species...")}
                    placeholderTextColor={searchIconColor}
                    className={`flex-1 ${textClassName}`}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
            
            {/* Notifications button */}
            <TouchableOpacity
                className="absolute top-16 right-5 z-10 p-2"
                onPress={() => router.push("/(dashboard)/plants/notifications")}
            >
                <Ionicons name="notifications-outline" size={28} color={headerIconColor} />
            </TouchableOpacity>

            <View className="absolute bottom-5 right-5 z-10">
                <Pressable
                    className="bg-green-500 rounded-full p-5 shadow-lg"
                    onPress={() => router.push("/(dashboard)/plants/new")}
                >
                    <Ionicons name="add" size={28} color="#fff" />
                </Pressable>
            </View>

            <ScrollView className="mt-4">
                {filteredPlants.length === 0 ? (
                    <Text className={`text-center text-lg mt-10 ${textClassName}`}>
                        {searchQuery ? getTranslatedText("No matching plants found.") : getTranslatedText("You have no plants yet. Add one!")}
                    </Text>
                ) : (
                    filteredPlants.map((plant) => (
                        <View key={plant.id} className={`p-4 mb-3 rounded-lg mx-4 border shadow-md ${cardClassName}`}>

                            <View className="flex-row items-center">
                                <View className="flex-1">
                                    <Text className={`text-xl font-bold ${cardTitleClassName}`}>{plant.name}</Text>
                                    <Text className={`text-sm mb-2 ${cardSubTextClassName}`}>Species: {plant.species}</Text>
                                    <Text className={`text-sm mb-2 ${cardSubTextClassName}`}>{getTranslatedText("Last Watered")}: {plant.lastWatered?.toLocaleDateString()}</Text>
                                    <Text className={`text-sm mb-2 ${cardSubTextClassName}`}>{getTranslatedText("Last Fertilized")}: {plant.lastFertilized?.toLocaleDateString()}</Text>
                                </View>

                                {plant.imageUrl && (
                                    <Image
                                        source={{ uri: plant.imageUrl }}
                                        style={{
                                            width: 100,
                                            height: 100,
                                            borderRadius: 8,
                                            marginLeft: 16,
                                            resizeMode: "cover",
                                        }}
                                    />
                                )}
                            </View>

                            <View className="flex-row mt-2 items-center">
                                {/* Water Now Button */}
                                <TouchableOpacity
                                    className={`flex-1 px-4 py-2 rounded-md ${waterButtonColor}`}
                                    onPress={() => { if (plant.id) handleUpdate(plant.id, plant.name, "lastWatered"); }}
                                >
                                    <View className="flex-row items-center justify-center">
                                        <MaterialIcons name="water-drop" size={20} color="#fff" />
                                        <Text className="text-white font-semibold ml-2">{getTranslatedText("Water Now")}</Text>
                                    </View>
                                </TouchableOpacity>

                                {/* Fertilize Now Button */}
                                <TouchableOpacity
                                    className={`flex-1 px-4 py-2 rounded-md ml-2 ${fertilizeButtonColor}`}
                                    onPress={() => { if (plant.id) handleUpdate(plant.id, plant.name, "lastFertilized"); }}
                                >
                                    <View className="flex-row items-center justify-center">
                                        <MaterialIcons name="local-florist" size={20} color="#fff" />
                                        <Text className="text-white font-semibold ml-2">{getTranslatedText("Fertilize Now")}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row mt-2">
                                <TouchableOpacity
                                    className={`px-4 py-2 rounded-md ${editButtonColor}`}
                                    onPress={() => router.push(`/(dashboard)/plants/${plant.id}`)}
                                >
                                    <Text className="text-white font-semibold">{getTranslatedText("Edit")}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className={`px-4 py-2 rounded-md ml-3 ${deleteButtonColor}`}
                                    onPress={() => { if (plant.id) handleDelete(plant.id); }}
                                >
                                    <Text className="text-white font-semibold">{getTranslatedText("Delete")}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

export default PlantsScreen;
