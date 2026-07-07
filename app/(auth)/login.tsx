import { Ionicons } from "@expo/vector-icons";
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
    if (!email || !password) {
      Alert.alert("Greška", "Molimo unesite email i lozinku.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Greška", "Lozinka mora imati barem 6 znakova.");
      return;
    }

    setLoading(true);

    const result = await loginUser(email, password);
    setLoading(false);

    if (result.success) {
      // Nakon uspješne prijave vraćamo korisnika u glavni dio aplikacije
      router.replace("/(tabs)"); 
    } else {
      Alert.alert("Prijava neuspješna", result.error || "Pokušajte ponovno.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Gumb za povratak na profil (ako korisnik odustane) */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#FFF" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Dobrodošli natrag</Text>
        <Text style={styles.subtitle}>Prijavite se za objavu događaja</Text>

        <TextInput
          style={styles.input}
          placeholder="Email adresa"
          placeholderTextColor="#8E8E93"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Lozinka"
          placeholderTextColor="#8E8E93"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#121212" />
          ) : (
            <Text style={styles.buttonText}>Prijavi se</Text>
          )}
        </TouchableOpacity>

        {/* Link na ekran za registraciju */}
        <TouchableOpacity style={styles.registerLink} onPress={() => router.push("/(auth)/register")}>
          <Text style={styles.registerText}>
            Nemate račun? <Text style={styles.registerTextBold}>Registrirajte se</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#121212", // Premium tamna pozadina 
  },
  backButton: {
    marginTop: 50,
    marginLeft: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  title: { 
    fontSize: 32, 
    fontWeight: "800", 
    color: "#FFF", 
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: { 
    fontSize: 16, 
    color: "#8E8E93", 
    marginBottom: 40 
  },
  input: { 
    height: 56, 
    backgroundColor: "#1C1C1E", // Tamno siva pozadina inputa
    borderWidth: 1, 
    borderColor: "#2C2C2E", 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    marginBottom: 16, 
    fontSize: 16,
    color: "#FFF", // Bijeli tekst pri tipkanju
  },
  button: { 
    height: 56, 
    backgroundColor: "#FFF", // Bijeli gumb radi kontrasta
    justifyContent: "center", 
    alignItems: "center", 
    borderRadius: 12, 
    marginTop: 10 
  },
  buttonText: { 
    color: "#121212", 
    fontSize: 18, 
    fontWeight: "700" 
  },
  registerLink: {
    marginTop: 24,
    alignItems: "center",
  },
  registerText: {
    color: "#8E8E93",
    fontSize: 15,
  },
  registerTextBold: {
    color: "#FFF",
    fontWeight: "700",
  }
});