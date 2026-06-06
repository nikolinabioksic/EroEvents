import { useRouter } from "expo-router";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { logoutUser } from "../../authService";

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      Alert.alert("Odjava", "Uspješno ste se odjavili.");
      // Vraćanje korisnika na Login ekran nakon odjave
      router.replace("/(auth)/login");
    } else {
      Alert.alert("Greška", "Neuspješna odjava.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Dobrodošli na EroEvents! 🎉</Text>
      <Text style={styles.infoText}>Pregledavajte i organizirajte događaje u Hercegovini.</Text>


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
  logoutButton: { width: "80%", height: 50, backgroundColor: "#FF3B30", justifyContent: "center", alignItems: "center", borderRadius: 8 },
  logoutButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});