import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

function getLevelData(xp: number) {
  let level = 1;
  let xpRemaining = xp;
  let neededXp = 100;

  while (xpRemaining >= neededXp) {
    xpRemaining -= neededXp;
    level++;
    neededXp = Math.floor(neededXp * 1.25);
  }

  return {
    level,
    currentLevelXp: xpRemaining,
    neededXp,
    progress: currentLevelXpOrZero(xpRemaining, neededXp),
  };
}

function currentLevelXpOrZero(currentLevelXp: number, neededXp: number) {
  if (!neededXp) return 0;
  return currentLevelXp / neededXp;
}

function getRank(level: number) {
  if (level <= 3) return "Beginner";
  if (level <= 6) return "Apprentice";
  if (level <= 10) return "Field Geologist";
  if (level <= 15) return "Geologist Spartan";
  return "Master Geologist";
}

export default function ProfileScreen() {
  const { user } = useUser();
  const [ready, setReady] = useState(false);
  const [examCount, setExamCount] = useState(0);

  const levelData = getLevelData(user?.xp ?? 0);

  useEffect(() => {
    let mounted = true;

    const timer = setTimeout(() => {
      if (mounted) setReady(true);
    }, 50);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    let mounted = true;

    async function loadExamCount() {
let userId: string | null = null;

try {
  const response = await supabase.auth.getUser();

  if (
    response &&
    response.data &&
    response.data.user &&
    typeof response.data.user.id === "string"
  ) {
    userId = response.data.user.id;
  }
} catch (e) {
  console.log("❌ SAFE getUser crash prevented:", e);
}

      if (!userId) return;

      try {
        const { count } = await supabase
          .from("exam_history")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);

        if (mounted) {
          setExamCount(typeof count === "number" ? count : 0);
        }
      } catch (e) {
        console.log("❌ Profile exam count crash prevented:", e);
        if (mounted) setExamCount(0);
      }
    }

    loadExamCount();

    return () => {
      mounted = false;
    };
  }, [ready]);

  if (!ready) return null;

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        backgroundColor: theme.colors.background,
        paddingBottom: 100,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 28,
          fontWeight: "bold",
        }}
      >
        Your Progress
      </Text>

      <View style={{ marginTop: 30 }}>
        <Text style={{ color: theme.colors.subtext }}>XP</Text>
        <Text style={{ color: theme.colors.text, fontSize: 22 }}>
          {user?.xp ?? 0} XP
        </Text>

        <Text style={{ color: theme.colors.accent, marginTop: 5 }}>
          Level {levelData.level} — {getRank(levelData.level)}
        </Text>

        <View
          style={{
            marginTop: 10,
            height: 10,
            backgroundColor: "#1e293b",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${Math.max(0, Math.min(100, levelData.progress * 100))}%`,
              height: "100%",
              backgroundColor: theme.colors.accent,
            }}
          />
        </View>

        <Text style={{ color: theme.colors.subtext, marginTop: 5 }}>
          {levelData.currentLevelXp} / {levelData.neededXp} XP
        </Text>

        <Text style={{ color: theme.colors.subtext, marginTop: 20 }}>
          Daily Streak
        </Text>
        <Text style={{ color: theme.colors.text, fontSize: 22 }}>
          {user?.streak ?? 0}
        </Text>

        <Text style={{ color: theme.colors.subtext, marginTop: 20 }}>
          Exams Completed
        </Text>
        <Text style={{ color: theme.colors.text, fontSize: 22 }}>
          {examCount}
        </Text>
      </View>
    </ScrollView>
  );
}