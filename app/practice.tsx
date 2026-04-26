import mineralogyMC from "@/data/mineralogyMC.json";
import { theme } from "@/lib/theme";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Question = {
  question: string;
  choices: string[];
  correctAnswer: number;
};

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function PracticeScreen() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  // ✅ SAFE question loading (no async, no crash)
  const questions: Question[] = useMemo(() => {
    return shuffleArray(mineralogyMC as Question[]);
  }, []);

  const question = questions[index];

  if (!question) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Text style={{ color: "white" }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          padding: 20,
          backgroundColor: theme.colors.background,
        }}
      >
        <Text style={{ color: theme.colors.text, fontSize: 20 }}>
          {question.question}
        </Text>

        {question.choices.map((c, i) => (
          <Pressable
            key={i}
            onPress={() => setSelected(i)}
            style={{
              padding: 14,
              marginTop: 10,
              borderWidth: 1,
              borderColor: "#444",
            }}
          >
            <Text style={{ color: theme.colors.text }}>{c}</Text>
          </Pressable>
        ))}

        <Pressable
          onPress={() => {
            setSelected(null);
            setIndex((prev) =>
              prev + 1 >= questions.length ? 0 : prev + 1
            );
          }}
          style={{
            marginTop: 20,
            backgroundColor: "#2563eb",
            padding: 14,
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            Next
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}