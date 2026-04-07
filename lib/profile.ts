import { supabase } from "./supabase";

export async function ensureProfile() {
  try {
    const response = await supabase.auth.getUser();
    const user = response?.data?.user;

    if (!user) return;

    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        xp: 0,
        streak: 0,
      },
      { onConflict: "id" }
    );

    if (error) {
      console.log("Profile upsert error:", error);
    }
  } catch (e) {
    console.log("ensureProfile crash:", e);
  }
}