import * as Calendar from "expo-calendar/legacy";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { logoutUser } from "../../authService";
import { deleteEvent, getEvents } from "../../eventService";
import { auth } from "../../firebaseConfig";
import {
  EventWithCoords,
  registerForPushNotifications,
  useGeofencing,
} from "../../notificationService";

export default function HomeScreen() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    registerForPushNotifications();
  }, []);

  useGeofencing(events as EventWithCoords[]);

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

  const handleShare = async (item: any) => {
    try {
      const shareMessage =
        `🎉 ${item.title}\n` +
        `📍 Lokacija: ${item.location}\n` +
        `📅 Datum: ${item.date}\n` +
        `📝 ${item.description}\n\n` +
        `Pogledaj više na EroEvents! eroevents://event/${item.id}`;

      await Share.share({
        message: shareMessage,
        title: item.title,
      });
    } catch (error: any) {
      Alert.alert("Greška", "Dijeljenje nije uspjelo. Pokušajte ponovno.");
    }
  };

const handleAddToCalendar = async (item: any) => {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Dozvola odbijena", "Potreban je pristup kalendaru.");
      return;
    }

    // Parsiramo datum
    let startDate = new Date();
    try {
      const dateMatch = item.date.match(/(\d{1,2})\.(\d{1,2})\.?(\d{4})?/);
      const timeMatch = item.date.match(/(\d{1,2}):(\d{2})/);
      if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const month = parseInt(dateMatch[2]) - 1;
        const year = dateMatch[3] ? parseInt(dateMatch[3]) : new Date().getFullYear();
        const hours = timeMatch ? parseInt(timeMatch[1]) : 20;
        const minutes = timeMatch ? parseInt(timeMatch[2]) : 0;
        startDate = new Date(year, month, day, hours, minutes);
      }
    } catch {}

    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    // Android specifično - trebamo pronaći kalendar drugačije
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    
    // Tražimo lokalni kalendar ili prvi dostupan
    const localCalendar = calendars.find(cal => 
      cal.allowsModifications && 
      (cal.type === Calendar.CalendarType.LOCAL || cal.accessLevel === Calendar.CalendarAccessLevel.OWNER)
    ) || calendars.find(cal => cal.allowsModifications);

    if (!localCalendar) {
      Alert.alert("Greška", "Nije pronađen kalendar. Provjerite imate li instaliranu aplikaciju Kalendar.");
      return;
    }

    await Calendar.createEventAsync(localCalendar.id, {
      title: item.title,
      location: item.location,
      notes: item.description,
      startDate,
      endDate,
      timeZone: "Europe/Sarajevo",
    });

    Alert.alert("Uspjeh", `"${item.title}" je dodan u kalendar! 📅`);
  } catch (error: any) {
    console.log("Kalendar greška:", error);
    Alert.alert("Greška", "Nije moguće dodati događaj u kalendar. " + error.message);
  }
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
          <Text style={styles.cardDescription} numberOfLines={3}>
            {item.description}
          </Text>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => handleShare(item)}
            >
              <Text style={styles.shareButtonText}>↗️ Podijeli</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.calendarButton}
              onPress={() => handleAddToCalendar(item)}
            >
              <Text style={styles.calendarButtonText}>📅 Kalendar</Text>
            </TouchableOpacity>

            {isOwner && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.deleteButtonText}>🗑️ Obriši</Text>
              </TouchableOpacity>
            )}
          </View>
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
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
    paddingTop: 50,
  },
  welcomeText: { fontSize: 26, fontWeight: "bold", color: "#1a1a1a", marginBottom: 5 },
  infoText: { fontSize: 15, color: "#6c757d", marginBottom: 20 },
  addButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#34C759",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  listContainer: { paddingBottom: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e9ecef",
    overflow: "hidden",
  },
  cardImage: { width: "100%", height: 200, resizeMode: "cover" },
  noImagePlaceholder: {
    width: "100%",
    height: 150,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: { color: "#777", fontSize: 14 },
  cardContent: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#212529", marginBottom: 8 },
  cardDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardLocation: { fontSize: 14, fontWeight: "600", color: "#495057" },
  cardDate: { fontSize: 14, color: "#007AFF", fontWeight: "600" },
  cardDescription: { fontSize: 14, color: "#6c757d", lineHeight: 20 },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  shareButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  shareButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  calendarButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "#FF9500",
    borderRadius: 8,
  },
  calendarButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  deleteButtonText: { color: "#FF3B30", fontSize: 14, fontWeight: "600" },
  emptyText: {
    textAlign: "center",
    color: "#6c757d",
    marginTop: 40,
    fontSize: 16,
  },
  logoutButton: {
    width: "100%",
    height: 48,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginTop: 10,
  },
  logoutButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});