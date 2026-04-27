import { supabase } from "@/lib/supabase";

export async function saveWrongQuestion(question: any) {
  try {
    let user: any = null;

    // ✅ SAFE USER GET
    try {
      const res = await supabase.auth.getUser();
      user = res?.data?.user ?? null;
    } catch (e) {
      console.log("❌ getUser failed", e);
      return; // 🔥 HARD STOP
    }

    if (!user || !user.id) {
      console.log("⚠️ No user — skip saving wrong");
      return;
    }

    // ✅ SAFE DUPLICATE CHECK
    let existing: any = null;

    try {
      const res = await supabase
        .from("wrong_questions")
        .select("id")
        .eq("user_id", user.id)
        .eq("question", question?.question ?? "")
        .maybeSingle();

      existing = res?.data ?? null;
    } catch (e) {
      console.log("❌ duplicate check failed", e);
    }

    if (existing) return;

    // ✅ SAFE INSERT
    try {
      await supabase.from("wrong_questions").insert({
        user_id: user.id,
        question: question?.question ?? "",
        choices: Array.isArray(question?.choices)
          ? question.choices
          : [],
        correct_answer:
          typeof question?.correctAnswer === "number"
            ? question.correctAnswer
            : null,
        type: question?.type ?? "multiple_choice",
        explanation: question?.explanation ?? "",
        created_at: new Date().toISOString(),
      });

      console.log("💾 Saved wrong question");
    } catch (e) {
      console.log("❌ insert failed", e);
    }

  } catch (e) {
    console.log("❌ saveWrongQuestion crash prevented", e);
  }
}