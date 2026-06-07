import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { logoutUser } from "../../authService";
import { deleteEvent, getEvents } from "../../eventService";
import { auth } from "../../firebaseConfig";

export default function HomeScreen() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUserId(user ? user.uid : null);
    });
    return unsubscribe;
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const result = await getEvents();
    if (result.success && result.data) {
      setEvents(result.data);
    } else {
      Alert.alert("Greška", "Nije moguće učitati događaje.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = (eventId: string) => {
    Alert.alert(
      "Brisanje događaja",
      "Jeste li sigurni da želite obrisati ovaj događaj?",
      [
        { text: "Odustani", style: "cancel" },
        {
          text: "Obriši",
          style: "destructive",
          onPress: async () => {
            const result = await deleteEvent(eventId);
            if (result.success) {
              Alert.alert("Uspjeh", "Događaj je uspješno obrisan.");
              fetchEvents();
            } else {
              Alert.alert("Greška pri brisanju", result.error || "Pokušajte ponovno.");
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      Alert.alert("Odjava", "Uspješno ste se odjavili.");
      router.replace("/(auth)/login");
    } else {
      Alert.alert("Greška", "Neuspješna odjava.");
    }
  };

  const renderEventItem = ({ item }: { item: any }) => {
    const isOwner = item.userId === currentUserId;

    return (
      <View style={styles.card}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        ) : (
          <View style={styles.noImagePlaceholder}>
            <Text style={styles.noImageText}>Nema plakata</Text>
          </View>
        )}

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <View style={styles.cardDetailsRow}>
            <Text style={styles.cardLocation}>📍 {item.location}</Text>
            <Text style={styles.cardDate}>📅 {item.date}</Text>
          </View>
          <Text style={styles.cardDescription} numberOfLines={3}>{item.description}</Text>

          {isOwner && (
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.deleteButtonText}>🗑️ Obriši događaj</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>EroEvents 🎉</Text>
      <Text style={styles.infoText}>Pregled aktualnih događaja u Hercegovini 🚀</Text>

      <TouchableOpacity style={styles.addButton} onPress={() => router.push("/add-event")}>
        <Text style={styles.addButtonText}>➕ Dodaj novi događaj</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderEventItem}
          contentContainerStyle={styles.listContainer}
          style={{ width: "100%" }}
          refreshing={loading}
          onRefresh={fetchEvents}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Trenutno nema objavljenih događaja.</Text>
          }
        />
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Odjavi se</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", padding: 20, backgroundColor: "#f8f9fa", paddingTop: 50 },
  welcomeText: { fontSize: 26, fontWeight: "bold", color: "#1a1a1a", marginBottom: 5 },
  infoText: { fontSize: 15, color: "#6c757d", marginBottom: 20 },
  addButton: { width: "100%", height: 50, backgroundColor: "#34C759", justifyContent: "center", alignItems: "center", borderRadius: 10, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  listContainer: { paddingBottom: 20 },
  card: { backgroundColor: "#fff", borderRadius: 12, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: "#e9ecef", overflow: "hidden" },
  cardImage: { width: "100%", height: 200, resizeMode: "cover" },
  noImagePlaceholder: { width: "100%", height: 150, backgroundColor: "#e0e0e0", justifyContent: "center", alignItems: "center" },
  noImageText: { color: "#777", fontSize: 14 },
  cardContent: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#212529", marginBottom: 8 },
  cardDetailsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  cardLocation: { fontSize: 14, fontWeight: "600", color: "#495057" },
  cardDate: { fontSize: 14, color: "#007AFF", fontWeight: "600" },
  cardDescription: { fontSize: 14, color: "#6c757d", lineHeight: 20 },
  emptyText: { textAlign: "center", color: "#6c757d", marginTop: 40, fontSize: 16 },
  deleteButton: { marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#eee", alignItems: "flex-end" },
  deleteButtonText: { color: "#FF3B30", fontSize: 14, fontWeight: "600" },
  logoutButton: { width: "100%", height: 48, backgroundColor: "#FF3B30", justifyContent: "center", alignItems: "center", borderRadius: 10, marginTop: 10 },
  logoutButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});