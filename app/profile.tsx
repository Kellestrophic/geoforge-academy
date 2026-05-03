import { theme } from "@/lib/theme";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";

/* ---------------- TYPES ---------------- */

type Exam = {
  score: number;
  type: "random" | "topic" | "pg";
  topic?: string;
  date: string;
};

/* ---------------- COLORS ---------------- */

const COLORS: Record<string, string> = {
  random: "#f97316",
  topic: "#3b82f6",
  pg: "#22c55e",
};

/* ---------------- SCREEN ---------------- */

export default function ProfileScreen() {
  const [status, setStatus] = useState("Loading...");
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [filter, setFilter] = useState<"all" | "pg" | "random" | "topic">("all");

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

      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) {
        setStatus("No user");
        return;
      }

      const { data: examData, error } = await supabase
        .from("exam_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        setStatus("Load error");
        return;
      }

      if (!examData || examData.length === 0) {
        setStatus("No exams found");
        return;
      }

      // 🔥 FORMAT FOR GRAPH
      const formatted: Exam[] = examData.map((e: any) => ({
        score: e.score,
        type: e.type,
        topic: e.topic,
        date: e.created_at,
      }));

      setExams(formatted);
      setStatus("Loaded");

    } catch (e) {
      console.log("🔥 PROFILE CRASH:", e);
      setStatus("CRASH");
    }
  }

  /* ---------------- FILTER ---------------- */

  const filteredExams = exams.filter((e) => {
    if (filter === "all") return true;
    return e.type === filter;
  });

  /* ---------------- GROUP ---------------- */

  const groupedByDay: Record<string, Exam[]> = {};

  filteredExams.forEach((e) => {
    const day = new Date(e.date).toDateString();
    if (!groupedByDay[day]) groupedByDay[day] = [];
    groupedByDay[day].push(e);
  });

  const examDays = Object.keys(groupedByDay);

  const spacing =
    examDays.length > 1 ? 300 / (examDays.length - 1) : 0;

  const points: any[] = [];

  examDays.forEach((day, dayIndex) => {
    const examsForDay = groupedByDay[day];

    examsForDay.forEach((exam, stackIndex) => {
      const yBase = 200 - exam.score * 1.5;

      points.push({
        x: 30 + dayIndex * spacing,
        y: yBase - stackIndex * 8,
        color: COLORS[exam.type] || "white",
        exam,
      });
    });
  });

  /* ---------------- UI ---------------- */

  if (status !== "Loaded") {
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

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        backgroundColor: theme.colors.background,
        flexGrow: 1,
      }}
    >
      {/* FILTER */}
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        {["all", "pg", "random", "topic"].map((f) => (
          <Text
            key={f}
            onPress={() => setFilter(f as any)}
            style={{
              marginRight: 10,
              padding: 8,
              borderRadius: 8,
              backgroundColor: filter === f ? "#22c55e" : "#1e293b",
              color: "white",
            }}
          >
            {f}
          </Text>
        ))}
      </View>

      <Text style={{ color: "white" }}>
        Exams: {exams.length}
      </Text>

      {/* GRAPH */}
      <View style={{ marginTop: 20 }}>
        <View style={{ flexDirection: "row" }}>
          
          {/* Y AXIS */}
          <Svg height={220} width={50}>
            {[0, 25, 50, 75, 100].map((val, i) => (
              <SvgText
                key={i}
                x={0}
                y={200 - val * 1.5}
                fontSize="10"
                fill="#94a3b8"
              >
                {val}%
              </SvgText>
            ))}
          </Svg>

          {/* GRAPH */}
          <Svg height={240} width={320}>
            
            {points.map((p, i) => {
              if (i === 0) return null;
              const prev = points[i - 1];

              return (
                <Line
                  key={i}
                  x1={prev.x}
                  y1={prev.y}
                  x2={p.x}
                  y2={p.y}
                  stroke="#64748b"
                  strokeWidth="2"
                />
              );
            })}

            {points.map((p, i) => (
              <Circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={6}
                fill={p.color}
                onPress={() => setSelectedExam(p.exam)}
              />
            ))}
          </Svg>
        </View>

        {/* INFO */}
        {selectedExam && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ color: "white" }}>
              Score: {selectedExam.score}%
            </Text>

            <Text style={{ color: "#94a3b8" }}>
              Mode: {selectedExam.type}
            </Text>

            <Text style={{ color: "#94a3b8" }}>
              Date:{" "}
              {new Date(selectedExam.date).toLocaleDateString()}
            </Text>

            {selectedExam.topic && (
              <Text style={{ color: "#94a3b8" }}>
                Topic: {selectedExam.topic}
              </Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}