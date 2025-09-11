import { useLoader } from '@/context/LoaderContext';
import { auth } from '@/firebase';
import { createPlant, getPlantById, updatePlant, uploadImageAsync } from '@/services/plantService';
import { Plant } from '@/types/plant';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from "expo-image-picker"
import { identifiedPlantData } from '../../../types/tempData';
import * as Notifications from 'expo-notifications';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { DateTriggerInput } from 'expo-notifications';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';


const PlantFormScreen = () => {
    const { id, species: initialSpecies, imageUri: initialImageUri } = useLocalSearchParams<{ id?: string; species?: string; imageUri?: string }>();
    const isNew = !id || id === 'new';
    const [name, setName] = useState("");
    const [species, setSpecies] = useState("");
    const [lastWatered, setLastWatered] = useState("");
    const [lastFertilized, setLastFertilized] = useState("");
    const [careNotes, setCareNotes] = useState("");
    const [imageUri, setImageUri] = useState<string | null>(null);
    const router = useRouter();
    const { showLoader, hideLoader } = useLoader();
    const { language } = useLanguage();
    const { isDarkMode } = useTheme();

    const translations: { [key: string]: { [lang: string]: string } } = {
        "Add New Plant": { "English": "Add New Plant", "Spanish": "Añadir nueva planta", "French": "Ajouter une nouvelle plante", "German": "Neue Pflanze hinzufügen" },
        "Edit Plant": { "English": "Edit Plant", "Spanish": "Editar planta", "French": "Modifier la plante", "German": "Pflanze bearbeiten" },
        "No Image": { "English": "No Image", "Spanish": "Sin imagen", "French": "Pas d'image", "German": "Kein Bild" },
        "Pick Image": { "English": "Pick Image", "Spanish": "Seleccionar imagen", "French": "Choisir une image", "German": "Bild auswählen" },
        "Take Photo": { "English": "Take Photo", "Spanish": "Tomar foto", "French": "Prendre une photo", "German": "Foto aufnehmen" },
        "Plant Name": { "English": "Plant Name", "Spanish": "Nombre de la planta", "French": "Nom de la plante", "German": "Name der Pflanze" },
        "Species": { "English": "Species", "Spanish": "Especie", "French": "Espèce", "German": "Spezies" },
        "Last Watered (YYYY-MM-DD)": { "English": "Last Watered (YYYY-MM-DD)", "Spanish": "Última vez regada (AAAA-MM-DD)", "French": "Dernier arrosage (AAAA-MM-DD)", "German": "Zuletzt gegossen (JJJJ-MM-TT)" },
        "Last Fertilized (YYYY-MM-DD)": { "English": "Last Fertilized (YYYY-MM-DD)", "Spanish": "Última vez fertilizada (AAAA-MM-DD)", "French": "Dernière fertilisation (AAAA-MM-DD)", "German": "Zuletzt gedüngt (JJJJ-MM-TT)" },
        "Care Notes (optional)": { "English": "Care Notes (optional)", "Spanish": "Notas de cuidado (opcional)", "French": "Notes d'entretien (facultatif)", "German": "Pflegenotizen (optional)" },
        "Add Plant": { "English": "Add Plant", "Spanish": "Añadir planta", "French": "Ajouter une plante", "German": "Pflanze hinzufügen" },
        "Update Plant": { "English": "Update Plant", "Spanish": "Actualizar planta", "French": "Mettre à jour la plante", "German": "Pflanze aktualisieren" },
        "Validation": { "English": "Validation", "Spanish": "Validación", "French": "Validation", "German": "Validierung" },
        "Name and Species are required.": { "English": "Name and Species are required.", "Spanish": "El nombre y la especie son obligatorios.", "French": "Le nom et l'espèce sont obligatoires.", "German": "Name und Spezies sind erforderlich." },
        "Invalid Date Format": { "English": "Invalid Date Format", "Spanish": "Formato de fecha no válido", "French": "Format de date non valide", "German": "Ungültiges Datumsformat" },
        "Please use YYYY-MM-DD format for 'Last Watered'.": { "English": "Please use YYYY-MM-DD format for 'Last Watered'.", "Spanish": "Por favor, use el formato AAAA-MM-DD para 'Última vez regada'.", "French": "Veuillez utiliser le format AAAA-MM-DD pour 'Dernier arrosage'.", "German": "Bitte verwenden Sie das Format JJJJ-MM-TT für 'Zuletzt gegossen'." },
        "Please use YYYY-MM-DD format for 'Last Fertilized'.": { "English": "Please use YYYY-MM-DD format for 'Last Fertilized'.", "Spanish": "Por favor, use el formato AAAA-MM-DD para 'Última vez fertilizada'.", "French": "Veuillez utiliser le format AAAA-MM-DD pour 'Dernière fertilisation'.", "German": "Bitte verwenden Sie das Format JJJJ-MM-TT für 'Zuletzt gedüngt'." },
        "Error": { "English": "Error", "Spanish": "Error", "French": "Erreur", "German": "Fehler" },
        "Failed to load plant data.": { "English": "Failed to load plant data.", "Spanish": "No se pudieron cargar los datos de la planta.", "French": "Échec du chargement des données de la plante.", "German": "Fehler beim Laden der Pflanzendaten." },
        "Permission denied": { "English": "Permission denied", "Spanish": "Permiso denegado", "French": "Permission refusée", "German": "Zugriff verweigert" },
        "Sorry, we need camera roll permissions to make this work!": { "English": "Sorry, we need camera roll permissions to make this work!", "Spanish": "Lo sentimos, necesitamos permisos de la cámara para que esto funcione.", "French": "Désolé, nous avons besoin d'accéder à la pellicule pour que cela fonctionne !", "German": "Entschuldigung, wir benötigen Kamerarollen-Berechtigungen, damit dies funktioniert!" },
        "Failed to save plant.": { "English": "Failed to save plant.", "Spanish": "No se pudo guardar la planta.", "French": "Échec de la sauvegarde de la plante.", "German": "Fehler beim Speichern der Pflanze." },
        "Failed to update plant.": { "English": "Failed to update plant.", "Spanish": "No se pudo actualizar la planta.", "French": "Échec de la mise à jour de la plante.", "German": "Fehler beim Aktualisieren der Pflanze." },
        "Confirm Action": { "English": "Confirm Action", "Spanish": "Confirmar acción", "French": "Confirmer l'action", "German": "Aktion bestätigen" },
        "Did you just water your plant?": { "English": "Did you just water your plant?", "Spanish": "¿Acabas de regar tu planta?", "French": "Venez-vous d'arroser votre plante?", "German": "Haben Sie Ihre Pflanze gerade gegossen?" },
        "Did you just fertilize your plant?": { "English": "Did you just fertilize your plant?", "Spanish": "¿Acabas de fertilizar tu planta?", "French": "Venez-vous de fertiliser votre plante?", "German": "Haben Sie Ihre Pflanze gerade gedüngt?" },
        "No": { "English": "No", "Spanish": "No", "French": "Non", "German": "Nein" },
        "Yes": { "English": "Yes", "Spanish": "Sí", "French": "Oui", "German": "Ja" }
    };

    const getTranslatedText = (key: string) => {
        return translations[key]?.[language] || key;
    };


    // --- NEW CODE START ---

    const updatePlantDataFromNotification = async (plantId: string, type: 'watering' | 'fertilizing') => {
        Alert.alert(
            getTranslatedText("Confirm Action"),
            getTranslatedText(type === 'watering' ? "Did you just water your plant?" : "Did you just fertilize your plant?"),
            [
                {
                    text: getTranslatedText("No"),
                    style: "cancel"
                },
                {
                    text: getTranslatedText("Yes"),
                    onPress: async () => {
                        try {
                            const updateData = type === 'watering'
                                ? { lastWatered: new Date() }
                                : { lastFertilized: new Date() };
        
                            await updatePlant(plantId, updateData);
                            console.log(`Plant ${plantId} data updated: ${type} to ${new Date()}`);
                            router.push(`/plants/${plantId}`);
                        } catch (error) {
                            console.error("Failed to update plant from notification:", error);
                        }
                    }
                }
            ]
        );
    };

    useEffect(() => {
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            const { plantId, type } = response.notification.request.content.data;
            
            updatePlantDataFromNotification(plantId as string, type as 'watering' | 'fertilizing');
        });

        return () => {
            subscription.remove();
        };
    }, []);
    
    // --- NEW CODE END ---

    useFocusEffect(
        useCallback(() => {
            if (isNew) {
                if (identifiedPlantData.scientificName) {
                    setSpecies(identifiedPlantData.scientificName);
                    if (identifiedPlantData.commonName && identifiedPlantData.commonName !== 'N/A') {
                        setName(identifiedPlantData.commonName.split(',')[0].trim());
                    } else {
                        setName(identifiedPlantData.scientificName);
                    }
                }
                if (identifiedPlantData.imageUri) {
                    setImageUri(identifiedPlantData.imageUri);
                }
                identifiedPlantData.scientificName = null;
                identifiedPlantData.commonName = null;
                identifiedPlantData.genus = null;
                identifiedPlantData.family = null;
                identifiedPlantData.imageUri = null;
            }
        }, [isNew])
    );

    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(getTranslatedText('Permission denied'), getTranslatedText('Sorry, we need camera roll permissions to make this work!'));
            }
        })();
    }, []);

    useEffect(() => {
        const loadPlantData = async () => {
            if (!isNew && id) {
                try {
                    showLoader();
                    const plant = await getPlantById(id);
                    if (plant) {
                        setName(plant.name);
                        setSpecies(plant.species);
                        if (plant.lastWatered) setLastWatered(plant.lastWatered.toISOString().slice(0, 10));
                        if (plant.lastFertilized) setLastFertilized(plant.lastFertilized.toISOString().slice(0, 10));
                        if (plant.careNotes) setCareNotes(plant.careNotes);
                        if (plant.imageUrl) setImageUri(plant.imageUrl);
                    }
                } catch (error) {
                    console.error("Failed to load plant data:", error);
                    Alert.alert(getTranslatedText("Error"), getTranslatedText("Failed to load plant data."));
                } finally {
                    hideLoader();
                }
            }
        };
        loadPlantData();
    }, [id]);

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleTakePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!name.trim() || !species.trim()) {
            Alert.alert(getTranslatedText("Validation"), getTranslatedText("Name and Species are required."));
            return;
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

        if (lastWatered.trim() !== '' && !dateRegex.test(lastWatered)) {
            Alert.alert(getTranslatedText("Invalid Date Format"), getTranslatedText("Please use YYYY-MM-DD format for 'Last Watered'."));
            return;
        }

        if (lastFertilized.trim() !== '' && !dateRegex.test(lastFertilized)) {
            Alert.alert(getTranslatedText("Invalid Date Format"), getTranslatedText("Please use YYYY-MM-DD format for 'Last Fertilized'."));
            return;
        }

        try {
            showLoader();
            let imageUrl = null;
            if (imageUri) {
                imageUrl = await uploadImageAsync(imageUri);
            }
            const wateredDate = lastWatered.trim() !== '' ? new Date(lastWatered) : new Date();
            const fertilizedDate = lastFertilized.trim() !== '' ? new Date(lastFertilized) : new Date();
            const plantData = {
                name,
                species,
                lastWatered: wateredDate,
                lastFertilized: fertilizedDate,
                careNotes,
                imageUrl
            };

            let currentPlantId: string;
            if (isNew) {
                const docRef = await createPlant(plantData as Omit<Plant, 'id'>);
                currentPlantId = docRef.id;
            } else {
                if (!id) throw new Error("Plant ID not found for update.");
                const userId = auth.currentUser?.uid;
                if (!userId) {
                    throw new Error("User not authenticated.");
                }
                const dataToUpdate = { ...plantData, userId };
                await updatePlant(id, dataToUpdate);
                currentPlantId = id;
            }

            // Request permissions before scheduling notifications
            const { status } = await Notifications.getPermissionsAsync();
            if (status !== 'granted') {
                await Notifications.requestPermissionsAsync();
            }

            // --- Correct way to cancel notifications for a specific plant ---
            const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
            for (const notification of scheduledNotifications) {
                // Check if the notification's data matches the current plantId
                if (notification.content.data && notification.content.data.plantId === currentPlantId) {
                    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
                }
            }

            // Schedule a watering notification
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "🌱 Plant Care Reminder",
                    body: `Time to water your ${name}!`,
                    data: { plantId: currentPlantId, type: 'watering' },
                },
                //@ts-ignore
                trigger: {
                    type: 'date',
                    date: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes from now
                },
            });

            // Schedule a fertilizing notification
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "🌱 Plant Care Reminder",
                    body: `Time to fertilize your ${name}!`,
                    data: { plantId: currentPlantId, type: 'fertilizing' },
                },
                //@ts-ignore
                trigger: {
                    type: 'date',
                    date: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes from now
                },
            });

            console.log("Notifications scheduled successfully.");
            const newScheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
            console.log("Current scheduled notifications:", newScheduledNotifications);

            // Add a loop to show the correct data structure
            newScheduledNotifications.forEach(notification => {
                console.log("Notification ID:", notification.identifier);
                console.log("Notification Data:", notification.content.data); // Correctly access the 'data' field
            });

            router.back();

        } catch (err) {
            console.error(`Error ${isNew ? "saving" : "updating"} plant:`, err);
            Alert.alert(getTranslatedText("Error"), getTranslatedText(isNew ? "Failed to save plant." : "Failed to update plant."));
        } finally {
            hideLoader();
        }
    };

    return (
        <ScrollView className={`flex-1 w-full p-5 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <Text className={`text-3xl font-bold text-center mt-5 mb-4 ${isDarkMode ? 'text-green-500' : 'text-green-700'}`}>
                {isNew ? getTranslatedText("Add New Plant") : getTranslatedText("Edit Plant")}
            </Text>

            <View className="items-center my-4">
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={{ width: 200, height: 200, borderRadius: 12 }} />
                ) : (
                    <View className={`w-52 h-52 rounded-xl items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}>
                        <Text className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{getTranslatedText("No Image")}</Text>
                    </View>
                )}
                <View className="flex-row mt-4">
                    <TouchableOpacity
                        className={`rounded-md px-4 py-2 mr-2 ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'}`}
                        onPress={handlePickImage}
                    >
                        <Text className="text-white font-semibold">{getTranslatedText("Pick Image")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`rounded-md px-4 py-2 ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'}`}
                        onPress={handleTakePhoto}
                    >
                        <Text className="text-white font-semibold">{getTranslatedText("Take Photo")}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TextInput
                placeholder={getTranslatedText("Plant Name")}
                placeholderTextColor={isDarkMode ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)'}
                className={`border p-3 my-2 rounded-md ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-400 text-gray-800'}`}
                value={name}
                onChangeText={setName}
            />
            <TextInput
                placeholder={getTranslatedText("Species")}
                placeholderTextColor={isDarkMode ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)'}
                className={`border p-3 my-2 rounded-md ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-400 text-gray-800'}`}
                value={species}
                onChangeText={setSpecies}
            />
            <TextInput
                placeholder={getTranslatedText("Last Watered (YYYY-MM-DD)")}
                placeholderTextColor={isDarkMode ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)'}
                className={`border p-3 my-2 rounded-md ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-400 text-gray-800'}`}
                value={lastWatered}
                onChangeText={setLastWatered}
            />
            <TextInput
                placeholder={getTranslatedText("Last Fertilized (YYYY-MM-DD)")}
                placeholderTextColor={isDarkMode ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)'}
                className={`border p-3 my-2 rounded-md ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-400 text-gray-800'}`}
                value={lastFertilized}
                onChangeText={setLastFertilized}
            />
            <TextInput
                placeholder={getTranslatedText("Care Notes (optional)")}
                placeholderTextColor={isDarkMode ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)'}
                className={`border p-3 my-2 rounded-md ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-400 text-gray-800'}`}
                value={careNotes}
                onChangeText={setCareNotes}
                multiline
                numberOfLines={4}
            />
            <TouchableOpacity
                className={`rounded-md px-6 py-4 my-4 ${isDarkMode ? 'bg-green-600' : 'bg-green-500'}`}
                onPress={handleSubmit}
            >
                <Text className="text-xl text-white font-bold text-center">
                    {isNew ? getTranslatedText("Add Plant") : getTranslatedText("Update Plant")}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default PlantFormScreen;
