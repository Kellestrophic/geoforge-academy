import { theme } from "@/lib/theme";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function ExamMenu() {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        justifyContent: "center",
        backgroundColor: theme.colors.background,
      }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 26,
          fontWeight: "bold",
          marginBottom: 30,
        }}
      >
        Exam Mode
      </Text>

      <Pressable
        onPress={() => router.push("/exam-random")}
        style={{
          borderWidth: 2,
          borderColor: theme.colors.border,
          padding: 20,
          borderRadius: 14,
          marginBottom: 15,
        }}
      >
        <Text style={{ color: theme.colors.text, fontSize: 18 }}>
          Random Exam
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/exam-topic")}
        style={{
          borderWidth: 2,
          borderColor: theme.colors.border,
          padding: 20,
          borderRadius: 14,
          marginBottom: 15,
        }}
      >
        <Text style={{ color: theme.colors.text, fontSize: 18 }}>
          Topic Exam
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/exam-pg")}
        style={{
          backgroundColor: "#7c3aed",
          padding: 20,
          borderRadius: 14,
        }}
      >
        <Text style={{ color: "white", fontSize: 18 }}>
          PG Exam
        </Text>
      </Pressable>
    </View>
  );
}