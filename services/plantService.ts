import {
    addDoc,
    collection,
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    query,
    where,
    getDocs
} from "firebase/firestore";
import { auth, db } from "@/firebase";
import { Plant } from "@/types/plant";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const plantsRef = collection(db, "plants");

// Create a new plant
// export const createPlant = async (plantData: Omit<Plant, 'id'>) => {
//     const userId = auth.currentUser?.uid;
//     if (!userId) {
//         throw new Error("User not authenticated.");
//     }
//     const dataWithUserId = { ...plantData, userId };
//     await addDoc(plantsRef, dataWithUserId);
// };

export const createPlant = async (plantData: Omit<Plant, 'id'>) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        throw new Error("User not authenticated.");
    }
    const dataWithUserId = { ...plantData, userId };
    
    // Key Change: Capture the docRef and return it
    const docRef = await addDoc(plantsRef, dataWithUserId);
    return docRef;
};


// Get a single plant by ID
export const getPlantById = async (id: string) => {
    const docRef = doc(db, "plants", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            // Convert Firestore Timestamps to JavaScript Date objects here
            lastWatered: data.lastWatered?.toDate(),
            lastFertilized: data.lastFertilized?.toDate(),
        } as Plant;
    } else {
        return null;
    }
};

export const getPlants = async (): Promise<Plant[]> => {
  const user = auth.currentUser;
  if (!user) {
    console.error("No user logged in.");
    return [];
  }

  const plantsCollectionRef = collection(db, "plants");
  const q = query(plantsCollectionRef, where("userId", "==", user.uid));
  const querySnapshot = await getDocs(q);

  const plants: Plant[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    plants.push({
      id: doc.id,
      name: data.name,
      species: data.species,
      careNotes: data.careNotes,
      // You may need to convert timestamps to dates here
      lastWatered: data.lastWatered ? data.lastWatered.toDate() : null,
      lastFertilized: data.lastFertilized ? data.lastFertilized.toDate() : null,
      userId: data.userId,
      imageUrl: data.imageUrl || null, // Ensure you are retrieving the imageUrl
    });
  });

  return plants;
};

// Update an existing plant
export const updatePlant = async (id: string, plantData: Partial<Plant>) => {
    const docRef = doc(db, "plants", id);
    await setDoc(docRef, plantData, { merge: true });
};

// Delete a plant
export const deletePlant = async (id: string) => {
    const docRef = doc(db, "plants", id);
    await deleteDoc(docRef);
};

// A new function to upload an image to Firebase Storage
export const uploadImageAsync = async (uri: string) => {
  const storage = getStorage();
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error("User not authenticated.");
  }

  const blob: Blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function () {
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });

  const fileRef = ref(storage, `images/${userId}/${Date.now()}`);
  await uploadBytes(fileRef, blob);
  const downloadURL = await getDownloadURL(fileRef);

  return downloadURL;
};