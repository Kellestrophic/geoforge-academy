// ✅ MUST BE FIRST
import "react-native-gesture-handler";
import "react-native-reanimated";

import { UserProvider } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Layout() {

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("🔐 INIT AUTH");

        // 🔍 CHECK SESSION
        let { data: sessionData } = await supabase.auth.getSession();
        let user = sessionData?.session?.user;

        console.log("SESSION:", sessionData);

        // ❌ NO USER → SIGN IN
        if (!user) {
          console.log("🔐 NO USER — SIGNING IN");

          const { data, error } = await supabase.auth.signInAnonymously();

          if (error) {
            console.log("❌ SIGN IN ERROR:", error.message);
            return;
          }

          console.log("✅ SIGNED IN:", data.user?.id);

          // 🔥 WAIT FOR SESSION TO REGISTER (IMPORTANT)
          await new Promise((res) => setTimeout(res, 500));

          const { data: newSession } = await supabase.auth.getSession();
          console.log("NEW SESSION:", newSession);
        } else {
          console.log("✅ USER EXISTS:", user.id);
        }

      } catch (e) {
        console.log("❌ AUTH CRASH:", e);
      }
    };

    initAuth();
  }, []);

  return (
    <SafeAreaProvider>
      <UserProvider>
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
      </UserProvider>
    </SafeAreaProvider>
  );
}