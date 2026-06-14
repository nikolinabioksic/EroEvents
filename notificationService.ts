import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";

// Koliko metara od događaja da se pošalje obavijest
const GEOFENCE_RADIUS_METERS = 500;

// Interval provjere lokacije (u ms) - svakih 60 sekundi
const LOCATION_CHECK_INTERVAL = 60 * 1000;

// Postavljamo kako će obavijesti izgledati dok je app otvorena
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Računamo udaljenost između dvije GPS koordinate (Haversine formula)
function getDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // polumjer Zemlje u metrima
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Tražimo dozvolu za notifikacije i vraćamo Expo Push Token
export async function registerForPushNotifications(): Promise<string | null> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Dozvola za notifikacije odbijena.");
    return null;
  }

  // Vraćamo token (nije obavezan za lokalne notifikacije, ali koristan za push)
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch {
    return null;
  }
}

// Šaljemo lokalnu obavijest korisniku
async function sendNearbyEventNotification(
  eventTitle: string,
  eventDate: string,
  distanceMeters: number
) {
  const distanceText =
    distanceMeters < 1000
      ? `${Math.round(distanceMeters)}m`
      : `${(distanceMeters / 1000).toFixed(1)}km`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🎉 Događaj u blizini!",
      body: `${eventTitle} je večeras! Nalazi se samo ${distanceText} od tebe (${eventDate})`,
      sound: true,
    },
    trigger: null, // šalji odmah
  });
}

// Interfejs koji očekujemo od događaja (kompatibilno s eventService.ts)
export interface EventWithCoords {
  id: string;
  title: string;
  date: string;
  location: string;
  latitude?: number;
  longitude?: number;
}

// Hook koji pokreće geofencing logiku
export function useGeofencing(events: EventWithCoords[]) {
  // Pamtimo za koje događaje smo već poslali obavijest (da ne spamamo)
  const notifiedEventIds = useRef<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let active = true;

    async function checkLocation() {
      // Tražimo dozvolu za lokaciju
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Dozvola za lokaciju odbijena.");
        return;
      }

      const userLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude: userLat, longitude: userLon } =
        userLocation.coords;

      // Prolazimo kroz sve događaje koji imaju koordinate
      for (const event of events) {
        if (
          event.latitude == null ||
          event.longitude == null ||
          notifiedEventIds.current.has(event.id)
        ) {
          continue;
        }

        const distance = getDistanceMeters(
          userLat,
          userLon,
          event.latitude,
          event.longitude
        );

        if (distance <= GEOFENCE_RADIUS_METERS) {
          if (active) {
            await sendNearbyEventNotification(
              event.title,
              event.date,
              distance
            );
            notifiedEventIds.current.add(event.id);
          }
        }
      }
    }

    // Pokrećemo provjeru odmah i zatim periodično
    checkLocation();
    intervalRef.current = setInterval(checkLocation, LOCATION_CHECK_INTERVAL);

    return () => {
      active = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [events]);
}
