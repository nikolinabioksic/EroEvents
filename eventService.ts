import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";

// Definiramo kako naš događaj treba izgledati (TypeScript interfejs)
export interface EventData {
  title: string;
  location: string;
  date: string;
  description: string;
  userId: string; // Da znamo tko je dodao događaj
  latitude?: number;   // ? znači da nije obavezno
  longitude?: number;  // ? znači da nije obavezno
}

/**
 * 2. KORAK - PETAR (Unos podataka / Create)
 * Funkcija za spremanje novog događaja u Firestore bazu
 */
export const createEvent = async (eventData: EventData) => {
  try {
    const docRef = await addDoc(collection(db, "events"), {
      ...eventData,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("Greška pri dodavanju događaja: ", error);
    return { success: false, error: error.message };
  }
};

/**
 * 3. KORAK - STANA (Pregled podataka / Read)
 * Funkcija za dohvaćanje svih događaja iz baze
 */
export const getEvents = async () => {
  try {
    const eventsQuery = query(collection(db, "events"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(eventsQuery);
    
    const events: any[] = [];
    querySnapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: events };
  } catch (error: any) {
    console.error("Greška pri dohvaćanju događaja: ", error);
    return { success: false, error: error.message };
  }
};

/**
 * 4. KORAK - KARLO (Testiranje i manipulacija / Delete)
 * Funkcija za brisanje događaja iz baze uz provjeru grešaka
 */
export const deleteEvent = async (eventId: string) => {
  try {
    const eventDocRef = doc(db, "events", eventId);
    await deleteDoc(eventDocRef);
    return { success: true };
  } catch (error: any) {
    console.error("Greška pri brisanju događaja: ", error);
    return { success: false, error: error.message };
  }
};