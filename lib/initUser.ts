export async function initUser() {
  console.log("🔐 INIT USER START");

  try {
    const { getSupabase } = await import("./supabase");
    const supabase = getSupabase();

    if (!supabase) return null;

    const { data: sessionData } = await supabase.auth.getSession();

    if (sessionData?.session?.user) {
      console.log("✅ EXISTING USER:", sessionData.session.user.id);
      return sessionData.session.user;
    }

    console.log("🚨 NO SESSION → CREATING USER");

    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      console.log("❌ SIGN IN ERROR:", error);
      return null;
    }

    if (!data?.user) {
      console.log("❌ NO USER RETURNED");
      return null;
    }

    console.log("🔥 CREATED USER:", data.user.id);

    return data.user;
  } catch (e) {
    console.log("❌ AUTH CRASH:", e);
    return null;
  }
}