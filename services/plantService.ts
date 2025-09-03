import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "@/firebase";
import { Plant } from "@/types/plant";
import { auth } from "@/firebase";

export const plantsRef = collection(db, "plants");

// CREATE
export const createPlant = async (plant: Omit<Plant, 'id'>) => {
    const docRef = await addDoc(plantsRef, {
        ...plant,
        userId: auth.currentUser?.uid,
    });
    return docRef.id;
};

// READ ALL (for the current user)
export const getAllPlantsByUserId = async () => {
    const q = query(plantsRef, where("userId", "==", auth.currentUser?.uid));
    const querySnapshot = await getDocs(q);
    const plantList = querySnapshot.docs.map((plantDoc) => ({
        id: plantDoc.id,
        ...plantDoc.data(),
    })) as Plant[];
    return plantList;
};

// READ SINGLE
export const getPlantById = async (id: string) => {
    const plantDocRef = doc(db, "plants", id);
    const snapshot = await getDoc(plantDocRef);
    return snapshot.exists()
        ? ({
            id: snapshot.id,
            ...snapshot.data(),
        } as Plant)
        : null;
};

// UPDATE
export const updatePlant = async (id: string, plant: Partial<Plant>) => {
    const plantDocRef = doc(db, "plants", id);
    return updateDoc(plantDocRef, plant);
};

// DELETE
export const deletePlant = async (id: string) => {
    const plantDocRef = doc(db, "plants", id);
    return deleteDoc(plantDocRef);
};