import { View, Text, Image, ActivityIndicator, Alert, TouchableOpacity, ScrollView } from "react-native";
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
        "How it Works": { "English": "How it Works", "Spanish": "Cómo Funciona", "French": "Comment ça Marche", "German": "So funktioniert's" },
        "Take or upload a picture of a plant and we'll use our AI to identify it for you.": { "English": "Take or upload a picture of a plant and we'll use our AI to identify it for you.", "Spanish": "Toma o sube una foto de una planta y usaremos nuestra IA para identificarla por ti.", "French": "Prenez ou téléchargez une photo d'une plante et nous utiliserons notre IA pour l'identifier pour vous.", "German": "Machen Sie ein Foto oder laden Sie ein Bild einer Pflanze hoch, und unsere KI wird sie für Sie identifizieren." },
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
    const buttonClassName = `flex-row items-center justify-center py-4 px-6 rounded-full shadow-md`;

    return (
        <ScrollView className={`flex-1 p-5 ${containerClassName}`}>
            <View className="flex-1 items-center">
                <View className="mb-8 items-center mt-10">
                    <Ionicons name="leaf-outline" size={100} color="#22C55E" />
                    <Text className={`text-3xl font-bold mt-2 ${textClassName}`}>
                        {getTranslatedText("Identify Plant")}
                    </Text>
                </View>

                {!imageUri && !loading && (
                    <View className={`w-full max-w-sm mt-5 mb-8 p-6 rounded-2xl shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} items-center`}>
                        <Ionicons name="camera-outline" size={60} color={isDarkMode ? '#A5B4FC' : '#6366F1'} />
                        <Text className={`text-2xl font-bold mt-4 ${isDarkMode ? 'text-white' : 'text-gray-800'} text-center`}>
                            {getTranslatedText("How it Works")}
                        </Text>
                        <Text className={`mt-2 text-md ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-center`}>
                            {getTranslatedText("Take or upload a picture of a plant and we'll use our AI to identify it for you.")}
                        </Text>
                    </View>
                )}

                <View className="w-full max-w-sm px-4">
                    <View className="flex-row w-full justify-between items-center mb-4">
                        <TouchableOpacity
                            className={`${buttonClassName} bg-blue-500 w-[48%]`}
                            onPress={handlePickImage}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="image-outline" size={20} color="white" />
                            <Text className="text-white font-semibold text-base ml-2">
                                {getTranslatedText("Pick from Gallery")}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`${buttonClassName} bg-green-500 w-[48%]`}
                            onPress={handleTakePhoto}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="camera-outline" size={20} color="white" />
                            <Text className="text-white font-semibold text-base ml-2">
                                {getTranslatedText("Take Photo")}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {imageUri && (
                    <View className="items-center mb-5 mt-5">
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
                                    className={`bg-green-500 py-3 px-6 rounded-md shadow-md mt-5 w-full`}
                                    onPress={handleAddPlant}
                                >
                                    <Text className="text-white font-semibold text-lg text-center">
                                        {getTranslatedText("Add to My Plants")}
                                    </Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                className={`bg-red-500 py-3 px-6 rounded-md shadow-md mt-3 w-full`}
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
