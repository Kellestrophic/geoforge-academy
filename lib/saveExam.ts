import { getSupabase } from "./supabase";

export async function saveExam(score: number, type: string, topic?: string) {
  try {
    console.log("🔥 SAVE EXAM START");

    const supabase = getSupabase();
    if (!supabase) {
      console.log("❌ NO SUPABASE INSTANCE");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      console.log("❌ NO USER FOUND");
      return;
    }

    console.log("✅ USER:", user.id);

    const { error } = await supabase.from("exam_history").insert({
      user_id: user.id,
      score: Number(score),
      type: type || "random",
      topic: topic || null,
    });

    if (error) {
      console.log("❌ INSERT ERROR:", error.message);
    } else {
      console.log("✅ EXAM SAVED");
    }
  } catch (e) {
    console.log("❌ SAVE CRASH:", e);
  }
}