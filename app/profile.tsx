import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

/* ---------------- TYPES ---------------- */

type Exam = {
  score: number;
  type: "random" | "topic" | "pg";
};

/* ---------------- COLORS ---------------- */

const COLORS = {
  random: "#f97316",
  topic: "#3b82f6",
  pg: "#22c55e",
};

/* ---------------- SCREEN ---------------- */

export default function ProfileScreen() {
  const [examHistory, setExamHistory] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        await new Promise((r) => setTimeout(r, 300));

        const { data: exams, error } = await supabase
          .from("exam_history")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) {
          console.log("LOAD ERROR:", error);
        }

        const safe: Exam[] = (exams || []).map((e: any) => ({
          score: Number(e?.score) || 0,
          type:
            e?.type === "random" ||
            e?.type === "topic" ||
            e?.type === "pg"
              ? e.type
              : "random",
        }));

        setExamHistory(safe);
      } catch (e) {
        console.log("LOAD CRASH PREVENTED:", e);
      }

      setLoading(false);
    };

    load();
  }, []);

  if (loading) return null;

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        backgroundColor: theme.colors.background,
        flexGrow: 1,
      }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 26,
          fontWeight: "bold",
        }}
      >
        Performance
      </Text>

      <Text style={{ color: "white", marginTop: 10 }}>
        Exams: {examHistory.length}
      </Text>

      <View
        style={{
          marginTop: 20,
          borderWidth: 2,
          borderColor: theme.colors.border,
          borderRadius: 12,
          padding: 20,
          alignItems: "center",
        }}
      >
        <Text style={{ color: theme.colors.subtext }}>
          📊 Graph temporarily disabled (fixing crash)
        </Text>
      </View>
    </ScrollView>
  );
}