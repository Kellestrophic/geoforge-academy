import { supabase } from "./supabase";

export async function initUser() {
  try {
    const { data } = await supabase.auth.getUser();

    if (data?.user) return data.user;

    const { data: signInData, error } =
      await supabase.auth.signInAnonymously();

    if (error) {
      console.log("Auth error:", error);
      return null;
    }

    return signInData.user;
  } catch (e) {
    console.log("INIT USER ERROR:", e);
    return null;
  }
}