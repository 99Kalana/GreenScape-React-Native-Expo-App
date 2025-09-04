import {
    addDoc,
    collection,
    doc,
    getDoc,
    setDoc,
    deleteDoc
} from "firebase/firestore";
import { auth, db } from "@/firebase";
import { Plant } from "@/types/plant";

export const plantsRef = collection(db, "plants");

// Create a new plant
export const createPlant = async (plantData: Omit<Plant, 'id'>) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        throw new Error("User not authenticated.");
    }
    const dataWithUserId = { ...plantData, userId };
    await addDoc(plantsRef, dataWithUserId);
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