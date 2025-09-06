import { useLoader } from '@/context/LoaderContext';
import { deletePlant, plantsRef } from '@/services/plantService';
import { Plant } from '@/types/plant';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { auth } from '@/firebase';

const PlantsScreen = () => {
    const [plants, setPlants] = useState<Plant[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const { showLoader, hideLoader } = useLoader();

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
                Alert.alert("Error", "Failed to fetch plants in real-time.");
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
        Alert.alert("Delete Plant", "Are you sure you want to delete this plant?", [
            { text: "Cancel" },
            {
                text: "Delete",
                onPress: async () => {
                    try {
                        showLoader();
                        await deletePlant(id);
                    } catch (err) {
                        console.error("Error deleting plant:", err);
                        Alert.alert("Error", "Failed to delete plant.");
                    } finally {
                        hideLoader();
                    }
                },
            },
        ]);
    };

    return (
        <View className='flex-1 w-full'>
            <Text className='text-4xl text-center mt-5 mb-3 font-bold'>My Plants</Text>

            {/* New: Search Input */}
            <TextInput
                placeholder="Search by name or species..."
                className="border border-gray-400 p-3 my-2 rounded-md mx-4 bg-white"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            
            <View className="absolute bottom-5 right-5 z-10">
                <Pressable
                    className="bg-green-500 rounded-full p-5 shadow-lg"
                    onPress={() => router.push("/(dashboard)/plants/new")}
                >
                    <MaterialIcons name="add" size={28} color="#fff" />
                </Pressable>
            </View>

            <ScrollView className="mt-4">
                {filteredPlants.length === 0 ? (
                    <Text className="text-center text-lg mt-10">
                        {searchQuery ? "No matching plants found." : "You have no plants yet. Add one!"}
                    </Text>
                ) : (
                    filteredPlants.map((plant) => (
                        <View key={plant.id} className="bg-white p-4 mb-3 rounded-lg mx-4 border border-gray-200 shadow-md">

                            {/* The main flexbox container */}
                            <View className="flex-row items-center">
                            {/* Container for the text details (now on the left) */}
                            <View className="flex-1">
                                <Text className="text-xl font-bold text-green-700">{plant.name}</Text>
                                <Text className="text-sm text-gray-600 mb-2">Species: {plant.species}</Text>
                                <Text className="text-sm text-gray-600 mb-2">Last Watered: {plant.lastWatered?.toLocaleDateString()}</Text>
                                <Text className="text-sm text-gray-600 mb-2">Last Fertilized: {plant.lastFertilized?.toLocaleDateString()}</Text>
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
                                    className="bg-yellow-400 px-4 py-2 rounded-md"
                                    onPress={() => router.push(`/(dashboard)/plants/${plant.id}`)}
                                >
                                    <Text className="text-white font-semibold">Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className='bg-red-500 px-4 py-2 rounded-md ml-3'
                                    onPress={() => { if (plant.id) handleDelete(plant.id); }}
                                >
                                    <Text className="text-white font-semibold">Delete</Text>
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