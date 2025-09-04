import { useLoader } from '@/context/LoaderContext';
import { auth } from '@/firebase';
import { createPlant, getPlantById, updatePlant } from '@/services/plantService';
import { Plant } from '@/types/plant';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const PlantFormScreen = () => {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const isNew = !id || id === 'new';
    const [name, setName] = useState("");
    const [species, setSpecies] = useState("");
    const [lastWatered, setLastWatered] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD format
    const [lastFertilized, setLastFertilized] = useState(new Date().toISOString().slice(0, 10));
    const [careNotes, setCareNotes] = useState("");
    const router = useRouter();
    const { showLoader, hideLoader } = useLoader();

    
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

    const handleSubmit = async () => {
        if (!name.trim() || !species.trim()) {
            Alert.alert("Validation", "Name and Species are required.");
            return;
        }

        try {
            showLoader();
            const plantData = {
                name,
                species,
                lastWatered: new Date(lastWatered),
                lastFertilized: new Date(lastFertilized),
                careNotes,
            };

            if (isNew) {
                await createPlant(plantData as Omit<Plant, 'id'>);
            } else {
                // Get the current user's ID
                const userId = auth.currentUser?.uid;
                if (!userId) {
                    throw new Error("User not authenticated.");
                }

                // Include the userId in the data object before updating
                const dataToUpdate = { ...plantData, userId };
                await updatePlant(id, dataToUpdate);
            }
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