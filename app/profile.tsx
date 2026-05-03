import { theme } from "@/lib/theme";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import Svg, {
  Circle,
  Line,
  Rect,
  Text as SvgText,
} from "react-native-svg";

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
 const [selectedExam, setSelectedExam] = useState<Exam[] | null>(null);
  const [filter, setFilter] = useState<
    "all" | "pg" | "random" | "topic"
  >("all");

  const [activity, setActivity] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<any | null>(null);

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

      console.log("✅ USER:", user.id);

      /* ---------------- LOAD EXAMS ---------------- */

      const { data: examData, error: examError } = await supabase
        .from("exam_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (examError) {
        console.log("❌ EXAM LOAD ERROR:", examError);
      }

      const formattedExams: Exam[] =
        examData?.map((e: any) => ({
          score: e.score,
          type: e.type,
          topic: e.topic,
          date: e.created_at,
        })) || [];

      setExams(formattedExams);

      /* ---------------- LOAD ACTIVITY ---------------- */

      const { data: activityData, error: activityError } =
        await supabase
          .from("daily_activity")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

      if (activityError) {
        console.log("❌ ACTIVITY ERROR:", activityError);
      }

      const formattedActivity =
        activityData?.map((a: any) => ({
          date: a.created_at,
          minutes: a.minutes ?? 1,
          mode: a.mode ?? "practice",
        })) || [];

      setActivity(formattedActivity);

      setStatus("Loaded");
    } catch (e) {
      console.log("🔥 PROFILE CRASH:", e);
      setStatus("CRASH");
    }
  }

  /* ---------------- EXAM GRAPH ---------------- */

  const filteredExams = exams.filter((e) => {
    if (filter === "all") return true;
    return e.type === filter;
  });

  const groupedByDay: Record<string, Exam[]> = {};

  filteredExams.forEach((e) => {
    const day = new Date(e.date).toDateString();
    if (!groupedByDay[day]) groupedByDay[day] = [];
    groupedByDay[day].push(e);
  });

  const examDays = Object.keys(groupedByDay);

  const spacing =
    examDays.length > 1 ? 300 / (examDays.length - 1) : 0;

 const groupedPoints: Record<string, any[]> = {};

examDays.forEach((day, dayIndex) => {
  const examsForDay = groupedByDay[day];

  examsForDay.forEach((exam) => {
    const key = `${day}-${exam.score}`;

    if (!groupedPoints[key]) groupedPoints[key] = [];

    groupedPoints[key].push({
      exam,
      dayIndex,
    });
  });
});

const points: any[] = [];

Object.values(groupedPoints).forEach((group: any[]) => {
  group.forEach((item, stackIndex) => {
    const yBase = 200 - item.exam.score * 1.5;

    points.push({
      x: 30 + item.dayIndex * spacing,

      // 🔥 STACK SAME SCORE
      y: yBase - stackIndex * 10,

      color: COLORS[item.exam.type] || "white",

      // 🔥 STORE FULL GROUP
      exams: group.map((g) => g.exam),
      exam: item.exam,
    });
  });
});

  /* ---------------- ACTIVITY GRAPH ---------------- */

  const grouped: Record<string, any[]> = {};

  activity.forEach((a) => {
    const day = new Date(a.date).toDateString();
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(a);
  });

  const days = Object.keys(grouped);

  const barWidth = 40;

  const bars = days.map((day, i) => {
    const dayData = grouped[day];

    const total = dayData.reduce(
      (sum, a) => sum + (a.minutes || 1),
      0
    );

    return {
      x: i * (barWidth + 20) + 20,
      height: Math.min(total * 3, 150),
      date: day,
      breakdown: dayData,
      total,
    };
  });

  const barGraphWidth =
    days.length * (barWidth + 20) + 40;

  /* ---------------- LOADING ---------------- */

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

  /* ---------------- UI ---------------- */

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
              backgroundColor:
                filter === f ? "#22c55e" : "#1e293b",
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

      {/* ---------------- EXAM GRAPH ---------------- */}
      <View style={{ marginTop: 20 }}>
        <View style={{ flexDirection: "row" }}>
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
                r={9}
                fill={p.color}
              onPress={() => setSelectedExam(p.exams)}
              />
            ))}
          </Svg>
          </View>
        </View>
        
{selectedExam && (
  <View style={{ marginTop: 10 }}>
    <Text style={{ color: "white", marginBottom: 5 }}>
      {selectedExam.length} exam(s)
    </Text>

    {selectedExam.map((exam, i) => (
      <View key={i} style={{ marginBottom: 8 }}>
        <Text style={{ color: "white" }}>
          Score: {exam.score}%
        </Text>

        <Text style={{ color: "#94a3b8" }}>
          Mode: {exam.type}
        </Text>

        <Text style={{ color: "#94a3b8" }}>
          {new Date(exam.date).toLocaleDateString()}
        </Text>

        {exam.topic && (
          <Text style={{ color: "#94a3b8" }}>
            Topic: {exam.topic}
          </Text>
        )}
      </View>
    ))}
  </View>
)}

      {/* ---------------- ACTIVITY GRAPH ---------------- */}
      <View style={{ marginTop: 30 }}>
        <Text
          style={{ color: theme.colors.text, fontSize: 20 }}
        >
          Daily Activity
        </Text>

        <Svg height={180} width={barGraphWidth}>
          {bars.map((b, i) => (
            <Rect
              key={i}
              x={b.x}
              y={180 - b.height}
              width={barWidth}
              height={b.height}
              fill="#3b82f6"
              onPress={() => setSelectedDay(b)}
            />
          ))}
        </Svg>

        {selectedDay && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ color: "white" }}>
              Date: {selectedDay.date}
            </Text>

            <Text
              style={{
                color: "#94a3b8",
                marginBottom: 5,
              }}
            >
              Total: {selectedDay.total} min
            </Text>

            {selectedDay.breakdown.map(
              (a: any, i: number) => {
                const percent = Math.round(
                  ((a.minutes || 1) /
                    selectedDay.total) *
                    100
                );

                return (
                  <Text
                    key={i}
                    style={{ color: "#94a3b8" }}
                  >
                    {a.mode}: {percent}%
                  </Text>
                );
              }
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}