import { supabase } from "./supabase";

export async function trackActivity(mode: string, minutes = 1) {
  try {
    const { data: session } = await supabase.auth.getSession();
    const user = session?.session?.user;

    if (!user) return;

    await supabase.from("daily_activity").insert({
      user_id: user.id,
      mode,
      minutes,
    });
  } catch (e) {
    console.log("ACTIVITY ERROR:", e);
  }
}