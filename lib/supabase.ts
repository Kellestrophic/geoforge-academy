import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const supabaseUrl =
  Constants.expoConfig?.extra?.supabaseUrl ?? "";

const supabaseAnonKey =
  Constants.expoConfig?.extra?.supabaseAnonKey ?? "";

// 🔥 SAFETY CHECK (prevents crash)
if (!supabaseUrl || !supabaseAnonKey) {
  console.log("❌ Supabase config missing");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,       // 🔥 REQUIRED
    autoRefreshToken: false,     // 🔥 REQUIRED
    detectSessionInUrl: false,
  },
  global: {
    fetch: (...args) => fetch(...args), // 🔥 Hermes-safe fetch
  },
});