import { supabase } from "@/lib/supabase";
import { router } from "expo-router";

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
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;

  if (!userId) return;

  await supabase
    .from("profiles")
    .update({ is_pro: true })
    .eq("id", userId);
}

export async function requirePro(route?: string) {
  const isPro = await isProUser();

  if (!isPro) {
    router.push("/upgrade" as any);
    return false;
  }

  if (route) {
    router.push(route as any);
  }

  return true;
}