import { View, Text, Button, Image, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { identifyPlant } from "../../../services/plantIdentificationService";
import { useRouter } from "expo-router";
import { identifiedPlantData } from '../../../types/tempData';

const IdentifyScreen = () => {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [identificationResult, setIdentificationResult] = useState<{
    scientificName: string,
    commonName: string,
    genus: string,
    family: string,
    image: string
  } | null>(null);

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
          scientificName: "No species found.",
          commonName: "",
          genus: "",
          family: "",
          image: ""
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to identify plant. Please try again.");
      console.error(error);
      setIdentificationResult({
        scientificName: "Error during identification.",
        commonName: "",
        genus: "",
        family: "",
        image: ""
      });
    } finally {
      setLoading(false);
    }
  };

  // const handleAddPlant = () => {
  //   if (identificationResult && identificationResult.name && identificationResult.name !== "No species found.") {
  //     router.push({
  //       pathname: "../plants/new",
  //       params: { 
  //         species: identificationResult.name,
  //         imageUri: identificationResult.image,
  //       },
  //     });
  //   }
  // };

  const handleAddPlant = () => {
    if (identificationResult && identificationResult.scientificName && identificationResult.scientificName !== "No species found.") {
      identifiedPlantData.scientificName = identificationResult.scientificName;
      identifiedPlantData.commonName = identificationResult.commonName;
      identifiedPlantData.genus = identificationResult.genus;
      identifiedPlantData.family = identificationResult.family;
      identifiedPlantData.imageUri = imageUri; // Use the image from local state

      router.push("../plants/new");
    }
  };

  return (
    <View className="flex-1 items-center bg-gray-100 p-5">
      <Text className="text-4xl text-center mt-10 mb-5 font-bold text-green-700">
        Identify Plant
      </Text>

      <View className="flex-row w-full justify-evenly mb-5">
        <TouchableOpacity
          className="bg-blue-500 py-3 px-6 rounded-md shadow-md"
          onPress={handlePickImage}
        >
          <Text className="text-white font-semibold text-lg">Pick from Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-blue-500 py-3 px-6 rounded-md shadow-md"
          onPress={handleTakePhoto}
        >
          <Text className="text-white font-semibold text-lg">Take Photo</Text>
        </TouchableOpacity>
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
          <View className="bg-white p-5 rounded-lg shadow-md w-full max-w-sm mt-5">
            <Text className="text-lg font-bold text-gray-800 text-center mb-2">
              Identification Result:
            </Text>
            
            {/* Display all the new fields */}
            <Text className="text-2xl font-bold text-green-700 text-center">
              {identificationResult.scientificName}
            </Text>
            {identificationResult.commonName && (
              <Text className="text-lg text-gray-600 text-center mt-1">
                Common Name: {identificationResult.commonName}
              </Text>
            )}
            {identificationResult.genus && (
              <Text className="text-md text-gray-600 text-center">
                Genus: {identificationResult.genus}
              </Text>
            )}
            {identificationResult.family && (
              <Text className="text-md text-gray-600 text-center">
                Family: {identificationResult.family}
              </Text>
            )}

            {identificationResult.scientificName !== "No species found." && (
              <TouchableOpacity
                className="bg-green-500 py-3 px-6 rounded-md shadow-md mt-5"
                onPress={handleAddPlant}
              >
                <Text className="text-white font-semibold text-lg text-center">
                  Add to My Plants
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )
      )}
    </View>
  );
};

export default IdentifyScreen;