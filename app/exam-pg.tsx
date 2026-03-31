import { theme } from "@/lib/theme";
import { router } from "expo-router";
import { useRef } from "react";
import { Pressable, Text, View } from "react-native";

export default function PGExamSetup() {
  const tapLock = useRef(false);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: theme.colors.background,
      }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 26,
          fontWeight: "bold",
          marginBottom: 20,
        }}
      >
        PG Exam Simulation
      </Text>

      <Text style={{ color: theme.colors.subtext, marginBottom: 30 }}>
        • 100 Questions{"\n"}
        • 120 Minutes{"\n"}
        • Mixed Topics{"\n"}
        • No Instant Feedback
      </Text>

      <Pressable
        onPress={() =>
          router.push({
            pathname: "/exam",
            params: {
              mode: "pg",
              count: 100,
              time: 120,
            },
          } as any)
        }
        style={{
          backgroundColor: "#7c3aed",
          padding: 18,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "white", textAlign: "center", fontSize: 16 }}>
          Start PG Exam
        </Text>
      </Pressable>
    </View>
  );
}