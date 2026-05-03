export async function saveExam(score: number, type: string, topic?: string) {
  try {
    const { getSupabase } = await import("./supabase");
    const supabase = getSupabase();

    if (!supabase) {
      console.log("❌ No Supabase");
      return;
    }

    // 🔥 GET OR CREATE USER
    let { data: sessionData } = await supabase.auth.getSession();
    let user = sessionData?.session?.user;

    if (!user) {
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        console.log("❌ AUTH ERROR:", error);
        return;
      }

      user = data.user;
    }

    // 🔥 SAVE
    const { error } = await supabase.from("exam_history").insert({
      user_id: user.id,
      score: Number(score) || 0,
      type: typeof type === "string" ? type : "random",
      topic: topic || null,
    });

    if (error) {
      console.log("❌ SAVE ERROR:", error);
    } else {
      console.log("✅ EXAM SAVED");
    }
  } catch (e) {
    console.log("🔥 SAVE CRASH:", e);
  }
}