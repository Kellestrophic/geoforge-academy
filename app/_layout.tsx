// 🔥 GLOBAL ERROR HANDLER (TS SAFE)
const globalAny: any = global;

if (globalAny.ErrorUtils) {
  const originalHandler = globalAny.ErrorUtils.getGlobalHandler();

  globalAny.ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
    console.log("🔥 GLOBAL ERROR CAUGHT 🔥");
    console.log("Message:", error?.message);
    console.log("Stack:", error?.stack);
    console.log("Fatal:", isFatal);
alert("ERROR: " + error?.message);
    globalAny.lastError = {
      message: error?.message,
      stack: error?.stack,
      fatal: isFatal,
      time: new Date().toISOString(),
    };

// 🚨 TEMP: DO NOT CRASH APP
console.log("🔥 ERROR (NON-FATAL):", error?.message);
console.log(error?.stack);

// DO NOT call originalHandler for now
  });
}

import { UserProvider } from "@/context/UserContext";
import { theme } from "@/lib/theme";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { InteractionManager } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
function Layout() {
  

useEffect(() => {
  console.log("🚀 APP LOADED");

  const task = InteractionManager.runAfterInteractions(() => {});
  return () => task.cancel();
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
    <Stack.Screen name="timeline" options={{ title: "Timeline Builder" }} />
    </Stack>
  </UserProvider>
</SafeAreaProvider>
    
  );
  
}
export default Layout;