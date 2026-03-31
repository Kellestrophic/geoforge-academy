import { requirePro } from "@/lib/pro";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function ReviewList() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const tapLock = useRef(false);
useEffect(() => {
  requirePro();
}, []);
useEffect(() => {
  async function loadQuestions() {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) return;

    const { data } = await supabase
      .from("review_questions")
      .select("*")
      .eq("user_id", userId);

    if (data) {
      setQuestions(data.map((q) => q.question));
    }
  }

  loadQuestions();
}, []);

async function removeQuestion(id: string) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) return;

  await supabase
    .from("review_questions")
    .delete()
    .eq("user_id", userId)
    .eq("question->>id", id);

  setQuestions((prev) => prev.filter((q) => q.id !== id));
  setSelectedId(null);
}
  if (questions.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background }}>
        <Text style={{ color: theme.colors.text }}>Nothing to review 🎉</Text>
      </View>
    );
  }

  return (
    
<ScrollView
  style={{ backgroundColor: theme.colors.background }}
  contentContainerStyle={{
    padding: 20,
    paddingBottom: 100,
  }}
>
      <Text style={{ color: theme.colors.text, fontSize: 24, marginBottom: 20 }}>
        Study Answers
      </Text>

     {questions.map((q, index) => {
        const isOpen = selectedId === q.id;

        return (
          <View
          key={`${q.id}-${index}`}
            style={{
             borderWidth: 2,
borderColor: theme.colors.border,
              padding: 15,
              borderRadius: 12,
              marginBottom: 12,
            }}
          >
            {/* CLICKABLE HEADER */}
            <Pressable onPress={() => setSelectedId(isOpen ? null : q.id)}>
              <Text style={{ color: theme.colors.text }}>
                {q.question}
              </Text>
            </Pressable>

            {/* EXPANDED CONTENT */}
            {isOpen && (
              <View style={{ marginTop: 10 }}>
                <Text style={{ color: "#22c55e", marginBottom: 5 }}>
                  Correct Answer:
                </Text>

                <Text style={{ color: theme.colors.text }}>
                  {q.choices[q.correctAnswer]}
                </Text>

                {q.explanation && (
                  <Text style={{ color: theme.colors.subtext, marginTop: 10 }}>
                    {q.explanation}
                  </Text>
                )}

                <Pressable
                  onPress={() => removeQuestion(q.id)}
                  style={{
                    marginTop: 15,
                    backgroundColor: "#ef4444",
                    padding: 10,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: "white", textAlign: "center" }}>
                    Mark as Learned
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}