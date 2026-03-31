import { UserProvider } from "@/context/UserContext";
import { signInAnon } from "@/lib/auth";
import { ensureProfile } from "@/lib/profile";
import { theme } from "@/lib/theme";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import Purchases from "react-native-purchases";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Layout() {
  useEffect(() => {
    async function init() {
      if (Platform.OS !== "web") {
        await signInAnon();
        await ensureProfile();

        // 🔥 REVENUECAT SETUP
        await Purchases.configure({
          apiKey: "appl_snuDbfMxZUDwVrRvBTgEDGZgOpY",
        });
      }
    }

    init();
  }, []);

  return (
    <SafeAreaProvider>
      <UserProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
            headerTintColor: theme.colors.text,
            headerTitleStyle: {
              fontWeight: "bold",
            },
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
          }}
        >
          <Stack.Screen name="modes" options={{ title: "Modes" }} />
          <Stack.Screen name="practice" options={{ title: "Practice" }} />
          <Stack.Screen name="topics" options={{ title: "Topics" }} />
          <Stack.Screen name="review" options={{ title: "Review" }} />
          <Stack.Screen name="exam-pg" options={{ title: "PG Exam" }} />
          <Stack.Screen name="exam-topic" options={{ title: "Topic Exam" }} />
          <Stack.Screen name="exam" options={{ title: "Exam" }} />
          <Stack.Screen name="exam-random" options={{ title: "Random Exam" }} />
          <Stack.Screen name="profile" options={{ title: "Profile" }} />
          <Stack.Screen name="upgrade" options={{ title: "Upgrade" }} />
          <Stack.Screen name="review-list" options={{ title: "Study Answers" }} />
          <Stack.Screen name="review-quiz" options={{ title: "Review Quiz" }} />
          <Stack.Screen name="minigames" options={{ title: "Games" }} />
          <Stack.Screen name="match" options={{ title: "Match Game" }} />
          <Stack.Screen name="formula-game" options={{ title: "Formula Game" }} />
        </Stack>
      </UserProvider>
    </SafeAreaProvider>
  );
}