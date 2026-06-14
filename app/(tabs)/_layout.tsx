import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen 
        name="index" 
        options={{ title: "Početna" }} 
      />
      <Tabs.Screen 
        name="map" 
        options={{ title: "Karta" }} 
      />
    </Tabs>
  );
}