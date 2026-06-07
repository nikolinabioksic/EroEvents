import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";

// Definiramo kako naš događaj treba izgledati (TypeScript interfejs)
export interface EventData {
  title: string;
  location: string;
  date: string;
  description: string;
  userId: string; // Da znamo tko je dodao događaj
}

export const createEvent = async (eventData: EventData) => {
  try {
    // Spajamo se na kolekciju "events" u Firestore-u
    const docRef = await addDoc(collection(db, "events"), {
      ...eventData,
      createdAt: serverTimestamp(), // Automatski dodaje vrijeme kreiranja
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("Greška pri dodavanju događaja: ", error);
    return { success: false, error: error.message };
  }
};