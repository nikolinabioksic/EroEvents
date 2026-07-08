import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../firebaseConfig";
import { uploadEventPoster } from "../imageService";

const db = getFirestore(auth.app);

const generateSortDate = (dateStr: string) => {
  const match = dateStr.match(/(\d{1,2})\.(\d{1,2})\.?(\d{4})?/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = match[3] || new Date().getFullYear().toString();
    return parseInt(`${year}${month}${day}`, 10);
  }
  return 99999999;
};

const EditEventScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [eventLink, setEventLink] = useState("");
  
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "events", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || "");
          setLocation(data.location || "");
          setDate(data.date || "");
          setTime(data.time || ""); // Učitavanje vremena
          setDescription(data.description || "");
          setEventLink(data.eventLink || "");
          setExistingImageUrl(data.imageUrl || null);
        } else {
          Alert.alert("Greška", "Događaj nije pronađen.");
          router.back();
        }
      } catch (error) {
        Alert.alert("Greška", "Nije moguće učitati podatke događaja.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Dozvola odbijena", "Morate dopustiti pristup galeriji.");
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

  const handleUpdateEvent = async () => {
    if (!title || !location || !date || !time || !description) {
      Alert.alert("Greška", "Sva tekstualna polja (osim linka) su obavezna!");
      return;
    }

    setSaving(true);

    try {
      let finalImageUrl = existingImageUrl;
      if (imageUri) {
        finalImageUrl = await uploadEventPoster(imageUri);
      }

      const docRef = doc(db, "events", id as string);
      await updateDoc(docRef, {
        title,
        location,
        date,
        time,
        sortDate: generateSortDate(date),
        description,
        eventLink,
        imageUrl: finalImageUrl,
      });

      setSaving(false);
      Alert.alert("Uspjeh", "Događaj je uspješno izmijenjen! ✅");
      router.replace("/(tabs)");
    } catch (error: any) {
      setSaving(false);
      Alert.alert("Greška", "Došlo je do pogreške pri ažuriranju događaja.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#0A84FF" />
          <Text style={{ color: "#FFF", marginTop: 10 }}>Učitavanje podataka...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.modalHeader}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25} 
      >
        <ScrollView 
          contentContainerStyle={styles.container} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.header}>Uredi događaj</Text>
          <Text style={styles.subtitle}>Izmijenite detalje objave</Text>

          <Text style={styles.label}>Naziv događaja</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Lokacija</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Datum(i)</Text>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Vrijeme</Text>
              <TextInput
                style={styles.input}
                value={time}
                onChangeText={setTime}
              />
            </View>
          </View>

          <Text style={styles.label}>Opis događaja</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Link lokacije / Profil (Opcionalno)</Text>
          <TextInput
            style={styles.input}
            value={eventLink}
            onChangeText={setEventLink}
            keyboardType="url"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Plakat događaja</Text>
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
            <Ionicons name="images-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.imagePickerButtonText}>Promijeni plakat</Text>
          </TouchableOpacity>

          {(imageUri || existingImageUrl) && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri || existingImageUrl || undefined }} style={styles.previewImage} />
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={handleUpdateEvent} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={22} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Spremi promjene</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default EditEventScreen;

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#121212" },
  modalHeader: { width: "100%", flexDirection: "row", justifyContent: "flex-end", padding: 16, paddingTop: 50, backgroundColor: "#121212" },
  closeButton: { backgroundColor: "#2C2C2E", padding: 8, borderRadius: 20 },
  container: { paddingHorizontal: 24, paddingBottom: 40, backgroundColor: "#121212", flexGrow: 1 },
  header: { fontSize: 32, fontWeight: "800", color: "#FFF", letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 16, color: "#8E8E93", marginBottom: 30 },
  label: { fontSize: 14, fontWeight: "600", color: "#E5E5EA", marginBottom: 8, marginLeft: 4 },
  input: { height: 56, backgroundColor: "#1C1C1E", borderWidth: 1, borderColor: "#2C2C2E", borderRadius: 12, paddingHorizontal: 16, marginBottom: 20, fontSize: 16, color: "#FFF" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  textArea: { height: 120, paddingTop: 16, textAlignVertical: "top" },
  imagePickerButton: { height: 56, backgroundColor: "#2C2C2E", flexDirection: "row", justifyContent: "center", alignItems: "center", borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: "#3A3A3C" },
  imagePickerButtonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  previewContainer: { alignItems: "center", marginBottom: 20, padding: 10, backgroundColor: "#1C1C1E", borderRadius: 16, borderWidth: 1, borderColor: "#2C2C2E" },
  previewImage: { width: "100%", height: 350, borderRadius: 8, resizeMode: "contain" },
  button: { height: 56, backgroundColor: "#0A84FF", flexDirection: "row", justifyContent: "center", alignItems: "center", borderRadius: 12, marginTop: 10, marginBottom: 30 },
  buttonText: { color: "#FFF", fontSize: 18, fontWeight: "700" },
});