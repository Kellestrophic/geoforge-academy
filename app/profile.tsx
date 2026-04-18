import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";

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

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase.auth.getUser();
        const userId = data?.user?.id;

        if (!userId) {
          console.log("NO USER");
          return;
        }

        const { data: exams, error } = await supabase
          .from("exam_history")
          .select("*")
          .eq("user_id", userId)
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
        console.log("LOAD CRASH:", e);
      }
    }

    load();
  }, []);

  /* ---------------- BUILD GRAPH ---------------- */

  const points = examHistory.map((exam, i) => ({
    x: i * 60 + 20,
    y: 200 - exam.score * 1.5,
    color: COLORS[exam.type],
  }));

  const width = 300 + points.length * 60;

  /* ---------------- UI ---------------- */

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
        Exams: {points.length}
      </Text>

      <View
        style={{
          marginTop: 20,
          borderWidth: 2,
          borderColor: theme.colors.border,
          borderRadius: 12,
          padding: 10,
        }}
      >
        <ScrollView horizontal>
          <Svg height={220} width={width}>

            {/* LINES */}
            {points.map((p, i) => {
              if (i === 0) return null;
              const prev = points[i - 1];

              return (
                <Line
                  key={`line-${i}`}
                  x1={prev.x}
                  y1={prev.y}
                  x2={p.x}
                  y2={p.y}
                  stroke="#64748b"
                  strokeWidth="2"
                />
              );
            })}

            {/* DOTS */}
            {points.map((p, i) => (
              <Circle
                key={`dot-${i}`}
                cx={p.x}
                cy={p.y}
                r={5}
                fill={p.color}
              />
            ))}

          </Svg>
        </ScrollView>
      </View>
    </ScrollView>
  );
}