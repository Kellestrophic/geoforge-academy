import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import { Platform } from "react-native";

// 🔥 SAFE EXTRA ACCESS
const extra =
  (Constants as any).expoConfig?.extra ??
  (Constants as any).manifest?.extra ??
  {};

// 🔥 ENV
const supabaseUrl = extra.supabaseUrl;
const supabaseAnonKey = extra.supabaseAnonKey;

// 🔥 DEBUG
console.log("SUPABASE URL:", supabaseUrl);
console.log("SUPABASE KEY:", supabaseAnonKey?.slice(0, 10));

// 🔥 CONDITIONAL STORAGE (THIS FIXES YOUR CRASH)
const storage =
  Platform.OS === "web" ? undefined : AsyncStorage;

// 🔥 CREATE CLIENT
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: Platform.OS !== "web",
    detectSessionInUrl: false,
  },
});