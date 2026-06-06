import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";
import { auth } from "./firebaseConfig";

/**
 * 1. REGISTRACIJA KORISNIKA
 */
export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    console.error("Greška pri registraciji:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * 2. PRIJAVA KORISNIKA
 */
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    console.error("Greška pri prijavi:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * 3. ODJAVA KORISNIKA
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error("Greška pri odjavi:", error.message);
    return { success: false, error: error.message };
  }
};