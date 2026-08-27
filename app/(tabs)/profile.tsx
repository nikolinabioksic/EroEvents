import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { logoutUser } from '../../authService';
import { auth } from '../../firebaseConfig';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null); 
  };

  return (
    <View style={styles.container}>
      {user ? (
        <View style={styles.authContainer}>
          <Ionicons name="person-circle" size={100} color="#FFF" />
          <Text style={styles.emailText}>{user.email}</Text>
          <Text style={styles.roleText}>Administrator (Možete dodavati događaje)</Text>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FF453A" style={{ marginRight: 8 }} />
            <Text style={styles.logoutButtonText}>Odjavi se</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.guestContainer}>
          <Ionicons name="lock-closed" size={80} color="#48484A" />
          <Text style={styles.guestTitle}>Gost profil</Text>
          <Text style={styles.guestDescription}>
            Kao gost možete pregledavati događaje i dodavati ih u svoj kalendar. 
            Za objavu novih događaja potrebna je prijava/registracija.
          </Text>
          
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.loginButtonText}>Prijavi se</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authContainer: {
    alignItems: 'center',
    width: '100%',
  },
  emailText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 16,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 14,
    color: '#48484A',
    marginBottom: 40,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    width: '100%',
    height: 52,
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF453A',
  },
  logoutButtonText: {
    color: '#FF453A',
    fontSize: 16,
    fontWeight: '700',
  },
  guestContainer: {
    alignItems: 'center',
    width: '100%',
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 20,
    marginBottom: 12,
  },
  guestDescription: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  loginButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});