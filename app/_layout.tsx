import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="modes" />
      <Tabs.Screen name="minigames" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}