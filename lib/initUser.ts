import { supabase } from "@/lib/supabase";

export async function ensureUser() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user?.id) {
      return session.user.id;
    }

    // 🔥 FORCE ANONYMOUS LOGIN
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      console.log("❌ Anonymous login failed:", error);
      return null;
    }

    return data.user?.id ?? null;
  } catch (e) {
    console.log("❌ ensureUser crash:", e);
    return null;
  }
}