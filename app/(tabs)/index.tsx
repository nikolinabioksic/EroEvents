import { useRouter } from "expo-router";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { logoutUser } from "../../authService";

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      Alert.alert("Odjava", "Uspješno ste se odjavili.");
      router.replace("/(auth)/login");
    } else {
      Alert.alert("Greška", "Neuspješna odjava.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Dobrodošli na EroEvents! 🎉</Text>
      <Text style={styles.infoText}>Pregledavajte i organizirajte događaje u Hercegovini.</Text>

      {/* TVOJ NOVI GUMB ZA SPRINT 2 */}
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => router.push("/add-event")}
      >
        <Text style={styles.addButtonText}>➕ Dodaj novi događaj</Text>
      </TouchableOpacity>

      {/* Karlov gumb za odjavu iz Sprinta 1 */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Odjavi se</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#f5f5f5" },
  welcomeText: { fontSize: 24, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  infoText: { fontSize: 16, color: "#666", marginBottom: 40, textAlign: "center" },
  addButton: { width: "80%", height: 50, backgroundColor: "#34C759", justifyContent: "center", alignItems: "center", borderRadius: 8, marginBottom: 15 },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  logoutButton: { width: "80%", height: 50, backgroundColor: "#FF3B30", justifyContent: "center", alignItems: "center", borderRadius: 8 },
  logoutButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});