import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// ─── Konstante za uloge ───────────────────────────────────────────────────────
const ROLES = [
  { label: "Posjetitelj", value: "visitor" },
  { label: "Organizator", value: "organizer" },
];

// ─── Validacija forme ─────────────────────────────────────────────────────────
function validate({ name, email, password, confirmPassword, role }) {
  const errors = {};

  if (!name.trim()) {
    errors.name = "Ime je obavezno.";
  } else if (name.trim().length < 2) {
    errors.name = "Ime mora imati najmanje 2 znaka.";
  }

  if (!email.trim()) {
    errors.email = "E-mail je obavezan.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Unesite ispravnu e-mail adresu.";
  }

  if (!password) {
    errors.password = "Lozinka je obavezna.";
  } else if (password.length < 6) {
    errors.password = "Lozinka mora imati najmanje 6 znakova.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Potvrda lozinke je obavezna.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Lozinke se ne podudaraju.";
  }

  if (!role) {
    errors.role = "Odaberite ulogu.";
  }

  return errors;
}

// ─── Komponenta za padajući izbornik (Picker) ─────────────────────────────────
function RolePicker({ selectedRole, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={[styles.roleButton, isOpen && styles.roleButtonOpen]}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.8}
      >
        <Text style={[styles.roleButtonText, !selectedRole && styles.placeholder]}>
          {selectedRole
            ? ROLES.find((r) => r.value === selectedRole)?.label
            : "Odaberi ulogu..."}
        </Text>
        <Text style={styles.roleChevron}>{isOpen ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.roleDropdown}>
          {ROLES.map((role) => (
            <TouchableOpacity
              key={role.value}
              style={[
                styles.roleOption,
                selectedRole === role.value && styles.roleOptionSelected,
              ]}
              onPress={() => {
                onSelect(role.value);
                setIsOpen(false);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.roleOptionText,
                  selectedRole === role.value && styles.roleOptionTextSelected,
                ]}
              >
                {role.label}
              </Text>
              {role.value === "organizer" && (
                <Text style={styles.roleBadge}>✦ PRO</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Polje za unos s labelom i greškom ───────────────────────────────────────
function FormField({ label, error, children }) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

// ─── Glavni ekran za registraciju ─────────────────────────────────────────────
/**
 * RegisterScreen
 *
 * Props:
 *  - onRegister(userData): async funkcija za Firebase registraciju (dolazi od kolege)
 *    userData = { name, email, password, role }
 *  - onNavigateToLogin(): callback za navigaciju na Login ekran
 *
 * Primjer korištenja s Expo Router:
 *   import { createUserWithEmailAndPassword } from "firebase/auth";
 *   import { auth, db } from "../firebase/config";
 *   import { doc, setDoc } from "firebase/firestore";
 *
 *   async function handleRegister({ name, email, password, role }) {
 *     const cred = await createUserWithEmailAndPassword(auth, email, password);
 *     await setDoc(doc(db, "users", cred.user.uid), { name, email, role });
 *   }
 */
export default function RegisterScreen({ onRegister, onNavigateToLogin }) {
  // ─── Stanje forme ───────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Briši grešku kad korisnik počne tipkati
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      await onRegister?.({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      });
    } catch (error) {
      // Firebase greške
      const firebaseErrors = {
        "auth/email-already-in-use": "Ovaj e-mail je već registriran.",
        "auth/invalid-email": "Neispravna e-mail adresa.",
        "auth/weak-password": "Lozinka je preslab. Dodaj još znakova.",
        "auth/network-request-failed": "Greška mreže. Provjeri internet.",
      };
      const message =
        firebaseErrors[error.code] || "Registracija nije uspjela. Pokušaj ponovo.";
      Alert.alert("Greška", message);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>E</Text>
          </View>
          <Text style={styles.appName}>EroEvents</Text>
          <Text style={styles.subtitle}>Događaji Hercegovine na jednom mjestu</Text>
        </View>

        {/* Forma */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Kreiraj račun</Text>

          {/* Ime */}
          <FormField label="Ime i prezime" error={errors.name}>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={form.name}
              onChangeText={(v) => handleChange("name", v)}
              placeholder="Npr. Ante Anić"
              placeholderTextColor="#9ca3af"
              autoCapitalize="words"
              returnKeyType="next"
            />
          </FormField>

          {/* E-mail */}
          <FormField label="E-mail adresa" error={errors.email}>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={form.email}
              onChangeText={(v) => handleChange("email", v)}
              placeholder="ante@example.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
            />
          </FormField>

          {/* Lozinka */}
          <FormField label="Lozinka" error={errors.password}>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                value={form.password}
                onChangeText={(v) => handleChange("password", v)}
                placeholder="Min. 6 znakova"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="next"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeIcon}>{showPassword ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>
          </FormField>

          {/* Potvrda lozinke */}
          <FormField label="Potvrdi lozinku" error={errors.confirmPassword}>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput, errors.confirmPassword && styles.inputError]}
                value={form.confirmPassword}
                onChangeText={(v) => handleChange("confirmPassword", v)}
                placeholder="Ponovi lozinku"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                returnKeyType="done"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirm(!showConfirm)}
              >
                <Text style={styles.eyeIcon}>{showConfirm ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>
          </FormField>

          {/* Uloga - Padajući izbornik */}
          <FormField label="Uloga" error={errors.role}>
            <RolePicker
              selectedRole={form.role}
              onSelect={(v) => handleChange("role", v)}
            />
          </FormField>

          {/* Info o ulogama */}
          <View style={styles.roleInfo}>
            <Text style={styles.roleInfoText}>
              <Text style={styles.roleInfoBold}>Posjetitelj</Text> — pregledavaj i prijavljuj se na događaje.{"\n"}
              <Text style={styles.roleInfoBold}>Organizator</Text> — kreiraj i upravljaj svojim događajima.
            </Text>
          </View>

          {/* Gumb za registraciju */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Registriraj se</Text>
            )}
          </TouchableOpacity>

          {/* Link na login */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Već imaš račun? </Text>
            <TouchableOpacity onPress={onNavigateToLogin}>
              <Text style={styles.loginLink}>Prijavi se</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Stilovi ──────────────────────────────────────────────────────────────────
const BRAND = "#e63946";       // crvena boja brenda
const BRAND_DARK = "#c1121f";
const SURFACE = "#ffffff";
const BG = "#f8f4f0";
const TEXT = "#1a1a2e";
const MUTED = "#6b7280";
const BORDER = "#e5e7eb";
const ERROR = "#dc2626";

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: BG },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // ─── Header ────────────────────────────────────────────────────────────────
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 32,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -1,
  },
  appName: {
    fontSize: 26,
    fontWeight: "800",
    color: TEXT,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: MUTED,
    marginTop: 4,
    textAlign: "center",
  },

  // ─── Kartica forme ─────────────────────────────────────────────────────────
  card: {
    backgroundColor: SURFACE,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: TEXT,
    marginBottom: 20,
  },

  // ─── Polje forme ───────────────────────────────────────────────────────────
  fieldWrapper: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: TEXT,
  },
  inputError: {
    borderColor: ERROR,
    backgroundColor: "#fef2f2",
  },
  errorText: {
    fontSize: 12,
    color: ERROR,
    marginTop: 4,
    marginLeft: 2,
  },

  // ─── Lozinka s ikonom ──────────────────────────────────────────────────────
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: { flex: 1 },
  eyeButton: {
    position: "absolute",
    right: 12,
    padding: 4,
  },
  eyeIcon: { fontSize: 16 },

  // ─── Padajući izbornik (uloga) ─────────────────────────────────────────────
  roleButton: {
    backgroundColor: "#f9fafb",
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roleButtonOpen: {
    borderColor: BRAND,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  roleButtonText: {
    fontSize: 15,
    color: TEXT,
  },
  placeholder: { color: "#9ca3af" },
  roleChevron: {
    fontSize: 11,
    color: MUTED,
  },
  roleDropdown: {
    backgroundColor: SURFACE,
    borderWidth: 1.5,
    borderColor: BRAND,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: "hidden",
  },
  roleOption: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  roleOptionSelected: {
    backgroundColor: "#fff5f5",
  },
  roleOptionText: {
    fontSize: 15,
    color: TEXT,
  },
  roleOptionTextSelected: {
    color: BRAND,
    fontWeight: "600",
  },
  roleBadge: {
    fontSize: 11,
    color: BRAND,
    fontWeight: "700",
    backgroundColor: "#fde8ea",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  // ─── Info tekst o ulogama ──────────────────────────────────────────────────
  roleInfo: {
    backgroundColor: "#f0f4ff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    marginTop: 4,
  },
  roleInfoText: {
    fontSize: 12,
    color: "#4b5563",
    lineHeight: 18,
  },
  roleInfoBold: {
    fontWeight: "700",
    color: TEXT,
  },

  // ─── Gumb ──────────────────────────────────────────────────────────────────
  submitButton: {
    backgroundColor: BRAND,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#f4a2a8",
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // ─── Link na prijavu ───────────────────────────────────────────────────────
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  loginText: {
    fontSize: 14,
    color: MUTED,
  },
  loginLink: {
    fontSize: 14,
    color: BRAND,
    fontWeight: "700",
  },
});
