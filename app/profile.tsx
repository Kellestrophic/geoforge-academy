import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import Svg, { Circle, Line, Rect } from "react-native-svg";

/* ---------------- TYPES ---------------- */

type Exam = {
  score: number;
  type: "random" | "topic" | "pg";
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
  const [exams, setExams] = useState<Exam[]>([]);
  const [activity, setActivity] = useState<string[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;

    // EXAMS
    const { data: examData } = await supabase
      .from("exam_history")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true });

    setExams(examData || []);

    // ACTIVITY
    const { data: activityData } = await supabase
      .from("daily_activity")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true });

    setActivity(activityData?.map((a) => a.date) || []);
  }

  /* ---------------- STREAK ---------------- */

  function calculateStreak() {
    if (activity.length === 0) return 0;

    let streak = 1;

    for (let i = activity.length - 1; i > 0; i--) {
      const curr = new Date(activity[i]);
      const prev = new Date(activity[i - 1]);

      const diff =
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

      if (diff === 1) streak++;
      else break;
    }

    return streak;
  }

  const streak = calculateStreak();

  /* ---------------- GRAPH ---------------- */

  const points = exams.map((exam, i) => ({
    x: i * 70 + 30,
    y: 200 - exam.score * 1.5,
    color: COLORS[exam.type] || "white",
    exam,
  }));

  const width = 300 + points.length * 70;

  /* ---------------- ACTIVITY BARS ---------------- */

  const barWidth = 40;

  const bars = activity.map((date, i) => ({
    x: i * (barWidth + 20) + 20,
    height: 150, // placeholder (activity count can expand later)
    date,
  }));

  const barGraphWidth = activity.length * (barWidth + 20) + 40;

  /* ---------------- UI ---------------- */

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        backgroundColor: theme.colors.background,
        flexGrow: 1,
      }}
    >
      <Text style={{ color: theme.colors.text, fontSize: 26 }}>
        Results
      </Text>

      <Text style={{ color: "white", marginTop: 10 }}>
        Exams: {exams.length}
      </Text>

      <Text style={{ color: "#22c55e", marginTop: 5 }}>
        🔥 Streak: {streak} days
      </Text>

      {/* ---------------- LINE GRAPH ---------------- */}

      <View style={{ marginTop: 20 }}>
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

            {/* DOTS (CLICKABLE) */}
            {points.map((p, i) => (
              <Circle
                key={`dot-${i}`}
                cx={p.x}
                cy={p.y}
                r={6}
                fill={p.color}
                onPress={() => setSelectedExam(p.exam)}
              />
            ))}
          </Svg>
        </ScrollView>

        {/* EXAM INFO */}
        {selectedExam && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ color: "white" }}>
              Score: {selectedExam.score}%
            </Text>
            <Text style={{ color: "#94a3b8" }}>
              Type: {selectedExam.type}
            </Text>
          </View>
        )}
      </View>

      {/* ---------------- ACTIVITY BAR GRAPH ---------------- */}

      <View style={{ marginTop: 30 }}>
        <Text style={{ color: theme.colors.text, fontSize: 20 }}>
          Daily Activity
        </Text>

        <ScrollView horizontal>
          <Svg height={180} width={barGraphWidth}>
            {bars.map((b, i) => (
              <Rect
                key={i}
                x={b.x}
                y={180 - b.height}
                width={barWidth}
                height={b.height}
                fill="#3b82f6"
                onPress={() => setSelectedDay(b.date)}
              />
            ))}
          </Svg>
        </ScrollView>

        {/* DAY INFO */}
        {selectedDay && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ color: "white" }}>
              Activity Date: {selectedDay}
            </Text>
            <Text style={{ color: "#94a3b8" }}>
              (Detailed breakdown coming next)
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}