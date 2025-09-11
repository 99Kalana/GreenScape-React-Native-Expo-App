import { View, Text, Button, Image, ActivityIndicator, Alert, TouchableOpacity, ScrollView, TextInput, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { onSnapshot, query, where } from 'firebase/firestore';
import { useLoader } from '@/context/LoaderContext';
import { deletePlant, plantsRef } from '@/services/plantService';
import { Plant } from '@/types/plant';
import { auth } from '@/firebase';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';

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
        "Edit": { "English": "Edit", "Spanish": "Editar", "French": "Modifier", "German": "Bearbeiten" },
        "Delete": { "English": "Delete", "Spanish": "Eliminar", "French": "Supprimer", "German": "Löschen" },
        "Delete Plant": { "English": "Delete Plant", "Spanish": "Eliminar planta", "French": "Supprimer la plante", "German": "Pflanze löschen" },
        "Are you sure you want to delete this plant?": { "English": "Are you sure you want to delete this plant?", "Spanish": "¿Estás seguro de que quieres eliminar esta planta?", "French": "Voulez-vous vraiment supprimer cette plante ?", "German": "Möchten Sie diese Pflanze wirklich löschen?" },
        "Cancel": { "English": "Cancel", "Spanish": "Cancelar", "French": "Annuler", "German": "Abbrechen" },
        "Error": { "English": "Error", "Spanish": "Error", "French": "Erreur", "German": "Fehler" },
        "Failed to delete plant.": { "English": "Failed to delete plant.", "Spanish": "No se pudo eliminar la planta.", "French": "Échec de la suppression de la plante.", "German": "Fehler beim Löschen der Pflanze." },
    };

    const getTranslatedText = (key: string) => {
        return translations[key]?.[language] || key;
    };

    const containerClassName = isDarkMode ? 'bg-gray-900' : 'bg-white';
    const headerTextClassName = isDarkMode ? 'text-green-500' : 'text-green-700';
    const textClassName = isDarkMode ? 'text-gray-300' : 'text-gray-800';
    const searchInputClassName = isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-400 bg-white';
    const cardClassName = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const cardTitleClassName = isDarkMode ? 'text-green-400' : 'text-green-700';
    const cardSubTextClassName = isDarkMode ? 'text-gray-400' : 'text-gray-600';
    const editButtonColor = isDarkMode ? 'bg-yellow-500' : 'bg-yellow-400';
    const deleteButtonColor = isDarkMode ? 'bg-red-600' : 'bg-red-500';


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

    // New: Filter the plants array based on the search query
    const filteredPlants = plants.filter(plant =>
        plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plant.species.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        Alert.alert(getTranslatedText("Delete Plant"), getTranslatedText("Are you sure you want to delete this plant?"), [
            { text: getTranslatedText("Cancel") },
            {
                text: getTranslatedText("Delete"),
                onPress: async () => {
                    try {
                        showLoader();
                        await deletePlant(id);
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

    return (
        <View className={`flex-1 w-full ${containerClassName}`}>
            <Text className={`text-4xl text-center mt-5 mb-3 font-bold ${headerTextClassName}`}>
                {getTranslatedText("My Plants")}
            </Text>

            {/* New: Search Input */}
            <TextInput
                placeholder={getTranslatedText("Search by name or species...")}
                placeholderTextColor={isDarkMode ? '#A0AEC0' : '#4A5568'}
                className={`border p-3 my-2 rounded-md mx-4 ${searchInputClassName}`}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

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

                            {/* The main flexbox container */}
                            <View className="flex-row items-center">
                                {/* Container for the text details (now on the left) */}
                                <View className="flex-1">
                                    <Text className={`text-xl font-bold ${cardTitleClassName}`}>{plant.name}</Text>
                                    <Text className={`text-sm mb-2 ${cardSubTextClassName}`}>Species: {plant.species}</Text>
                                    <Text className={`text-sm mb-2 ${cardSubTextClassName}`}>{getTranslatedText("Last Watered")}: {plant.lastWatered?.toLocaleDateString()}</Text>
                                    <Text className={`text-sm mb-2 ${cardSubTextClassName}`}>{getTranslatedText("Last Fertilized")}: {plant.lastFertilized?.toLocaleDateString()}</Text>
                                </View>

                                {/* The image (now on the right) */}
                                {plant.imageUrl && (
                                    <Image
                                        source={{ uri: plant.imageUrl }}
                                        style={{
                                            width: 100, // Fixed width for a smaller thumbnail
                                            height: 100, // Fixed height
                                            borderRadius: 8,
                                            marginLeft: 16, // Add space to the left of the image
                                            resizeMode: "cover",
                                        }}
                                    />
                                )}
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
