import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { registerUser } from "../../authService";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Greška", "Molimo popunite sva polja.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Greška", "Lozinke se ne podudaraju.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Greška", "Lozinka mora imati barem 6 znakova.");
      return;
    }

    setLoading(true);

    // Pozivamo register funkciju (pretpostavka da se tako zove u authService.ts)
    const result = await registerUser(email, password);
    setLoading(false);

    if (result.success) {
      // Nakon uspješne registracije šaljemo korisnika direktno u aplikaciju
      router.replace("/(tabs)"); 
    } else {
      Alert.alert("Registracija neuspješna", result.error || "Pokušajte ponovno.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#FFF" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Novi račun</Text>
        <Text style={styles.subtitle}>Pridružite se i objavljujte događaje</Text>

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

        <TextInput
          style={styles.input}
          placeholder="Ponovite lozinku"
          placeholderTextColor="#8E8E93"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#121212" />
          ) : (
            <Text style={styles.buttonText}>Registriraj se</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginLink} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.loginText}>
            Već imate račun? <Text style={styles.loginTextBold}>Prijavite se</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#121212",
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
    backgroundColor: "#1C1C1E",
    borderWidth: 1, 
    borderColor: "#2C2C2E", 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    marginBottom: 16, 
    fontSize: 16,
    color: "#FFF",
  },
  button: { 
    height: 56, 
    backgroundColor: "#FFF",
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
  loginLink: {
    marginTop: 24,
    alignItems: "center",
  },
  loginText: {
    color: "#8E8E93",
    fontSize: 15,
  },
  loginTextBold: {
    color: "#FFF",
    fontWeight: "700",
  }
});