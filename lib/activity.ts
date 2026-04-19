import { supabase } from "@/lib/supabase";

export async function trackActivity(type: string, minutes = 1) {
  try {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];

    // 🔥 check if row exists for same day + activity
    const { data: existing } = await supabase
      .from("daily_activity")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .eq("activity", type)
      .maybeSingle();

    if (existing) {
      // 🔥 update minutes
      await supabase
        .from("daily_activity")
        .update({
          minutes: existing.minutes + minutes,
        })
        .eq("id", existing.id);
    } else {
      // 🔥 create new row
      await supabase.from("daily_activity").insert({
        user_id: user.id,
        date: today,
        activity: type,
        minutes,
      });
    }

    console.log("📊 Activity tracked:", type);
  } catch (e) {
    console.log("TRACK ACTIVITY ERROR:", e);
  }
}