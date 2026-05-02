import { supabase } from "./supabase";

export async function ensureUser() {
  try {
    // 1. check existing session
    const { data: sessionData } = await supabase.auth.getSession();

    if (sessionData?.session?.user) {
      return sessionData.session.user;
    }

    // 2. sign in anonymously
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      console.log("❌ SIGN IN ERROR:", error);
      return null;
    }

    return data.user;
  } catch (e) {
    console.log("❌ AUTH CRASH:", e);
    return null;
  }
}