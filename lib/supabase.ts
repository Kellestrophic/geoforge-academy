import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

let supabaseInstance: any = null;

export function getSupabase() {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl =
    Constants.expoConfig?.extra?.supabaseUrl ?? "";

  const supabaseAnonKey =
    Constants.expoConfig?.extra?.supabaseAnonKey ?? "";

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("❌ Supabase config missing");
    return null;
  }

  console.log("✅ Creating Supabase instance");

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (...args) => fetch(...args),
    },
  });

  return supabaseInstance;
}