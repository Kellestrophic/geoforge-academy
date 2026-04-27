import { supabase } from "@/lib/supabase";

export async function trackActivity(type: string, minutes = 1) {
  try {
    // 🔥 SAFE USER GET
    let user: any = null;

    try {
      const response = await supabase.auth.getUser();

      if (
        response &&
        response.data &&
        response.data.user &&
        typeof response.data.user.id === "string"
      ) {
        user = response.data.user;
      }
    } catch (e) {
      console.log("❌ getUser crash prevented:", e);
      return; // 🔥 HARD STOP
    }

    if (!user) {
      console.log("⚠️ No user — skipping activity");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    // 🔥 SAFE FETCH EXISTING
    let existing: any = null;

    try {
      const res = await supabase
        .from("daily_activity")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .eq("activity", type)
        .maybeSingle();

      existing = res?.data ?? null;
    } catch (e) {
      console.log("❌ fetch existing crash prevented:", e);
    }

    if (existing && existing.id) {
      // 🔥 SAFE UPDATE
      try {
        await supabase
          .from("daily_activity")
          .update({
            minutes: Number(existing.minutes || 0) + minutes,
          })
          .eq("id", existing.id);
      } catch (e) {
        console.log("❌ update crash prevented:", e);
      }
    } else {
      // 🔥 SAFE INSERT
      try {
        await supabase.from("daily_activity").insert({
          user_id: user.id,
          date: today,
          activity: type,
          minutes,
        });
      } catch (e) {
        console.log("❌ insert crash prevented:", e);
      }
    }

    console.log("📊 Activity tracked:", type);
  } catch (e) {
    console.log("TRACK ACTIVITY ERROR:", e);
  }
}