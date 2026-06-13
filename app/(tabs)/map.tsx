import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";

export default function MapScreen() {
  if (Platform.OS === "web") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Karta je dostupna samo na mobitelu.</Text>
      </View>
    );
  }

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef<any>(null);

  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    }
    setLoading(false);
  };

  const goToMyLocation = () => {
  // šalje poruku u WebView da centrira kartu
    webViewRef.current?.injectJavaScript(`
    map.setView([${lat}, ${lng}], 14);
  `);
};

  const lat = userLocation?.latitude ?? 43.35;
  const lng = userLocation?.longitude ?? 17.8;

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { width: 100vw; height: 100vh; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([${lat}, ${lng}], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(map);
        
        ${userLocation ? `
        L.marker([${lat}, ${lng}], {
          icon: L.divIcon({
            html: '<div style="background:#208AEF;width:14px;height:14px;border-radius:50%;border:2px solid white;"></div>',
            iconSize: [14, 14],
            className: ''
          })
        }).addTo(map).bindPopup('Moja lokacija');
        ` : ''}
      </script>
    </body>
    </html>
  `;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#208AEF" />
        <Text style={styles.loadingText}>Učitavanje karte...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: mapHtml }}
        style={styles.map}
        javaScriptEnabled={true}
      />
      {userLocation && (
        <TouchableOpacity style={styles.locationBtn} onPress={goToMyLocation}>
        <Text style={styles.locationBtnText}>📍 Moja lokacija</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#666", fontSize: 16 },
  locationBtn: {
    position: "absolute",
    bottom: 100,
    right: 16,
    backgroundColor: "#208AEF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 4,
  },
  locationBtnText: { color: "#fff", fontWeight: "600" },
});