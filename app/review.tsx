import { isProUser } from "@/lib/pro";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
export default function ReviewMenu() {
  const [count, setCount] = useState(0);
  const tapLock = useRef(false);
const [isPro, setIsPro] = useState(false);
 useEffect(() => {
  async function loadReview() {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) return;

    const { data } = await supabase
      .from("review_questions")
      .select("*")
      .eq("user_id", userId);

    setCount(data?.length || 0);
  }

  loadReview();
}, []);
useEffect(() => {
  async function checkPro() {
    const value = await isProUser();
    setIsPro(value);
  }

  checkPro();
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
      {/* HEADER */}
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 26,
          fontWeight: "bold",
          marginBottom: 10,
        }}
      >
        Review Mode
      </Text>

      <Text style={{ color: theme.colors.subtext, marginBottom: 30 }}>
        {count} questions to review
      </Text>

      {/* REVIEW QUIZ */}
      <Pressable
        onPress={() => {
  if (!isPro) {
    router.push("/upgrade" as any);
    return;
  }
  router.push("/review-quiz" as any);
}}
        style={{
        borderWidth: 2,
borderColor: theme.colors.border,
          padding: 20,
          borderRadius: 14,
          marginBottom: 15,
        }}
      >
        <Text style={{ color: theme.colors.text, fontSize: 16 }}>
          Review Quiz
        </Text>
        <Text style={{ color: theme.colors.subtext }}>
          Practice only missed questions
        </Text>
      </Pressable>

      {/* STUDY MODE */}
      <Pressable
       onPress={() => {
  if (!isPro) {
    router.push("/upgrade" as any);
    return;
  }
  router.push("/review-list" as any);
}}
        style={{
          borderWidth: 2,
borderColor: theme.colors.border,
          padding: 20,
          borderRadius: 14,
        }}
      >
        <Text style={{ color: theme.colors.text, fontSize: 16 }}>
          Study Answers
        </Text>
        <Text style={{ color: theme.colors.subtext }}>
          View correct answers only
        </Text>
      </Pressable>
    </View>
  );
}