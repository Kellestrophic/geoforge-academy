import { UserProvider } from "@/context/UserContext";
import { signInAnon } from "@/lib/auth";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Layout() {
  useEffect(() => {
    async function init() {
      try {
        await signInAnon();
        console.log("✅ USER READY");
      } catch (e) {
        console.log("❌ AUTH INIT FAILED:", e);
      }
    }

    init();
  }, []);

  return (
    <SafeAreaProvider>
      <UserProvider>
        <Stack />
      </UserProvider>
    </SafeAreaProvider>
  );
}