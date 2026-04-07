import { UserProvider } from "@/context/UserContext";
import { signInAnon } from "@/lib/auth";
import { ensureProfile } from "@/lib/profile";
import { supabase } from "@/lib/supabase";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Layout() {
  useEffect(() => {
(async () => {
  console.log("🔐 Starting auth...");

  // 🔥 WAIT FOR SESSION TO HYDRATE
  let session = null;

  for (let i = 0; i < 5; i++) {
    const res = await supabase.auth.getSession();
    session = res?.data?.session;

    if (session?.user) break;

    console.log("⏳ Waiting for session...", i);
    await new Promise((r) => setTimeout(r, 500));
  }

  let user = session?.user;

  // 🔥 ONLY create if still no session
  if (!user) {
    console.log("🆕 Creating anon user...");
    user = await signInAnon();
  } else {
    console.log("♻️ Reusing session:", user.id);
  }

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