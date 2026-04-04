import { theme } from "@/lib/theme";
import { useRouter } from "expo-router";
import { useRef } from "react";
import { Pressable, Text, View } from "react-native";

export default function ExamMenu() {
  const router = useRouter();
  const tapLock = useRef(false);

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

      {/* RANDOM */}
      <Pressable
        onPress={() => {
          if (tapLock.current) return;
          tapLock.current = true;

          router.push("/exam-random");

          setTimeout(() => {
            tapLock.current = false;
          }, 400);
        }}
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
        <Text style={{ color: theme.colors.subtext }}>
          Custom exam from all topics
        </Text>
      </Pressable>

      {/* TOPIC */}
      <Pressable
        onPress={() => {
          if (tapLock.current) return;
          tapLock.current = true;

          router.push("/exam-topic");

          setTimeout(() => {
            tapLock.current = false;
          }, 400);
        }}
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
        <Text style={{ color: theme.colors.subtext }}>
          Focus on a specific subject
        </Text>
      </Pressable>

      {/* PG */}
      <Pressable
        onPress={() => {
          if (tapLock.current) return;
          tapLock.current = true;

          router.push("/exam-pg");

          setTimeout(() => {
            tapLock.current = false;
          }, 400);
        }}
        style={{
          backgroundColor: "#7c3aed",
          padding: 20,
          borderRadius: 14,
        }}
      >
        <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
          PG Exam Simulation
        </Text>
        <Text style={{ color: "#ddd6fe" }}>
          Full-length realistic exam experience
        </Text>
      </Pressable>
    </View>
  );
}