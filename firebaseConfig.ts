import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyBPrpv3BFw_OPlfrTTbUsszFmk3MVdIBgg",
  authDomain: "eroevents-f44ad.firebaseapp.com",
  projectId: "eroevents-f44ad",
  storageBucket: "eroevents-f44ad.firebasestorage.app",
  messagingSenderId: "596111494423",
  appId: "1:596111494423:web:714176c17849153c513b52"
};

const app = initializeApp(firebaseConfig);

let auth: any;

if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  const { initializeAuth } = require("firebase/auth");
  const { getReactNativePersistence } = require("firebase/auth");
  const AsyncStorage = require("@react-native-async-storage/async-storage").default;
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };
export const db = getFirestore(app);