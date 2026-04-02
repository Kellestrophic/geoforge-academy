import { supabase } from "@/lib/supabase";

export async function isProUser() {
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;

  if (!userId) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_pro")
    .eq("id", userId)
    .single();

  return profile?.is_pro === true;
}

export async function unlockPro() {
  console.log("🔥 unlockPro START");

  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;

  if (!userId) {
    console.log("❌ No user ID");
    return;
  }

  const { data: result, error } = await supabase
    .from("profiles")
    .update({ is_pro: true })
    .eq("id", userId)
    .select();

  console.log("🔥 unlockPro RESULT:", { result, error });

  if (error) {
    throw error;
  }
}
export async function requirePro() {
  const isPro = await isProUser();
  return isPro;
}