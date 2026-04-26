import { theme } from "@/lib/theme";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PracticeScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          padding: 20,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <Text style={{ color: theme.colors.text, fontSize: 24 }}>
          Practice Loaded
        </Text>

        <Text style={{ color: theme.colors.subtext, marginTop: 12 }}>
          No question code running.
        </Text>
      </View>
    </SafeAreaView>
  );
}