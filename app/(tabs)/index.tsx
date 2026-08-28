import { Ionicons } from "@expo/vector-icons";
import * as Calendar from "expo-calendar/legacy";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { deleteEvent, getEvents } from "../../eventService";
import { auth } from "../../firebaseConfig";

export default function HomeScreen() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showPastEvents, setShowPastEvents] = useState(false);
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
      let shareMessage =
        `${item.title}\n` +
        `Lokacija: ${item.location}\n` +
        `Datum: ${item.date} u ${item.time || ''}\n\n` +
        `${item.description}\n\n`;
        
      if (item.eventLink) {
        shareMessage += `Link: ${item.eventLink}\n\n`;
      }
      
      shareMessage += `Pogledaj više na EroEvents! eroevents://event/${item.id}`;

      await Share.share({
        message: shareMessage,
        title: item.title,
      });
    } catch (error: any) {
      Alert.alert("Greška", "Dijeljenje nije uspjelo.");
    }
  };

  const handleAddToCalendar = async (item: any) => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Dozvola odbijena", "Potreban je pristup kalendaru.");
        return;
      }

      let startDate = new Date();
      try {
        const dateMatch = item.date ? item.date.match(/(\d{1,2})\.(\d{1,2})\.?(\d{4})?/) : null;
        const timeMatch = item.time ? item.time.match(/(\d{1,2}):(\d{2})/) : null;
        
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
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      
      const localCalendar = calendars.find(cal => 
        cal.allowsModifications && 
        (cal.type === Calendar.CalendarType.LOCAL || cal.accessLevel === Calendar.CalendarAccessLevel.OWNER)
      ) || calendars.find(cal => cal.allowsModifications);

      if (!localCalendar) {
        Alert.alert("Greška", "Nije pronađen kalendar.");
        return;
      }

      await Calendar.createEventAsync(localCalendar.id, {
        title: item.title,
        location: item.location,
        notes: `✨ Dodano putem EroEvents aplikacije\n\n${item.description}`,
        url: item.eventLink || undefined,
        startDate,
        endDate,
        timeZone: "Europe/Sarajevo",
      });

      Alert.alert("Uspjeh", "Događaj je dodan u kalendar.");
    } catch (error: any) {
      Alert.alert("Greška", "Nije moguće dodati događaj u kalendar.");
    }
  };

  const handleOpenLink = async (url: string) => {
    let finalUrl = url;
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }

    try {
      const supported = await Linking.canOpenURL(finalUrl);
      if (supported) {
        await Linking.openURL(finalUrl);
      } else {
        Alert.alert("Upozorenje", "Ovaj link se ne može otvoriti.");
      }
    } catch (error) {
      Alert.alert("Greška", "Došlo je do greške pri otvaranju linka.");
    }
  };

  const getDisplayedEvents = () => {
    const now = new Date().getTime();
    
    const filtered = events.filter((item) => {
      let isPast = false;
      if (item.date) {
        const match = item.date.match(/(\d{1,2})\.(\d{1,2})\.?(\d{4})?/);
        if (match) {
          const day = parseInt(match[1]);
          const month = parseInt(match[2]) - 1;
          const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
          const eventDate = new Date(year, month, day, 23, 59, 59).getTime();
          isPast = eventDate < now;
        }
      }
      return showPastEvents ? isPast : !isPast;
    });

    return filtered.sort((a, b) => {
      return showPastEvents 
        ? (b.sortDate || 0) - (a.sortDate || 0) 
        : (a.sortDate || 0) - (b.sortDate || 0);
    });
  };

  const renderListHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTextWrap}>
        <Text style={styles.welcomeText}>EroEvents</Text>
        <Text style={styles.infoText}>Aktualni događaji u Hercegovini</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, !showPastEvents && styles.activeTab]}
          onPress={() => setShowPastEvents(false)}
        >
          <Text style={[styles.tabText, !showPastEvents && styles.activeTabText]}>Nadolazeći</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, showPastEvents && styles.activeTab]}
          onPress={() => setShowPastEvents(true)}
        >
          <Text style={[styles.tabText, showPastEvents && styles.activeTabText]}>Prošli događaji</Text>
        </TouchableOpacity>
      </View>

      {currentUserId ? (
        <TouchableOpacity style={styles.addButton} onPress={() => router.push("/add-event")}>
          <Ionicons name="add-circle-outline" size={20} color="#121212" style={{ marginRight: 8 }} />
          <Text style={styles.addButtonText}>Dodaj novi događaj</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.guestPromptButton} onPress={() => router.push("/(auth)/login")}>
          <Ionicons name="information-circle-outline" size={22} color="#0A84FF" style={{ marginRight: 8 }} />
          <Text style={styles.guestPromptText}>
            Za dodavanje novog događaja morate se prijaviti ili registrirati.
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEventItem = ({ item }: { item: any }) => {
    const ADMIN_UID = "54SPR8pYhiggLAOlwwVa37fLyMg1";
    const hasAccess = item.userId === currentUserId || currentUserId === ADMIN_UID;

    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.9} 
        onPress={() => setSelectedEvent(item)}
      >
        {item.imageUrl ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
          </View>
        ) : (
          <View style={styles.noImagePlaceholder}>
            <Ionicons name="image-outline" size={40} color="#48484A" />
            <Text style={styles.noImageText}>Nema plakata</Text>
          </View>
        )}

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          
          <View style={styles.cardDetailsBox}>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={16} color="#AEAEB2" />
              <Text style={styles.cardLocation} numberOfLines={1}>{item.location}</Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color="#AEAEB2" />
              <Text style={styles.cardDate}>{item.date} {item.time ? `u ${item.time}` : ''}</Text>
            </View>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleShare(item)}>
              <Ionicons name="share-outline" size={18} color="#FFF" />
              <Text style={styles.actionButtonText}>Podijeli</Text>
            </TouchableOpacity>

            {hasAccess && (
              <View style={styles.ownerActions}>
                <TouchableOpacity 
                  style={styles.editButton} 
                  onPress={() => router.push({ pathname: "/edit-event", params: { id: item.id } })}
                >
                  <Ionicons name="pencil" size={18} color="#0A84FF" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash-outline" size={18} color="#FF453A" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.safeContainer, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 45 }]}>
      {loading ? (
        <ActivityIndicator size="large" color="#FFF" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={getDisplayedEvents()}
          keyExtractor={(item) => item.id}
          renderItem={renderEventItem}
          ListHeaderComponent={renderListHeader}
          contentContainerStyle={styles.listContainer}
          style={{ width: "100%" }}
          refreshing={loading}
          onRefresh={fetchEvents}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name={showPastEvents ? "archive-outline" : "file-tray-outline"} size={48} color="#48484A" />
              <Text style={styles.emptyText}>
                {showPastEvents ? "Trenutno nema prošlih događaja." : "Trenutno nema nadolazećih događaja."}
              </Text>
            </View>
          }
        />
      )}

      <Modal
        visible={!!selectedEvent}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedEvent(null)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalHeader, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 15 : 50 }]}>
            <TouchableOpacity onPress={() => setSelectedEvent(null)} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#FFF" />
            </TouchableOpacity>
          </View>

          {selectedEvent && (
            <FlatList
              data={[selectedEvent]}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View>
                  {item.imageUrl ? (
                    <View style={styles.modalImageContainer}>
                      <Image source={{ uri: item.imageUrl }} style={styles.modalImage} />
                    </View>
                  ) : (
                    <View style={[styles.noImagePlaceholder, { height: 250 }]}>
                      <Ionicons name="image-outline" size={60} color="#48484A" />
                    </View>
                  )}

                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{item.title}</Text>
                    
                    <View style={styles.modalDetailsBox}>
                      <View style={styles.modalDetailItem}>
                        <Ionicons name="location" size={20} color="#FFF" />
                        <Text style={styles.modalDetailText}>{item.location}</Text>
                      </View>
                      <View style={styles.modalDetailDivider} />
                      <View style={styles.modalDetailItem}>
                        <Ionicons name="calendar" size={20} color="#FFF" />
                        <Text style={styles.modalDetailText}>{item.date} {item.time ? `u ${item.time}` : ''}</Text>
                      </View>
                    </View>

                    <Text style={styles.modalDescriptionTitle}>O događaju</Text>
                    <Text style={styles.modalDescription}>{item.description}</Text>

                    {item.eventLink && (
                      <TouchableOpacity 
                        style={styles.externalLinkButton} 
                        onPress={() => handleOpenLink(item.eventLink)}
                      >
                        <Ionicons name="link-outline" size={22} color="#0A84FF" style={{ marginRight: 8 }} />
                        <Text style={styles.externalLinkButtonText}>Više o lokaciji / Rezervacije</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity 
                      style={styles.calendarLargeButton} 
                      onPress={() => handleAddToCalendar(item)}
                    >
                      <Ionicons name="calendar" size={24} color="#121212" style={{ marginRight: 10 }} />
                      <Text style={styles.calendarLargeButtonText}>Dodaj događaj u kalendar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#121212",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 10,
  },
  headerContainer: {
    width: "100%",
    marginBottom: 20,
  },
  headerTextWrap: {
    marginBottom: 16,
  },
  welcomeText: { 
    fontSize: 32, 
    fontWeight: "800", 
    color: "#FFF", 
    letterSpacing: -0.5,
  },
  infoText: { 
    fontSize: 15, 
    color: "#8E8E93", 
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#2C2C2E",
  },
  tabText: {
    color: "#8E8E93",
    fontSize: 15,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#FFF",
  },
  addButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#FFF",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: { 
    color: "#121212", 
    fontSize: 16, 
    fontWeight: "700" 
  },
  guestPromptButton: {
    width: "100%",
    backgroundColor: "rgba(10, 132, 255, 0.1)",
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(10, 132, 255, 0.3)",
  },
  guestPromptText: {
    color: "#0A84FF",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  card: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  imageContainer: {
    width: "100%",
    height: 280,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  cardImage: { 
    width: "100%", 
    height: "100%", 
    resizeMode: "contain" 
  },
  noImagePlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: "#1C1C1E",
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E",
  },
  noImageText: { 
    color: "#8E8E93", 
    fontSize: 14, 
    marginTop: 8,
    fontWeight: "500"
  },
  cardContent: { 
    padding: 16 
  },
  cardTitle: { 
    fontSize: 20, 
    fontWeight: "700", 
    color: "#FFF", 
    marginBottom: 12 
  },
  cardDetailsBox: {
    flexDirection: "column",
    marginBottom: 16,
    backgroundColor: "#2C2C2E",
    padding: 12,
    borderRadius: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailDivider: {
    height: 1,
    backgroundColor: "#3A3A3C",
    marginVertical: 8,
  },
  cardLocation: { 
    fontSize: 14, 
    fontWeight: "500", 
    color: "#E5E5EA", 
    marginLeft: 6,
    flex: 1,
  },
  cardDate: { 
    fontSize: 14, 
    color: "#FFF", 
    fontWeight: "600",
    marginLeft: 6
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#2C2C2E",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2E", 
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionButtonText: { 
    color: "#FFF", 
    fontSize: 14, 
    fontWeight: "600",
    marginLeft: 6
  },
  ownerActions: {
    flexDirection: "row",
    gap: 12,
  },
  editButton: {
    padding: 8,
    backgroundColor: "rgba(10, 132, 255, 0.15)",
    borderRadius: 8,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: "rgba(255, 69, 58, 0.15)",
    borderRadius: 8,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    textAlign: "center",
    color: "#8E8E93",
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#121212",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    paddingTop: 20,
    backgroundColor: "#121212",
  },
  closeButton: {
    backgroundColor: "#2C2C2E",
    padding: 8,
    borderRadius: 20,
  },
  modalImageContainer: {
    width: "100%",
    height: 350,
    backgroundColor: "#000",
  },
  modalImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 20,
  },
  modalDetailsBox: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  modalDetailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalDetailText: {
    fontSize: 16,
    color: "#E5E5EA",
    marginLeft: 12,
    fontWeight: "500",
  },
  modalDetailDivider: {
    height: 1,
    backgroundColor: "#2C2C2E",
    marginVertical: 12,
  },
  modalDescriptionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    color: "#AEAEB2",
    lineHeight: 24,
    marginBottom: 24,
  },
  externalLinkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(10, 132, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(10, 132, 255, 0.3)",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  externalLinkButtonText: {
    color: "#0A84FF",
    fontSize: 16,
    fontWeight: "600",
  },
  calendarLargeButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#FFF",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginBottom: 40,
  },
  calendarLargeButtonText: {
    color: "#121212",
    fontSize: 17,
    fontWeight: "700",
  }
});