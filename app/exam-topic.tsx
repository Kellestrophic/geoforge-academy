import { theme } from "@/lib/theme";
import { TOPIC_LIST } from "@/lib/topics";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function ExamTopicSetup() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(20);
  const [timeLimit, setTimeLimit] = useState(30);

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
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        backgroundColor: theme.colors.background,
      }}
    >
      {/* TITLE */}
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 26,
          fontWeight: "bold",
          marginBottom: 20,
        }}
      >
        Topic Exam
      </Text>

      {/* TOPIC SELECT */}
      <Text style={{ color: theme.colors.subtext, marginBottom: 10 }}>
        Select Topic
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {TOPIC_LIST.map((topic) => (
          <Pressable
            key={topic}
            onPress={() => {
  const displayName =
    topic === "MineralFormulas"
      ? "Mineral Formulas"
      : topic;

  setSelectedTopic(displayName);
}}
            style={{
              padding: 16,
              borderRadius: 12,
              backgroundColor:
                selectedTopic === topic ? "#4CAF50" : "#1e293b",
              borderWidth: 2,
              borderColor: theme.colors.border,
              marginRight: 10,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "white", fontSize: 16 }}>
              {topic === "MineralFormulas"
                ? "Mineral Formulas"
                : topic}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* QUESTION COUNT */}
      <Text style={{ color: theme.colors.subtext, marginTop: 20 }}>
        Number of Questions
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10 }}>
        {[10, 20, 50, 100].map((num) => (
          <OptionButton
            key={num}
            value={num}
            selected={questionCount === num}
            onPress={() => setQuestionCount(num)}
          />
        ))}
      </View>

      {/* TIME LIMIT */}
      <Text style={{ color: theme.colors.subtext, marginTop: 20 }}>
        Time Limit (minutes)
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10 }}>
        {[10, 30, 60, 120].map((time) => (
          <OptionButton
            key={time}
            value={time}
            selected={timeLimit === time}
            onPress={() => setTimeLimit(time)}
          />
        ))}
      </View>

      {/* START */}
      <Pressable
        disabled={!selectedTopic}
        onPress={() =>
          router.push({
            pathname: "/exam",
            params: {
              mode: "topic",
              topic: selectedTopic,
              count: questionCount,
              time: timeLimit,
            },
          } as any)
        }
        style={{
          marginTop: 40,
          backgroundColor: selectedTopic ? "#4CAF50" : "#555",
          padding: 18,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "white", textAlign: "center", fontSize: 16 }}>
          Start Exam
        </Text>
      </Pressable>
    </ScrollView>
  );
}