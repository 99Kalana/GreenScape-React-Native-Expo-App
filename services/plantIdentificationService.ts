
import { Platform } from 'react-native';

const API_KEY = process.env.EXPO_PUBLIC_PLANT_ID_API_KEY; 
const PLANTNET_API_URL = "https://my-api.plantnet.org/v2/identify/all";

export const identifyPlant = async (imageUri: string) => {
  const formData = new FormData();
  const fileName = imageUri.split('/').pop();
  const fileType = 'image/jpeg';

  formData.append('images', {
    uri: imageUri,
    name: fileName,
    type: fileType,
  } as any);

  formData.append('organs', 'leaf');

  try {
    const response = await fetch(`${PLANTNET_API_URL}?api-key=${API_KEY}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("Plant ID API Response:", data); // Log the full response

    // Check if the response contains results
    if (data.results && data.results.length > 0) {
      const bestMatch = data.results[0].species;
      const commonNames = bestMatch.commonNames && bestMatch.commonNames.length > 0
        ? bestMatch.commonNames.join(", ")
        : "N/A";

      return {
        scientificName: bestMatch.scientificNameWithoutAuthor,
        commonName: commonNames,
        genus: bestMatch.genus.scientificNameWithoutAuthor,
        family: bestMatch.family.scientificNameWithoutAuthor,
        image: imageUri, // The original image URI
      };
    } else {
      return null;
    }

  } catch (error) {
    console.error("Error identifying plant:", error);
    return null;
  }
};