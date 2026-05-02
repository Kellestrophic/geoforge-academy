import { supabase } from "./supabase";

export async function saveExam(
  score: number,
  type: string,
  topic?: string
) {
  try {
    const { data: session } = await supabase.auth.getSession();
    const user = session?.session?.user;

    if (!user) {
      console.log("❌ NO USER");
      return;
    }

    const { error } = await supabase.from("exam_history").insert({
      user_id: user.id,
      score,
      type,
      topic: topic || null,
    });

    if (error) {
      console.log("❌ SAVE ERROR:", error);
    } else {
      console.log("✅ EXAM SAVED");
    }
  } catch (e) {
    console.log("❌ SAVE CRASH:", e);
  }
}