import { supabase } from "@/lib/supabase";

export async function saveWrongQuestion(question: any) {
  try {
    let user = null;

    try {
      const res = await supabase.auth.getUser();
      user = res?.data?.user ?? null;
    } catch (e) {
      console.log("❌ getUser failed", e);
    }

    if (!user) {
      console.log("⚠️ No user — skip saving wrong");
      return;
    }

    // 🔥 prevent duplicates
    const { data: existing } = await supabase
      .from("wrong_questions")
      .select("id")
      .eq("user_id", user.id)
      .eq("question", question.question)
      .maybeSingle();

    if (existing) return;

    await supabase.from("wrong_questions").insert({
      user_id: user.id,
      question: question.question,
      choices: question.choices,
      correct_answer: question.correctAnswer ?? null,
      type: question.type,
      explanation: question.explanation ?? "",
      created_at: new Date().toISOString(),
    });

    console.log("💾 Saved wrong question");
  } catch (e) {
    console.log("❌ saveWrongQuestion crash prevented", e);
  }
}