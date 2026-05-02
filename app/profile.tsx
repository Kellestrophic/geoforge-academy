import { supabase } from "@/lib/supabase";
import { Pressable, Text, View } from "react-native";

export default function ProfileScreen() {
  async function testSupabase() {
    try {
      console.log("🔄 testing supabase...");

      const { data, error } = await supabase
        .from("exam_history")
        .select("*")
        .limit(1);

      if (error) {
        console.log("❌ ERROR:", error);
      } else {
        console.log("✅ SUCCESS:", data);
      }
    } catch (e) {
      console.log("❌ CRASH:", e);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#020617",
      }}
    >
      <Text style={{ color: "white", marginBottom: 20 }}>
        Supabase Test
      </Text>

      <Pressable
        onPress={testSupabase}
        style={{
          backgroundColor: "#2563eb",
          padding: 14,
        }}
      >
        <Text style={{ color: "white" }}>
          Run Test
        </Text>
      </Pressable>
    </View>
  );
}