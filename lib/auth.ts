import { supabase } from "./supabase";

export async function signInAnon() {
  // 🔥 CHECK FOR EXISTING SESSION FIRST
  const { data: sessionData } = await supabase.auth.getSession();

  if (sessionData.session?.user) {
    console.log("Reusing user:", sessionData.session.user.id);
    return sessionData.session.user;
  }

  // 🔥 ONLY CREATE NEW USER IF NONE EXISTS
  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    console.log("Auth error:", error);
    return null;
  }

  console.log("New user created:", data.user?.id);

  return data.user;
}