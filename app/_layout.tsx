import { UserProvider } from "@/context/UserContext";
import * as Sentry from "@sentry/react-native";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

Sentry.init({
  dsn: "https://7f328ba8f87c01a14994587f59229820@o4511004691202048.ingest.us.sentry.io/4511287049519104",
  debug: false,
  tracesSampleRate: 1.0,
});

function Layout() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "none",
          }}
        />
      </UserProvider>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(Layout);