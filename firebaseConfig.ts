import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // Čitamo ključ iz skrivene .env datoteke koju si napravio
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "eroevents-f44ad.firebaseapp.com",
  projectId: "eroevents-f44ad",
  storageBucket: "eroevents-f44ad.firebasestorage.app",
  messagingSenderId: "596111494423",
  appId: "1:596111494423:web:714176c17849153c513b52"
};

// Inicijalizacija Firebase-a
const app = initializeApp(firebaseConfig);

// Pokretanje i izvoz autentifikacije za aplikaciju
export const auth = getAuth(app);
export const db = getFirestore(app);