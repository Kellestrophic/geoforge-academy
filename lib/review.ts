import { supabase } from "@/lib/supabase";

export async function saveWrongQuestion(question: any) {
  try {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;

    const { data: insertData, error } = await supabase
      .from("wrong_questions")
      .insert({
        user_id: user.id,
        question_id: question.id,
        question: question,
      })
      .select();

    console.log("WRONG INSERT DATA:", insertData);
    console.log("WRONG INSERT ERROR:", error);
  } catch (e) {
    console.log("SAVE WRONG ERROR:", e);
  }
}