import { ensureUser } from "@/lib/auth";
import { theme } from "@/lib/theme";
import { Stack } from "expo-router";
import { useEffect } from "react";
import "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Layout() {
  useEffect(() => {
    const init = async () => {
      const user = await ensureUser();
      console.log("✅ USER READY:", user?.id);
    };

    init();
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

          // prevents iOS crash
          animation: "none",
          gestureEnabled: false,
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
        <Stack.Screen name="profile" options={{ title: "Results" }} />
        <Stack.Screen name="review-list" options={{ title: "Study Answers" }} />
        <Stack.Screen name="review-quiz" options={{ title: "Review Quiz" }} />
        <Stack.Screen name="minigames" options={{ title: "Games" }} />
        <Stack.Screen name="match" options={{ title: "Match Game" }} />
        <Stack.Screen name="formula-game" options={{ title: "Formula Game" }} />
        <Stack.Screen name="definitions" options={{ title: "Definitions" }} />
      </Stack>
    </SafeAreaProvider>
  );
}