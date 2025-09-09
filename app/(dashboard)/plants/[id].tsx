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

    // --- NEW CODE START ---

    const updatePlantDataFromNotification = async (plantId: string, type: 'watering' | 'fertilizing') => {
        Alert.alert(
            "Confirm Action",
            `Did you just ${type === 'watering' ? 'water' : 'fertilize'} your plant?`,
            [
                {
                    text: "No",
                    style: "cancel"
                },
                {
                    text: "Yes",
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
                Alert.alert('Permission denied', 'Sorry, we need camera roll permissions to make this work!');
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
                    Alert.alert("Error", "Failed to load plant data.");
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
            Alert.alert("Validation", "Name and Species are required.");
            return;
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

        if (lastWatered.trim() !== '' && !dateRegex.test(lastWatered)) {
            Alert.alert("Invalid Date Format", "Please use YYYY-MM-DD format for 'Last Watered'.");
            return;
        }

        if (lastFertilized.trim() !== '' && !dateRegex.test(lastFertilized)) {
            Alert.alert("Invalid Date Format", "Please use YYYY-MM-DD format for 'Last Fertilized'.");
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
            Alert.alert("Error", `Failed to ${isNew ? "save" : "update"} plant.`);
        } finally {
            hideLoader();
        }
    };

    return (
        <ScrollView className='flex-1 w-full p-5 bg-gray-100'>
            <Text className="text-3xl font-bold text-center mt-5 mb-4 text-green-700">
                {isNew ? "Add New Plant" : "Edit Plant"}
            </Text>

            <View className="items-center my-4">
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={{ width: 200, height: 200, borderRadius: 12 }} />
                ) : (
                    <View className="w-52 h-52 bg-gray-300 rounded-xl items-center justify-center">
                        <Text className="text-gray-500 text-lg">No Image</Text>
                    </View>
                )}
                <View className="flex-row mt-4">
                    <TouchableOpacity
                        className="bg-blue-500 rounded-md px-4 py-2 mr-2"
                        onPress={handlePickImage}
                    >
                        <Text className="text-white font-semibold">Pick Image</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="bg-blue-500 rounded-md px-4 py-2"
                        onPress={handleTakePhoto}
                    >
                        <Text className="text-white font-semibold">Take Photo</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TextInput
                placeholder="Plant Name"
                className="border border-gray-400 p-3 my-2 rounded-md bg-white"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                placeholder="Species"
                className="border border-gray-400 p-3 my-2 rounded-md bg-white"
                value={species}
                onChangeText={setSpecies}
            />
            <TextInput
                placeholder="Last Watered (YYYY-MM-DD)"
                className="border border-gray-400 p-3 my-2 rounded-md bg-white"
                value={lastWatered}
                onChangeText={setLastWatered}
            />
            <TextInput
                placeholder="Last Fertilized (YYYY-MM-DD)"
                className="border border-gray-400 p-3 my-2 rounded-md bg-white"
                value={lastFertilized}
                onChangeText={setLastFertilized}
            />
            <TextInput
                placeholder="Care Notes (optional)"
                className="border border-gray-400 p-3 my-2 rounded-md bg-white"
                value={careNotes}
                onChangeText={setCareNotes}
                multiline
                numberOfLines={4}
            />
            <TouchableOpacity
                className="bg-green-500 rounded-md px-6 py-4 my-4"
                onPress={handleSubmit}
            >
                <Text className="text-xl text-white font-bold text-center">
                    {isNew ? "Add Plant" : "Update Plant"}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default PlantFormScreen;