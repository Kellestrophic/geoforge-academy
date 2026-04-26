import { theme } from "@/lib/theme";
import { router } from "expo-router";
import { useRef } from "react";
import { Pressable, Text, View } from "react-native";

function Card({
  title,
  subtitle,
  onPress,
  color,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: color || theme.colors.card,
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: theme.colors.border,
      }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 18,
          fontWeight: "600",
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: theme.colors.subtext,
          marginTop: 4,
        }}
      >
        {subtitle}
      </Text>
    </Pressable>
  );
}

export default function ExamMenu() {
  const tapLock = useRef(false);

  function safeNav(path: string) {
    if (tapLock.current) return;
    tapLock.current = true;

    router.push(path as any);

    setTimeout(() => {
      tapLock.current = false;
    }, 400);
  }

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        backgroundColor: theme.colors.background,
      }}
    >
      {/* HEADER */}
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 28,
          fontWeight: "bold",
          marginBottom: 20,
        }}
      >
        Exam Mode
      </Text>

      {/* RANDOM */}
      <Card
        title="Random Exam"
        subtitle="Mixed questions from all topics"
        onPress={() => safeNav("/exam-test")}
      />

      {/* TOPIC */}
      <Card
        title="Topic Exam"
        subtitle="Focus on one subject"
        onPress={() => safeNav("/exam-test")}
      />

      {/* PG */}
      <Card
        title="PG Exam Simulation"
        subtitle="100 questions • 120 minutes • real exam"
        onPress={() => safeNav("/exam-test")}
        color="#7c3aed"
      />
    </View>
  );
}