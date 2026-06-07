import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";

// Definiramo kako naš događaj treba izgledati (TypeScript interfejs)
export interface EventData {
  title: string;
  location: string;
  date: string;
  description: string;
  userId: string; // Da znamo tko je dodao događaj
}

/**
 * 2. KORAK - PETAR (Unos podataka / Create)
 * Funkcija za spremanje novog događaja u Firestore bazu
 */
export const createEvent = async (eventData: EventData) => {
  try {
    // Spajamo se na kolekciju "events" u Firestore-u
    const docRef = await addDoc(collection(db, "events"), {
      ...eventData,
      createdAt: serverTimestamp(), // Automatski dodaje vrijeme kreiranja na serveru
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("Greška pri dodavanju događaja: ", error);
    return { success: false, error: error.message };
  }
};

/**
 * 3. KORAK - STANA (Pregled podataka / Read)
 * Funkcija za dohvaćanje svih događaja iz baze, sortiranih od najnovijeg prema starijem
 */
export const getEvents = async () => {
  try {
    // Radimo upit nad kolekcijom "events" i sortiramo po vremenu kreiranja
    const eventsQuery = query(collection(db, "events"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(eventsQuery);
    
    const events: any[] = [];
    // Prolazimo kroz sve dokumente koje je baza vratila
    querySnapshot.forEach((doc) => {
      events.push({ 
        id: doc.id, 
        ...doc.data() 
      });
    });
    
    return { success: true, data: events };
  } catch (error: any) {
    console.error("Greška pri dohvaćanju događaja: ", error);
    return { success: false, error: error.message };
  }
};