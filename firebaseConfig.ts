import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "eroevents-f44ad.firebaseapp.com",
  projectId: "eroevents-f44ad",
  storageBucket: "eroevents-f44ad.firebasestorage.app",
  messagingSenderId: "596111494423",
  appId: "1:596111494423:web:714176c17849153c513b52"
};

const app = initializeApp(firebaseConfig);

// Na webu koristimo getAuth, na mobitelu initializeAuth s AsyncStorage
let auth;
if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  const { getReactNativePersistence } = require("firebase/auth");
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

export { auth };
export const db = getFirestore(app);