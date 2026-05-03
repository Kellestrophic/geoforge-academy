import { getSupabase } from "./supabase";

export async function trackActivity(mode: string, minutes: number = 1) {
  try {
    const supabase = getSupabase();
    if (!supabase) return;

    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) {
      console.log("❌ NO USER FOR ACTIVITY");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase.from("daily_activity").insert([
      {
        user_id: user.id,
        date: today, // ✅ MUST MATCH YOUR TABLE
        activity: mode, // ✅ column name is "activity"
        minutes: minutes || 1,
      },
    ]);

    if (error) {
      console.log("❌ ACTIVITY INSERT ERROR:", error);
    } else {
      console.log("✅ ACTIVITY SAVED");
    }
  } catch (e) {
    console.log("❌ ACTIVITY CRASH:", e);
  }
}