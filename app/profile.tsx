import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Svg, { Circle, Line, Rect, Text as SvgText } from "react-native-svg";

/* ---------------- TYPES ---------------- */

type Exam = {
  score: number;
  type: "random" | "topic" | "pg";
  topic?: string;
  date: string;
};

type Activity = {
  date: string;
  minutes: number;
  mode: string;
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
  const [activity, setActivity] = useState<any[]>([]);

  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [selectedDay, setSelectedDay] = useState<any | null>(null);
const [filter, setFilter] = useState<"all" | "pg" | "random" | "topic">("all");
  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
let user = null;

try {
  const response = await supabase?.auth?.getUser?.();

  if (
    response &&
    response.data &&
    response.data.user &&
    typeof response.data.user.id === "string"
  ) {
    user = response.data.user;
  }
} catch (e) {
  console.log("❌ getUser crash prevented:", e);
}

if (!user) {
  console.log("❌ NO USER - skipping load");
  return;
}

    // EXAMS
    const { data: examData } = await supabase
      .from("exam_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    setExams(
  (examData || []).map((e: any) => ({
    ...e,
    date: e.created_at, // 🔥 FIX
  }))
);

    // ACTIVITY
    const { data: activityData } = await supabase
      .from("daily_activity")
      .select("*")
      .eq("user_id", user.id)
     .order("created_at", { ascending: true });

   setActivity(
  (activityData || []).map((a: any) => ({
    ...a,
    date: a.created_at, // 🔥 FIX
  }))
);
  }
function safeDate(value: any) {
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}
  /* ---------------- STREAK (FIXED) ---------------- */

  function calculateStreak() {
    if (activity.length === 0) return 0;

    const dates = activity
      .map((a) => new Date(a.date).toDateString())
      .filter((v, i, arr) => arr.indexOf(v) === i); // unique days

    let streak = 1;

    for (let i = dates.length - 1; i > 0; i--) {
      const curr = new Date(dates[i]);
      const prev = new Date(dates[i - 1]);

      const diff =
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

      if (diff === 1) streak++;
      else break;
    }

    return streak;
  }

  const streak = calculateStreak();

  /* ---------------- EXAM GRAPH ---------------- */

// 🔥 FILTER EXAMS
const filteredExams = exams.filter((e) => {
  if (filter === "all") return true;
  return e.type === filter;
});

// 🔥 GROUP BY DAY
const groupedByDay: Record<string, Exam[]> = {};

filteredExams.forEach((e) => {
 const d = safeDate(e.date);
if (!d) return;

const day = d.toDateString();
  if (!groupedByDay[day]) groupedByDay[day] = [];
  groupedByDay[day].push(e);
});

// 🔥 BUILD STACKED POINTS
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

      // 🔥 STACK FIX (prevents overlap)
      y: yBase - stackIndex * 8,

      color: COLORS[exam.type] || "white",
      exam,
      day,
    });
  });
});

 const width = 350; // fixed width (no scroll)

  /* ---------------- ACTIVITY GROUPED BY DAY ---------------- */

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
  const barGraphWidth = days.length * (barWidth + 20) + 40;

  /* ---------------- UI ---------------- */

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        backgroundColor: theme.colors.background,
        flexGrow: 1,
      }}
    >
<View style={{ flexDirection: "row", marginTop: 10, marginBottom: 10 }}>
  {["all", "pg", "random", "topic"].map((f) => (
    <Pressable
      key={f}
      onPress={() => setFilter(f as any)}
      style={{
        marginRight: 10,
        padding: 8,
        borderRadius: 8,
        backgroundColor: filter === f ? "#22c55e" : "#1e293b",
      }}
    >
      <Text style={{ color: "white", textTransform: "capitalize" }}>
        {f}
      </Text>
    </Pressable>
  ))}
</View>

      <Text style={{ color: "white", marginTop: 10 }}>
        Exams: {exams.length}
      </Text>

      <Text style={{ color: "#22c55e", marginTop: 5 }}>
        🔥 Streak: {streak} days
      </Text>

{/* ---------------- EXAM GRAPH ---------------- */}
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

    {/* MAIN GRAPH */}
    <Svg height={240} width={320}>
      
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
          r={6}
          fill={p.color}
          onPress={() => setSelectedExam(p.exam)}
        />
      ))}

      {/* X AXIS LABELS */}
      {points.map((p, i) => (
        <SvgText
          key={`label-${i}`}
          x={p.x}
          y={220}
          fontSize="10"
          fill="#94a3b8"
          textAnchor="middle"
        >
          {new Date(p.exam.date).toLocaleDateString(undefined, {
            month: "numeric",
            day: "numeric",
          })}
        </SvgText>
      ))}
    </Svg>
  </View>

  {/* EXAM INFO */}
  {selectedExam && (
    <View style={{ marginTop: 10 }}>
      <Text style={{ color: "white" }}>
        Score: {selectedExam.score}%
      </Text>

      <Text style={{ color: "#94a3b8" }}>
        Mode: {selectedExam.type}
      </Text>

      <Text style={{ color: "#94a3b8" }}>
        Date: {safeDate(selectedExam.date)?.toLocaleDateString()}
      </Text>

      {selectedExam.topic && (
        <Text style={{ color: "#94a3b8" }}>
          Topic: {selectedExam.topic}
        </Text>
      )}
    </View>
  )}
</View>

      {/* ---------------- ACTIVITY BAR GRAPH ---------------- */}

      <View style={{ marginTop: 30 }}>
        <Text style={{ color: theme.colors.text, fontSize: 20 }}>
          Daily Activity
        </Text>

        <View>
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
        </View>

        {/* DAY INFO */}
        {selectedDay && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ color: "white" }}>
              Date: {selectedDay.date}
            </Text>
           <Text style={{ color: "#94a3b8", marginBottom: 5 }}>
  Total: {selectedDay.total} min
</Text>

{selectedDay.breakdown.map((a: any, i: number) => {
  const percent = Math.round(
    ((a.minutes || 1) / selectedDay.total) * 100
  );

  return (
    <Text key={i} style={{ color: "#94a3b8" }}>
      {a.activity || a.mode}: {percent}%
    </Text>
  );
})}
          </View>
        )}
      </View>
    </ScrollView>
  );
}