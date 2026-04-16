import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import { theme as rawTheme } from "@/lib/theme";
import { useEffect } from "react";
import { ScrollView, Text, View } from "react-native";

const theme = rawTheme ?? {
  colors: {
    background: "#000",
    text: "#fff",
    subtext: "#aaa",
    accent: "#0ea5e9",
  },
};

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
    progress: neededXp ? xpRemaining / neededXp : 0,
  };
}

function getRank(level: number) {
  if (level <= 3) return "Beginner";
  if (level <= 6) return "Apprentice";
  if (level <= 10) return "Field Geologist";
  if (level <= 15) return "Geologist Spartan";
  return "Master Geologist";
}

async function getCurrentUserId() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.user?.id ?? null;
  } catch (e) {
    console.log("❌ getSession failed:", e);
    return null;
  }
}

export default function ProfileScreen() {
  const { user, setUser } = useUser();

  useEffect(() => {
    async function loadProfile() {
      try {
        let userId = await getCurrentUserId();

        // 🔥 fallback: anonymous login if needed
        if (!userId) {
          const { data } = await supabase.auth.signInAnonymously();
          userId = data?.user?.id ?? null;
        }

        if (!userId) return;

        // 🔥 ensure profile exists
        await supabase.from("profiles").upsert(
          { id: userId, xp: 0, streak: 0 },
          { onConflict: "id" }
        );

        const { data } = await supabase
          .from("profiles")
          .select("xp, streak")
          .eq("id", userId)
          .maybeSingle();

        setUser({
          xp: data?.xp ?? 0,
          streak: data?.streak ?? 0,
        });

      } catch (e) {
        console.log("❌ Profile load failed:", e);
      }
    }

    loadProfile();
  }, []);

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background }}>
        <Text style={{ color: theme.colors.text }}>Loading...</Text>
      </View>
    );
  }

  const levelData = getLevelData(user?.xp ?? 0);

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        backgroundColor: theme.colors.background,
        paddingBottom: 100,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: "bold" }}>
        Your Progress
      </Text>

      <View style={{ marginTop: 30 }}>
        <Text style={{ color: theme.colors.subtext }}>XP</Text>
        <Text style={{ color: theme.colors.text, fontSize: 22 }}>
          {user.xp}
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
          {user.streak}
        </Text>
      </View>
    </ScrollView>
  );
}