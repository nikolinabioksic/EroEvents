import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { logoutUser } from "../../authService";
import { getEvents } from "../../eventService";

export default function HomeScreen() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Funkcija za dohvaćanje događaja s baze (Stanin dio)
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

  // Pokreni dohvaćanje čim se ekran učita
  useEffect(() => {
    fetchEvents();
  }, []);

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      Alert.alert("Odjava", "Uspješno ste se odjavili.");
      router.replace("/(auth)/login");
    } else {
      Alert.alert("Greška", "Neuspješna odjava.");
    }
  };

  // Renderiranje pojedinačne kartice događaja (Stanin dizajn kartice)
  const renderEventItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <View style={styles.cardDetailsRow}>
        <Text style={styles.cardLocation}>📍 {item.location}</Text>
        <Text style={styles.cardDate}>📅 {item.date}</Text>
      </View>
      <Text style={styles.cardDescription} numberOfLines={3}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>EroEvents 🎉</Text>
      <Text style={styles.infoText}>Aktualni događaji u Hercegovini</Text>

      {/* Tvoj gumb za dodavanje novog događaja */}
      <TouchableOpacity style={styles.addButton} onPress={() => router.push("/add-event")}>
        <Text style={styles.addButtonText}>➕ Dodaj novi događaj</Text>
      </TouchableOpacity>

      {/* Stanin FlatList za prikaz svih kartica dohvaćenih iz baze */}
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
          onRefresh={fetchEvents} // Povlačenje prema dolje osvježava listu
          ListEmptyComponent={
            <Text style={styles.emptyText}>Trenutno nema objavljenih događaja.</Text>
          }
        />
      )}

      {/* Karlov gumb za odjavu */}
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
  
  // Stilovi za FlatList i Stanine kartice
  listContainer: { paddingBottom: 20 },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: "#e9ecef" },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#212529", marginBottom: 8 },
  cardDetailsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  cardLocation: { fontSize: 14, fontWeight: "600", color: "#495057" },
  cardDate: { fontSize: 14, color: "#007AFF", fontWeight: "600" },
  cardDescription: { fontSize: 14, color: "#6c757d", lineHeight: 20 },
  emptyText: { textAlign: "center", color: "#6c757d", marginTop: 40, fontSize: 16 },

  logoutButton: { width: "100%", height: 48, backgroundColor: "#FF3B30", justifyContent: "center", alignItems: "center", borderRadius: 10, marginTop: 10 },
  logoutButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});