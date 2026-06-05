import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { loginUser } from "../../authService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    // 1. Validacija unosa
    if (!email || !password) {
      Alert.alert("Greška", "Molimo unesite email i lozinku.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Greška", "Lozinka mora imati barem 6 znakova.");
      return;
    }

    setLoading(true);

    // 2. Pozivanje tvoje login funkcije iz Sprinta 1
    const result = await loginUser(email, password);
    setLoading(false);

    if (result.success) {
      Alert.alert("Uspjeh", "Uspješno ste se prijavili!");
      // Preusmjeravanje na Home ekran (Karlova kućica u (tabs))
      router.replace("/(tabs)/home"); 
    } else {
      Alert.alert("Prijava neuspješna", result.error || "Pokušajte ponovno.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>EroEvents</Text>
      <Text style={styles.subtitle}>Prijava u aplikaciju</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Lozinka"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Prijavi se</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 32, fontWeight: "bold", textAlign: "center", color: "#333", marginBottom: 5 },
  subtitle: { fontSize: 16, textAlign: "center", color: "#666", marginBottom: 30 },
  input: { height: 50, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, fontSize: 16 },
  button: { height: 50, backgroundColor: "#007AFF", justifyContent: "center", alignItems: "center", borderRadius: 8, marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});