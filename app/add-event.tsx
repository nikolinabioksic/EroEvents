import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { createEvent } from "../eventService";
import { auth } from "../firebaseConfig";

export default function AddEventScreen() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleAddEvent = async () => {
    // 1. Validacija da polja nisu prazna
    if (!title || !location || !date || !description) {
      Alert.alert("Greška", "Sva polja su obavezna!");
      return;
    }

    // Uzimamo ID trenutno prijavljenog korisnika
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert("Greška", "Morate biti prijavljeni da biste dodali događaj.");
      return;
    }

    setLoading(true);

    const eventData = {
      title,
      location,
      date,
      description,
      userId: currentUser.uid,
    };

    // 2. Slanje u servis
    const result = await createEvent(eventData);
    setLoading(false);

    if (result.success) {
      Alert.alert("Uspjeh", "Događaj je uspješno dodan! 🎉");
      // Resetiramo formu
      setTitle("");
      setLocation("");
      setDate("");
      setDescription("");
      // Vraćamo se natrag na početni ekran
      router.replace("/(tabs)");
    } else {
      Alert.alert("Greška", result.error || "Došlo je do pogreške.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Dodaj novi događaj</Text>

      <Text style={styles.label}>Naziv događaja</Text>
      <TextInput
        style={styles.input}
        placeholder="Npr. Koncert TS Forte, Brucošijada..."
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Lokacija</Text>
      <TextInput
        style={styles.input}
        placeholder="Npr. Posušje, Mostar, Široki Brijeg..."
        value={location}
        onChangeText={setLocation}
      />

      <Text style={styles.label}>Datum i vrijeme</Text>
      <TextInput
        style={styles.input}
        placeholder="Npr. 20.06. u 21:00h"
        value={date}
        onChangeText={setDate}
      />

      <Text style={styles.label}>Opis događaja</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Unesite detalje o događaju, ulaznicama..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity style={styles.button} onPress={handleAddEvent} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Objavi događaj</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flexGrow: 1 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#333", textAlign: "center" },
  label: { fontSize: 16, fontWeight: "600", color: "#555", marginBottom: 5 },
  input: { height: 50, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, fontSize: 16 },
  textArea: { height: 100, paddingTop: 10, textAlignVertical: "top" },
  button: { height: 50, backgroundColor: "#34C759", justifyContent: "center", alignItems: "center", borderRadius: 8, marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});