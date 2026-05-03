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

    const { getSupabase } = await import("@/lib/supabase");
    const supabase = getSupabase();

    if (!supabase) {
      setStatus("❌ No Supabase");
      return;
    }

    // 🔥 CHECK SESSION
    let { data: sessionData } = await supabase.auth.getSession();
    let user = sessionData?.session?.user;

    // 🔥 CREATE USER IF NONE
    if (!user) {
      console.log("🚨 NO USER → CREATING");

      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        console.log("❌ SIGN IN ERROR:", error);
        setStatus("Auth error");
        return;
      }

      user = data.user;
    }

    console.log("✅ USER READY:", user.id);

    // 🔥 TEST QUERY
    const { error: testError } = await supabase
      .from("exam_history")
      .select("id")
      .limit(1);

    if (testError) {
      console.log("❌ QUERY ERROR:", testError);
      setStatus("Query error");
      return;
    }

    setStatus("✅ FULLY WORKING");

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