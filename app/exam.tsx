import { theme } from "@/lib/theme";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExamScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text style={{ color: theme.colors.text, fontSize: 24 }}>
          Exam Loaded
        </Text>

        <Text style={{ color: theme.colors.subtext, marginTop: 12 }}>
          No JSON. No timer. No Supabase.
        </Text>
      </View>
    </SafeAreaView>
  );
}