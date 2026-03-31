import { supabase } from "./supabase";

export async function ensureProfile() {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) return;

  // 🔥 CHECK IF PROFILE EXISTS
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!existing) {
    // 🔥 CREATE PROFILE
    await supabase.from("profiles").insert({
      id: user.id,
      xp: 0,
      streak: 0,
    });
  }
}