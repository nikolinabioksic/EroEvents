import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="(tabs)">
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="add-event" options={{ presentation: 'modal' }} />
      <Stack.Screen name="edit-event" options={{ presentation: 'modal' }} />
    </Stack>
  );
}