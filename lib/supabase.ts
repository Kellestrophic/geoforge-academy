import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
let supabaseInstance: any = null;

export function getSupabase() {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = "https://riszrgbaldqolomvxuro.supabase.co";
  const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc3pyZ2JhbGRxb2xvbXZ4dXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NzMzNzMsImV4cCI6MjA5MjA0OTM3M30.XRUeStK4HOICzjTOShs02ydtob5U85yt6W7uatREgKg";

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("❌ STILL MISSING");
    return null;
  }

  console.log("🔥 SUPABASE FORCED INIT");

supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: AsyncStorage, // 🔥 REQUIRED
  },
  global: {
    fetch: (...args) => fetch(...args),
  },
});

  return supabaseInstance;
}