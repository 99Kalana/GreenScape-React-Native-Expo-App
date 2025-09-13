import {auth} from "@/firebase"
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    sendPasswordResetEmail // Added for forgot password functionality
} from "firebase/auth";

export const register = (email:string, password:string) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

export const login = (email:string, password:string) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const logout = () => {
    return signOut(auth);
};

// New function to send a password reset email
export const forgotPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
};