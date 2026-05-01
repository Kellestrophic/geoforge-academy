import mineralogyFB from "@/data/mineralogyFB.json";
import mineralogyMC from "@/data/mineralogyMC.json";

import { theme } from "@/lib/theme";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function shuffle(arr: any[]) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function ExamScreen() {
  const [index, setIndex] = useState(0);

  const questions = useMemo(() => {
    try {
      const raw = [...(mineralogyMC as any[]), ...(mineralogyFB as any[])];

      const safe: any[] = [];

      for (const q of raw) {
        if (!q || typeof q.question !== "string") continue;

        // MC
        if (q.type === "multiple_choice" && Array.isArray(q.choices)) {
          const choices = q.choices.map((c: any) => String(c));
          if (choices.length === 0) continue;

          const correctIndex =
            typeof q.correctAnswer === "number" ? q.correctAnswer : 0;

          safe.push({
            question: q.question,
            type: "multiple_choice",
            choices,
            correctAnswer: correctIndex,
          });

          continue;
        }

        // INPUT
        if (q.answer !== undefined && q.answer !== null) {
          safe.push({
            question: q.question,
            type: "input",
            answer: String(q.answer),
          });
        }
      }

      return shuffle(safe);
    } catch (e) {
      console.log("❌ crash build", e);
      return [];
    }
  }, []);

  const q = questions[index];

  if (!q) {
return (
  <SafeAreaView style={{ flex: 1 }}>
    <View style={{ padding: 20 }}>
      <Text style={{ color: theme.colors.text, fontSize: 20 }}>
        {q.question}
      </Text>

      {/* MULTIPLE CHOICE */}
      {q.type === "multiple_choice" &&
        q.choices.map((c: string, i: number) => (
          <Pressable
            key={i}
            style={{
              marginTop: 10,
              padding: 14,
              borderWidth: 1,
              borderColor: "#444",
              backgroundColor: "#1e293b",
            }}
          >
            <Text style={{ color: "white" }}>{c}</Text>
          </Pressable>
        ))}

      {/* INPUT */}
      {q.type === "input" && (
        <Text style={{ marginTop: 10, color: "#94a3b8" }}>
          (Input question)
        </Text>
      )}

      <Pressable
        onPress={() => setIndex((prev) => prev + 1)}
        style={{
          marginTop: 20,
          backgroundColor: "#2563eb",
          padding: 14,
        }}
      >
        <Text style={{ color: "white" }}>Next</Text>
      </Pressable>
    </View>
  </SafeAreaView>
);
}}