import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: true,
        headerStyle: {
          backgroundColor: "#121212",
          shadowColor: "transparent",
          elevation: 0,
        },
        headerTintColor: "#FFF",
        tabBarActiveTintColor: "#FFF",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarLabelStyle: { 
          fontSize: 13, 
          fontWeight: "600", 
          paddingBottom: 5 
        },
        tabBarStyle: { 
          height: 65, 
          backgroundColor: "#1C1C1E",
          borderTopWidth: 1,
          borderTopColor: "#2C2C2E",
        }
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: "Početna",
          tabBarIcon: ({ color }) => <Ionicons name="home" size={26} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="map" 
        options={{ 
          title: "Karta",
          tabBarIcon: ({ color }) => <Ionicons name="map" size={26} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: "Profil",
          tabBarIcon: ({ color }) => <Ionicons name="person" size={26} color={color} /> 
        }} 
      />
    </Tabs>
  );
}