import { theme } from "@/lib/theme";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function ExamRandomSetup() {
  const [questionCount, setQuestionCount] = useState(20);
  const [timeLimit, setTimeLimit] = useState(30);
  const tapLock = useRef(false);

  function OptionButton({
    value,
    selected,
    onPress,
  }: {
    value: number;
    selected: boolean;
    onPress: () => void;
  }) {
    return (
      <Pressable
        onPress={onPress}
        style={{
          padding: 12,
          borderRadius: 10,
          backgroundColor: selected ? "#4CAF50" : theme.colors.card,
          marginRight: 10,
          marginBottom: 10,
          minWidth: 70,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white" }}>{value}</Text>
      </Pressable>
    );
  }

  return (
    <View
      style={{
        flex: 1,
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
        Random Exam
      </Text>

      {/* QUESTION COUNT */}
      <Text style={{ color: theme.colors.subtext, marginBottom: 10 }}>
        Number of Questions
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {[10, 20, 50, 100].map((num) => (
          <OptionButton
            key={num}
            value={num}
            selected={questionCount === num}
            onPress={() => setQuestionCount(num)}
          />
        ))}
      </View>

      {/* TIME */}
      <Text style={{ color: theme.colors.subtext, marginTop: 20, marginBottom: 10 }}>
        Time Limit (minutes)
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {[10, 30, 60, 120].map((time) => (
          <OptionButton
            key={time}
            value={time}
            selected={timeLimit === time}
            onPress={() => setTimeLimit(time)}
          />
        ))}
      </View>

      {/* START BUTTON */}
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/exam",
            params: {
              mode: "random",
              count: questionCount,
              time: timeLimit,
            },
          } as any)
        }
        style={{
          marginTop: 40,
          backgroundColor: "#4CAF50",
          padding: 18,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "white", textAlign: "center", fontSize: 16 }}>
          Start Exam
        </Text>
      </Pressable>
    </View>
  );
}