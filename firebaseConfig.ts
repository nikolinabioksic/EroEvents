import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
// @ts-ignore - Ignoriramo lažnu TypeScript uzbunu jer Expo treba ovaj import na mobitelu
import { getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "eroevents-f44ad.firebaseapp.com",
  projectId: "eroevents-f44ad",
  storageBucket: "eroevents-f44ad.firebasestorage.app",
  messagingSenderId: "596111494423",
  appId: "1:596111494423:web:714176c17849153c513b52"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);