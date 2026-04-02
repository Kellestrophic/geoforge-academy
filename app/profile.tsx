import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import Svg, {
  Circle,
  Line,
  Polyline,
  Rect,
  Text as SvgText,
} from "react-native-svg";
function getLevelData(xp: number) {
  let level = 1;
  let xpRemaining = xp;

  // 🔥 XP curve (increasing cost per level)
  let neededXp = 100;

  while (xpRemaining >= neededXp) {
    xpRemaining -= neededXp;
    level++;

    // 🔥 SCALE CURVE HERE
    neededXp = Math.floor(neededXp * 1.25); 
  }

  const currentLevelXp = xpRemaining;

  return {
    level,
    currentLevelXp,
    neededXp,
    progress: currentLevelXp / neededXp,
  };
}

export default function ProfileScreen() {
const { user } = useUser();
  const [history, setHistory] = useState<any[]>([]);
const [selectedGraph, setSelectedGraph] = useState("overall");
const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(1);
const randomHistory = history.filter((h) => h.type !== "topic");
const topicHistory = history.filter((h) => h.type === "topic");
const levelData = getLevelData(user.xp);
const filteredHistory =
  selectedGraph === "overall"
    ? history
    : history.filter((h) => h.type === selectedGraph);
  // 🔥 LOAD DATA FUNCTION
  async function loadData() {
   let userId = null;

try {
  const response = await supabase.auth.getUser();
  userId = response?.data?.user?.id ?? null;
} catch (e) {
  console.log("🚨 getUser crash prevented:", e);
}

if (!userId) return;

    if (!userId) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    const { data: historyData } = await supabase
      .from("exam_history")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true })
      .limit(10);

    if (historyData) setHistory(historyData);
  }

  // 🔥 INITIAL LOAD + REFRESH
  useEffect(() => {
  let channel: any;

  async function init() {
  let userId = null;

try {
  const response = await supabase.auth.getUser();
  userId = response?.data?.user?.id ?? null;
} catch (e) {
  console.log("🚨 getUser crash prevented:", e);
}

if (!userId) return;
    if (!userId) return;

    loadData();

    channel = supabase
      .channel("profile-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        () => {
          loadData(); // 🔥 instant refresh
        }
      )
      .subscribe();
  }

  init();

  return () => {
    if (channel) supabase.removeChannel(channel);
  };
}, []);
function getRank(level: number) {
  if (level <= 3) return "Beginner";
  if (level <= 6) return "Apprentice";
  if (level <= 10) return "Field Geologist";
  if (level <= 15) return "Geologist Spartan";
  return "Master Geologist";
}
  // 🔥 LEVEL UP DETECTION
 useEffect(() => {
  async function checkLevelUp() {
  let userId = null;

try {
  const response = await supabase.auth.getUser();
  userId = response?.data?.user?.id ?? null;
} catch (e) {
  console.log("🚨 getUser crash prevented:", e);
}

if (!userId) return;

    if (!userId) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("last_level")
      .eq("id", userId)
      .single();

    const lastLevel = profile?.last_level || 1;

    if (levelData.level > lastLevel) {
      setShowLevelUp(true);

      await supabase
        .from("profiles")
        .update({ last_level: levelData.level })
        .eq("id", userId);

      setTimeout(() => setShowLevelUp(false), 2000);
    }
  }

  checkLevelUp();
}, [levelData.level]);

  return (
    <ScrollView
  contentContainerStyle={{
    padding: 20,
    backgroundColor: theme.colors.background,
    paddingBottom: 100, // 🔥 gives space for bottom content
  }}
  showsVerticalScrollIndicator={false}
>
      <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: "bold" }}>
        Your Progress
      </Text>

      <View style={{ marginTop: 30 }}>
        <Text style={{ color: theme.colors.subtext }}>XP</Text>
        <Text style={{ color: theme.colors.text, fontSize: 22 }}>
         {user.xp} XP
        </Text>

        <Text style={{ color: theme.colors.accent, marginTop: 5 }}>
          Level {levelData.level} — {getRank(levelData.level)}
        </Text>

        {/* PROGRESS BAR */}
        <View style={{
          marginTop: 10,
          height: 10,
          backgroundColor: "#1e293b",
          borderRadius: 10,
          overflow: "hidden",
        }}>
          <View style={{
            width: `${levelData.progress * 100}%`,
            height: "100%",
            backgroundColor: theme.colors.accent,
          }} />
        </View>

        <Text style={{ color: theme.colors.subtext, marginTop: 5 }}>
          {levelData.currentLevelXp} / {levelData.neededXp} XP
        </Text>

        <Text style={{ color: theme.colors.subtext, marginTop: 20 }}>
          Daily Streak
        </Text>
        <Text style={{ color: theme.colors.text, fontSize: 22 }}>
         {user.streak}
        </Text>
      </View>


{/* GRAPH */}
<View style={{ marginTop: 40 }}>

  {/* DROPDOWN */}
  <View style={{ marginBottom: 10 }}>
    <Text style={{ color: theme.colors.subtext, marginBottom: 5 }}>
      Select Exam Type
    </Text>

    <Text
      onPress={() => setShowDropdown(!showDropdown)}
      style={{
        color: theme.colors.text,
        backgroundColor: "#1e293b",
        padding: 10,
        borderRadius: 8,
      }}
    >
      {selectedGraph.toUpperCase()}
    </Text>

    {showDropdown && (
      <View style={{ backgroundColor: "#1e293b", marginTop: 5, borderRadius: 8 }}>
        {["overall", "random", "topic"].map((type) => (
          <Text
            key={type}
            onPress={() => {
              setSelectedGraph(type);
              setShowDropdown(false);
            }}
            style={{
              padding: 10,
              color: theme.colors.text,
              borderBottomWidth: 1,
              borderBottomColor: "#334155",
            }}
          >
            {type.toUpperCase()}
          </Text>
        ))}
      </View>
    )}
  </View>
  <Text style={{ color: theme.colors.text, marginBottom: 10 }}>
    Exam Progress
  </Text>

  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
  <Svg width={Math.max(320, history.length * 60)} height={260}>
    {/* Y AXIS LABEL */}
<SvgText
  x={0}
  y={9}
  fill="#94a3b8"
  fontSize="12"
>
  Score (%)
</SvgText>
    {(() => {
      const width = 300;
      const height = 200;
      const paddingTop = 20;
      const paddingLeft = 40;
      const paddingRight = 10;

      const usableWidth = width - paddingLeft - paddingRight;

const allDates = history.map((h) => new Date(h.date).getTime());
const minTime = Math.min(...allDates);
const maxTime = Math.max(...allDates);

const getX = (time: number) => {
  if (maxTime === minTime) return paddingLeft;
  return (
    paddingLeft +
    ((time - minTime) / (maxTime - minTime)) * usableWidth
  );
};

      return (
        <>
          {/* Y AXIS */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = paddingTop + height - (val / 100) * height;

            return (
              <SvgText
                key={val}
                x={5}
                y={y + 4}
                fill="#94a3b8"
                fontSize="10"
              >
                {val}
              </SvgText>
            );
          })}

          {/* GRID */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = paddingTop + height - (val / 100) * height;

            return (
              <Line
                key={val}
                x1={paddingLeft}
                y1={y}
                x2={width}
                y2={y}
                stroke="#334155"
                strokeWidth="1"
              />
            );
          })}

        {/* RANDOM LINE (ORANGE) */}
{(selectedGraph === "overall" || selectedGraph === "random") && (
  <Polyline
    points={randomHistory
      .map((item) => {
        const time = new Date(item.date).getTime();
        const x = getX(time);

        const y =
          paddingTop + height - (item.score / 100) * height;

        return `${x},${y}`;
      })
      .join(" ")}
    fill="none"
    stroke="#f97316"
    strokeWidth="3"
  />
)}

{/* TOPIC LINE (BLUE) */}
{(selectedGraph === "overall" || selectedGraph === "topic") && (
  <Polyline
    points={topicHistory
      .map((item) => {
        const time = new Date(item.date).getTime();
        const x = getX(time);

        const y =
          paddingTop + height - (item.score / 100) * height;

        return `${x},${y}`;
      })
      .join(" ")}
    fill="none"
    stroke="#0ea5e9"
    strokeWidth="3"
  />
)}

          {/* POINTS */}
{/* RANDOM DOTS */}
{(selectedGraph === "overall" || selectedGraph === "random") &&
  randomHistory.map((item, i) => {
    const time = new Date(item.date).getTime();
    const x = getX(time);

    const y =
      paddingTop + height - (item.score / 100) * height;

    return (
      <Circle
        key={`r-${i}`}
        cx={x}
        cy={y}
        r="5"
        fill="#0ea5e9"
        onPress={() =>
          setSelectedPoint({
            ...item,
            x,
            y,
            score: item.score,
            date: new Date(item.date).toLocaleDateString(),
          })
        }
      />
    );
  })}

{/* TOPIC DOTS */}
{(selectedGraph === "overall" || selectedGraph === "topic") &&
  topicHistory.map((item, i) => {
    const time = new Date(item.date).getTime();
    const x = getX(time);

    const y =
      paddingTop + height - (item.score / 100) * height;

    return (
      <Circle
        key={`t-${i}`}
        cx={x}
        cy={y}
        r="5"
        fill="#f97316"
        onPress={() =>
          setSelectedPoint({
            ...item,
            x,
            y,
            score: item.score,
            date: new Date(item.date).toLocaleDateString(),
          })
        }
      />
    );
  })}
          {/* X AXIS */}
       {filteredHistory.map((item, i) => {
  const time = new Date(item.date).getTime();
  const x = getX(time);

  const date = new Date(item.date);

            return (
              <SvgText
                key={i}
                x={x}
                y={paddingTop + height + 15}
                fill="#94a3b8"
                fontSize="10"
                textAnchor="middle"
              >
               {`${date.getMonth() + 1}/${date.getDate()}`}
              </SvgText>
            );
          })}
{/* X AXIS LABEL */}
<SvgText
  x={160}
  y={255}
  fill="#94a3b8"
  fontSize="12"
  textAnchor="middle"
>
  Date
</SvgText>
          {/* TOOLTIP */}
          {selectedPoint && (
            <>
              <Rect
                x={selectedPoint.x - 40}
                y={selectedPoint.y < 60 ? selectedPoint.y + 10 : selectedPoint.y - 50}
                width="80"
                height="40"
                rx="6"
                fill="#1e293b"
              />

              <SvgText
                x={selectedPoint.x}
               y={selectedPoint.y < 60 ? selectedPoint.y + 25 : selectedPoint.y - 30}
                fill="white"
                fontSize="12"
                textAnchor="middle"
              >
                {selectedPoint.score}%
              </SvgText>

              <SvgText
                x={selectedPoint.x}
                y={selectedPoint.y < 60 ? selectedPoint.y + 40 : selectedPoint.y - 15}
                fill="#94a3b8"
                fontSize="10"
                textAnchor="middle"
              >
                {selectedPoint.date}
              </SvgText>
            </>
          )}
        </>
      );
    })()}
  </Svg>
</ScrollView>
  {selectedPoint && (
  <View style={{ marginTop: 20 }}>
    <Text style={{ color: theme.colors.text, fontSize: 16 }}>
      Exam Details
    </Text>

    <Text style={{ color: theme.colors.subtext }}>
      {selectedPoint.date} — {selectedPoint.score}%
    </Text>

    {selectedPoint.topics && (
      <View style={{ marginTop: 10 }}>
        {selectedPoint.topics.map((t: any, i: number) => (
          <Text key={i} style={{ color: "white" }}>
            {t.topic} — {t.percent}%
          </Text>
        ))}
      </View>
    )}
  </View>
)}
</View>

      {/* LEVEL UP POPUP */}
      {showLevelUp && (
        <View style={{
          position: "absolute",
          top: "40%",
          left: "10%",
          right: "10%",
          backgroundColor: "#1e293b",
          padding: 20,
          borderRadius: 16,
          alignItems: "center",
          borderWidth: 2,
          borderColor: theme.colors.accent,
        }}>
          <Text style={{ color: theme.colors.accent, fontSize: 18, fontWeight: "bold" }}>
            ⛰️ Geological Breakthrough!
          </Text>

          <Text style={{ color: "white", marginTop: 10 }}>
            You've advanced to Level {levelData.level}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}