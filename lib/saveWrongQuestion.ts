export async function saveWrongQuestion(question: any) {
  try {
    const { getSupabase } = await import("@/lib/supabase");
    const supabase = getSupabase();

    if (!supabase) return;

    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) {
      console.log("❌ NO USER (WRONG SAVE)");
      return;
    }

    // 🔥 prevent duplicates
    const { data: existing } = await supabase
      .from("wrong_questions")
      .select("id")
      .eq("user_id", user.id)
      .eq("question_id", question.id)
      .maybeSingle();

    if (existing) return;

    await supabase.from("wrong_questions").insert([
      {
        user_id: user.id,
        question_id: question.id,
        question: question, // 🔥 full object
      },
    ]);

    console.log("💾 Saved wrong question:", question.id);
  } catch (e) {
    console.log("❌ SAVE WRONG FAIL", e);
  }
}