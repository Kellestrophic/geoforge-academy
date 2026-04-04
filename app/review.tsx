import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function ReviewMenu() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function loadReview() {
      try {
        const response = await supabase.auth.getUser();
        const userId = response.data.user?.id;

        if (!userId) return;

        const { data } = await supabase
          .from("review_questions")
          .select("*")
          .eq("user_id", userId);

        setCount(data?.length || 0);
      } catch (e) {
        console.log("❌ Review load error:", e);
      }
    }

    loadReview();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        justifyContent: "center",
        backgroundColor: theme.colors.background,
      }}
    >
      <Text style={{ color: theme.colors.text, fontSize: 26, marginBottom: 10 }}>
        Review Mode
      </Text>

      <Text style={{ color: theme.colors.subtext, marginBottom: 30 }}>
        {count} questions to review
      </Text>

      <Pressable
        onPress={() => router.push("/review-quiz")}
        style={{ borderWidth: 2, borderColor: theme.colors.border, padding: 20, borderRadius: 14, marginBottom: 15 }}
      >
        <Text style={{ color: theme.colors.text }}>Review Quiz</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/review-list")}
        style={{ borderWidth: 2, borderColor: theme.colors.border, padding: 20, borderRadius: 14 }}
      >
        <Text style={{ color: theme.colors.text }}>Study Answers</Text>
      </Pressable>
    </View>
  );
}