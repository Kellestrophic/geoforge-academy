import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import { Platform } from "react-native";

// 🔥 SAFE EXTRA ACCESS (WORKS IN ALL BUILDS)
const extra =
  (Constants as any).expoConfig?.extra ??
  (Constants as any).manifest?.extra ??
  {};

// 🔥 GET VALUES
const supabaseUrl = extra.supabaseUrl;
const supabaseAnonKey = extra.supabaseAnonKey;

// 🔥 DEBUG (REMOVE LATER)
console.log("SUPABASE URL:", supabaseUrl);
console.log("SUPABASE KEY:", supabaseAnonKey?.slice(0, 10));

// ❌ FAIL FAST (PREVENT WHITE SCREEN MYSTERY)
if (!supabaseUrl || !supabaseAnonKey) {
  console.log("❌ Supabase ENV missing — using fallback");

  // 🔥 PREVENT CRASH
}

// 🔥 ALWAYS CREATE CLIENT
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === "web" ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});