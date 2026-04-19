// ✅ MUST BE FIRST
import "react-native-gesture-handler";
import "react-native-reanimated";

import { UserProvider } from "@/context/UserContext";
import { theme } from "@/lib/theme";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Layout() {
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