import { UserProvider } from "@/context/UserContext";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

console.log("🚀 ROOT LAYOUT LOADED");

export default function Layout() {
  console.log("🚀 APP RENDER");

  return (
    <SafeAreaProvider>
      <UserProvider>
        <Stack />
      </UserProvider>
    </SafeAreaProvider>
  );
}