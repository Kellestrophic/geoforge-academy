import { theme } from "@/lib/theme";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function ProfileScreen() {
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    safeLoad();
  }, []);

  async function safeLoad() {
    try {
      console.log("👤 PROFILE LOAD START");

      // 🔥 SAFE IMPORT (prevents crash)
      const { getSupabase } = await import("@/lib/supabase");
      const supabase = getSupabase();

      if (!supabase) {
        setStatus("❌ No Supabase");
        return;
      }

      // 🔥 SAFE AUTH CALL
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.log("❌ SESSION ERROR:", error);
        setStatus("Session Error");
        return;
      }

      const user = data?.session?.user;

      if (!user) {
        setStatus("No user");
        return;
      }

      console.log("✅ USER:", user.id);

      // 🔥 SAFE QUERY
      const { error: testError } = await supabase
        .from("exam_history")
        .select("id")
        .limit(1);

      if (testError) {
        console.log("❌ QUERY ERROR:", testError);
        setStatus("Query error");
        return;
      }

      setStatus("✅ Supabase Working");

    } catch (e) {
      console.log("🔥 PROFILE CRASH:", e);
      setStatus("CRASH");
    }
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.background,
      }}
    >
      <Text style={{ color: theme.colors.text }}>
        {status}
      </Text>
    </View>
  );
}