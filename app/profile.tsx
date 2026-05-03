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

    // ✅ ONLY GET USER (NO CREATION)
    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) {
      console.log("❌ NO USER (this is the issue)");
      setStatus("No user");
      return;
    }

    console.log("✅ USING USER:", user.id);

    // ✅ LOAD REAL DATA
    const { data: exams, error } = await supabase
      .from("exam_history")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.log("❌ LOAD ERROR:", error);
      setStatus("Load error");
      return;
    }

    console.log("📊 EXAMS:", exams);

    if (!exams || exams.length === 0) {
      setStatus("No exams found");
      return;
    }

    setStatus(`Loaded ${exams.length} exams`);

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