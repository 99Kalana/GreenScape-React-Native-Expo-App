import { View, Text, Button, Image, ActivityIndicator, Alert, TouchableOpacity, ScrollView } from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { identifyPlant } from "../../../services/plantIdentificationService";
import { useRouter } from "expo-router";
import { identifiedPlantData } from '../../../types/tempData';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import { Ionicons } from "@expo/vector-icons";

const IdentifyScreen = () => {
    const router = useRouter();
    const { language } = useLanguage();
    const { isDarkMode } = useTheme();

    const [imageUri, setImageUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [identificationResult, setIdentificationResult] = useState<{
        scientificName: string,
        commonName: string,
        genus: string,
        family: string,
        image: string
    } | null>(null);

    const translations: { [key: string]: { [lang: string]: string } } = {
        "Identify Plant": { "English": "Identify Plant", "Spanish": "Identificar planta", "French": "Identifier une plante", "German": "Pflanze identifizieren" },
        "Pick from Gallery": { "English": "Pick from Gallery", "Spanish": "Seleccionar de la galería", "French": "Choisir dans la galerie", "German": "Aus Galerie auswählen" },
        "Take Photo": { "English": "Take Photo", "Spanish": "Tomar foto", "French": "Prendre une photo", "German": "Foto aufnehmen" },
        "Identification Result": { "English": "Identification Result", "Spanish": "Resultado de la identificación", "French": "Résultat de l'identification", "German": "Identifikationsergebnis" },
        "No species found.": { "English": "No species found.", "Spanish": "No se encontraron especies.", "French": "Aucune espèce trouvée.", "German": "Keine Art gefunden." },
        "Error during identification.": { "English": "Error during identification.", "Spanish": "Error durante la identificación.", "French": "Erreur lors de l'identification.", "German": "Fehler bei der Identifizierung." },
        "Add to My Plants": { "English": "Add to My Plants", "Spanish": "Añadir a mis plantas", "French": "Ajouter à mes plantes", "German": "Zu meinen Pflanzen hinzufügen" },
        "Error": { "English": "Error", "Spanish": "Error", "French": "Erreur", "German": "Fehler" },
        "Failed to identify plant. Please try again.": { "English": "Failed to identify plant. Please try again.", "Spanish": "No se pudo identificar la planta. Por favor, inténtelo de nuevo.", "French": "Échec de l'identification de la plante. Veuillez réessayer.", "German": "Fehler bei der Pflanzenidentifizierung. Bitte versuchen Sie es erneut." },
        "Reset": { "English": "Reset", "Spanish": "Reiniciar", "French": "Réinitialiser", "German": "Zurücksetzen" },
        "Common Name": { "English": "Common Name", "Spanish": "Nombre común", "French": "Nom commun", "German": "Gewöhnlicher Name" },
        "Genus": { "English": "Genus", "Spanish": "Género", "French": "Genre", "German": "Gattung" },
        "Family": { "English": "Family", "Spanish": "Familia", "French": "Famille", "German": "Familie" },
    };

    const getTranslatedText = (key: string) => {
        return translations[key]?.[language] || key;
    };

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });
        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            runIdentification(result.assets[0].uri);
        }
    };

    const handleTakePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });
        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            runIdentification(result.assets[0].uri);
        }
    };

    const runIdentification = async (uri: string) => {
        setLoading(true);
        setIdentificationResult(null);
        try {
            const result = await identifyPlant(uri);
            if (result) {
                setIdentificationResult(result);
            } else {
                setIdentificationResult({
                    scientificName: getTranslatedText("No species found."),
                    commonName: "",
                    genus: "",
                    family: "",
                    image: ""
                });
            }
        } catch (error) {
            Alert.alert(getTranslatedText("Error"), getTranslatedText("Failed to identify plant. Please try again."));
            console.error(error);
            setIdentificationResult({
                scientificName: getTranslatedText("Error during identification."),
                commonName: "",
                genus: "",
                family: "",
                image: ""
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddPlant = () => {
        if (identificationResult && identificationResult.scientificName && identificationResult.scientificName !== getTranslatedText("No species found.") && identificationResult.scientificName !== getTranslatedText("Error during identification.")) {
            identifiedPlantData.scientificName = identificationResult.scientificName;
            identifiedPlantData.commonName = identificationResult.commonName;
            identifiedPlantData.genus = identificationResult.genus;
            identifiedPlantData.family = identificationResult.family;
            identifiedPlantData.imageUri = imageUri; // Use the image from local state

            router.push("../plants/new");
        }
    };

    const handleReset = () => {
        setImageUri(null);
        setIdentificationResult(null);
        setLoading(false);
    };

    const containerClassName = isDarkMode ? 'bg-gray-900' : 'bg-white';
    const textClassName = isDarkMode ? 'text-gray-300' : 'text-gray-800';
    const resultCardClassName = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';
    const buttonClassName = `flex-row items-center justify-center py-3 px-6 rounded-md shadow-md mb-2`;
    const commonButtonStyles = 'w-full py-3 rounded-lg flex items-center justify-center font-bold text-base';
    const primaryButtonColor = isDarkMode ? 'bg-green-600' : 'bg-green-500';
    const secondaryButtonColor = isDarkMode ? 'bg-blue-600' : 'bg-blue-500';

    return (
        <ScrollView className={`flex-1 p-5 ${containerClassName}`}>
            <View className="flex-1 items-center">
                <View className="mb-8 items-center mt-10">
                    <Ionicons name="leaf-outline" size={100} color="#22C55E" />
                    <Text className={`text-3xl font-bold mt-2 ${textClassName}`}>
                        {getTranslatedText("Identify Plant")}
                    </Text>
                </View>

                <View className="w-full max-w-sm mb-5 px-4">
                    <View className="flex-row w-full justify-between items-center mb-4">
                        <TouchableOpacity
                            className={`${buttonClassName} ${secondaryButtonColor} w-[48%]`}
                            onPress={handlePickImage}
                        >
                            <Ionicons name="image-outline" size={20} color="white" />
                            <Text className="text-white font-semibold text-lg ml-2">
                                {getTranslatedText("Pick from Gallery")}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`${buttonClassName} ${secondaryButtonColor} w-[48%]`}
                            onPress={handleTakePhoto}
                        >
                            <Ionicons name="camera-outline" size={20} color="white" />
                            <Text className="text-white font-semibold text-lg ml-2">
                                {getTranslatedText("Take Photo")}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {imageUri && (
                    <View className="items-center mb-5">
                        <Image
                            source={{ uri: imageUri }}
                            className="w-64 h-64 rounded-xl shadow-lg border border-gray-300"
                        />
                    </View>
                )}

                {loading ? (
                    <ActivityIndicator size="large" color="#22C55E" className="mt-5" />
                ) : (
                    identificationResult && (
                        <View className={`p-5 rounded-lg shadow-md w-full max-w-sm mt-5 border ${resultCardClassName}`}>
                            <Text className={`text-lg font-bold text-center mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                {getTranslatedText("Identification Result")}
                            </Text>
                            
                            <Text className={`text-2xl font-bold text-green-500 text-center mb-2`}>
                                {identificationResult.scientificName}
                            </Text>
                            
                            {identificationResult.commonName && (
                                <Text className={`text-lg text-center mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {getTranslatedText("Common Name")}: {identificationResult.commonName}
                                </Text>
                            )}
                            {identificationResult.genus && (
                                <Text className={`text-md text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {getTranslatedText("Genus")}: {identificationResult.genus}
                                </Text>
                            )}
                            {identificationResult.family && (
                                <Text className={`text-md text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {getTranslatedText("Family")}: {identificationResult.family}
                                </Text>
                            )}

                            {identificationResult.scientificName !== getTranslatedText("No species found.") && identificationResult.scientificName !== getTranslatedText("Error during identification.") && (
                                <TouchableOpacity
                                    className={`bg-green-500 py-3 px-6 rounded-md shadow-md mt-5`}
                                    onPress={handleAddPlant}
                                >
                                    <Text className="text-white font-semibold text-lg text-center">
                                        {getTranslatedText("Add to My Plants")}
                                    </Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                className={`bg-red-500 py-3 px-6 rounded-md shadow-md mt-3`}
                                onPress={handleReset}
                            >
                                <Text className="text-white font-semibold text-lg text-center">
                                    {getTranslatedText("Reset")}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )
                )}
            </View>
        </ScrollView>
    );
};

export default IdentifyScreen;
