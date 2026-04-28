import { UserProvider } from "@/context/UserContext";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </UserProvider>
    </SafeAreaProvider>
  );
}