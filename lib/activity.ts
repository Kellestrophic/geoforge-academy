export async function trackActivity(mode: string, minutes: number = 1) {
  try {
    const { getSupabase } = await import("@/lib/supabase");
    const supabase = getSupabase();

    if (!supabase) return;

    const { data } = await supabase.auth.getUser();
    const user = data?.user;

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