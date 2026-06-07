import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { createEvent } from "../eventService";
import { auth } from "../firebaseConfig";
import { uploadEventPoster } from "../imageService";

export default function AddEventScreen() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Dozvola odbijena", "Morate dopustiti pristup galeriji kako biste odabrali plakat.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleAddEvent = async () => {
    if (!title || !location || !date || !description) {
      Alert.alert("Greška", "Sva tekstualna polja su obavezna!");
      return;
    }

    if (!imageUri) {
      Alert.alert("Greška", "Molimo odaberite plakat za događaj!");
      return;
    }

    // PRAVA PROVJERA - ako korisnik nije prijavljen, prekidamo
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert("Greška", "Morate biti prijavljeni da biste dodali događaj.");
      return;
    }

    setLoading(true);

    try {
      // 1. Šaljemo sliku na Supabase Storage
      const uploadedImageUrl = await uploadEventPoster(imageUri);

      const eventData = {
        title,
        location,
        date,
        description,
        userId: currentUser.uid, // Koristimo PRAVI ID prijavljenog korisnika
        imageUrl: uploadedImageUrl,
      };

      // 3. Slanje u Firebase
      const result = await createEvent(eventData);
      setLoading(false);

      if (result.success) {
        Alert.alert("Uspjeh", "Događaj je uspješno dodan s plakatom! 🎉");
        setTitle("");
        setLocation("");
        setDate("");
        setDescription("");
        setImageUri(null);
        router.replace("/(tabs)");
      } else {
        Alert.alert("Greška", result.error || "Došlo je do pogreške pri spremanju događaja.");
      }
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Greška pri uploadu", "Nije uspjelo slanje slike na poslužitelj.");
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

      <Text style={styles.label}>Plakat događaja</Text>
      <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
        <Text style={styles.imagePickerButtonText}>
          {imageUri ? "Promijeni plakat" : "Odaberi plakat iz galerije"}
        </Text>
      </TouchableOpacity>

      {imageUri && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        </View>
      )}

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
  imagePickerButton: { height: 45, backgroundColor: "#007AFF", justifyContent: "center", alignItems: "center", borderRadius: 8, marginBottom: 15 },
  imagePickerButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  previewContainer: { alignItems: "center", marginBottom: 15, borderWidth: 1, borderColor: "#eee", borderRadius: 8, padding: 5 },
  previewImage: { width: 150, height: 187, borderRadius: 6, resizeMode: "cover" },
  button: { height: 50, backgroundColor: "#34C759", justifyContent: "center", alignItems: "center", borderRadius: 8, marginTop: 15 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});