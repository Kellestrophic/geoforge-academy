import questionsData from "@/data/questions.json";
import { theme } from "@/lib/theme";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function ExamTopicSetup() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(20);
  const [timeLimit, setTimeLimit] = useState(30);

  // 🔥 GET UNIQUE TOPICS
const topics = Array.from(
  new Set([
    ...questionsData.map((q: any) => q.category),
    ...questionsData.flatMap((q: any) => q.subcategory || []),
  ])
);

const groupedTopics = {
  "Core Geology": ["Mineralogy", "Petrology"],
  "Formulas": ["Mineral Formulas"],
  "Field & Structure": ["Structural", "Field"],
  "Other": topics.filter(
    (t) =>
      ![
        "Mineralogy",
        "Petrology",
        "Mineral Formulas",
        "Structural",
        "Field",
      ].includes(t)
  ),
};
  function OptionButton({
    label,
    selected,
    onPress,
  }: {
    label: string;
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
        }}
      >
        <Text style={{ color: "white" }}>{label}</Text>
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
        {topics.map((topic) => (
          <OptionButton
            key={topic}
            label={topic}
            selected={selectedTopic === topic}
            onPress={() => setSelectedTopic(topic)}
          />
        ))}
      </View>

      {/* QUESTION COUNT */}
      <Text style={{ color: theme.colors.subtext, marginTop: 20, marginBottom: 10 }}>
        Number of Questions
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {[10, 20, 50, 100].map((num) => (
          <OptionButton
            key={num}
            label={String(num)}
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
            label={String(time)}
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