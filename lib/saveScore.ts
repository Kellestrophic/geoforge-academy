import { supabase } from "@/lib/supabase";

export async function saveScore(score: number, type: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const userId = user?.id ?? "anonymous";

    const { error } = await supabase
      .from("exam_history")
      .insert([
        {
          user_id: userId,
          score,
          type,
        },
      ]);

    if (error) {
      console.log("Save error:", error.message);
    }
  } catch (err) {
    console.log("Save crash prevented:", err);
  }
}