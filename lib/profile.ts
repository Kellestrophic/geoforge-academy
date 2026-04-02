import { supabase } from "./supabase";

export async function ensureProfile() {
let response;
try {
  response = await supabase.auth.getUser();
} catch (e) {
  console.log("getUser crash prevented:", e);
  return;
}

const user = response.data?.user;

  if (!user) return;

  // 🔥 CHECK IF PROFILE EXISTS
 const { data: existing, error } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", user.id)
  .maybeSingle(); // ✅ SAFE

// 🔥 If error, DO NOT crash app
if (error) {
  console.log("Profile fetch error:", error);
  return;
}

if (!existing) {
  const { error: insertError } = await supabase.from("profiles").insert({
    id: user.id,
    xp: 0,
    streak: 0,
  });

  if (insertError) {
    console.log("Profile insert error:", insertError);
  }
}
}