import { supabase } from "./supabase";

export async function saveScore(score: number, type: string) {
  try {
    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id;

    if (!userId) {
      console.log("NO USER");
      return;
    }

    const { error } = await supabase.from("exam_history").insert({
      user_id: userId,
      score: Number(score) || 0,
      type: typeof type === "string" ? type : "random",
    });

    if (error) {
      console.log("SAVE ERROR:", error);
    } else {
      console.log("SAVED:", score, type);
    }
  } catch (e) {
    console.log("SAVE CRASH:", e);
  }
}