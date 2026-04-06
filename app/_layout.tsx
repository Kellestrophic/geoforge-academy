import { UserProvider } from "@/context/UserContext";
import { signInAnon } from "@/lib/auth";
import { ensureProfile } from "@/lib/profile";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Layout() {
  useEffect(() => {
    (async () => {
      console.log("🔐 Starting auth...");

      const user = await signInAnon();

      if (user) {
        console.log("✅ Logged in:", user.id);
        await ensureProfile();
      } else {
        console.log("❌ No user created");
      }
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <UserProvider>
        <Stack />
      </UserProvider>
    </SafeAreaProvider>
  );
}