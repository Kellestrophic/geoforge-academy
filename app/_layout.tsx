// ✅ MUST BE FIRST (no imports above these)
import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Layout() {
  useEffect(() => {
    console.log("🚀 APP LOADED");

    async function initAuth() {
      try {
        console.log("🔐 INIT AUTH START");

        const { data: sessionData } = await supabase.auth.getSession();
        let user = sessionData?.session?.user ?? undefined;

        if (!user) {
          console.log("🔐 NO USER — SIGNING IN ANON");

          const { data: signInData, error } =
            await supabase.auth.signInAnonymously();

          if (error) {
            console.log("❌ AUTH ERROR:", error);
            return;
          }

          user = signInData?.user ?? undefined;

          console.log("✅ SIGNED IN ANON:", user?.id);
        } else {
          console.log("✅ USER EXISTS:", user.id);
        }

        const userId = user?.id;

        if (!userId) {
          console.log("❌ STILL NO USER AFTER AUTH");
          return;
        }

        const { error: upsertError } = await supabase
          .from("users")
          .upsert({ id: userId });

        if (upsertError) {
          console.log("❌ USER UPSERT ERROR:", upsertError);
        } else {
          console.log("✅ USER ROW READY");
        }

      } catch (e) {
        console.log("❌ AUTH CRASH PREVENTED:", e);
      }
    }

    setTimeout(() => {
      initAuth();
    }, 500);
  }, []);

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme?.colors?.background || "#000",
          },
          headerTintColor: theme?.colors?.text || "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          contentStyle: {
            backgroundColor: theme?.colors?.background || "#000",
          },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Home" }} />
        <Stack.Screen name="modes" options={{ title: "Modes" }} />
        <Stack.Screen name="practice" options={{ title: "Practice" }} />
        <Stack.Screen name="topics" options={{ title: "Topics" }} />
        <Stack.Screen name="review" options={{ title: "Review" }} />
        <Stack.Screen name="exam-pg" options={{ title: "PG Exam" }} />
        <Stack.Screen name="exam-topic" options={{ title: "Topic Exam" }} />
        <Stack.Screen name="exam" options={{ title: "Exam" }} />
        <Stack.Screen name="exam-random" options={{ title: "Random Exam" }} />
        <Stack.Screen name="profile" options={{ title: "Profile" }} />
        <Stack.Screen name="review-list" options={{ title: "Study Answers" }} />
        <Stack.Screen name="review-quiz" options={{ title: "Review Quiz" }} />
        <Stack.Screen name="minigames" options={{ title: "Games" }} />
        <Stack.Screen name="match" options={{ title: "Match Game" }} />
        <Stack.Screen name="formula-game" options={{ title: "Formula Game" }} />
        <Stack.Screen name="timeline" options={{ title: "Timeline Builder" }} />
      </Stack>
    </SafeAreaProvider>
  );
}