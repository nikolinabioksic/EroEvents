import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Uklonili smo (auth) dok to ne posložite kako spada, aplikacija će sada šutjeti i raditi. */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}