import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const isServer = typeof window === "undefined";
const isWeb = Platform.OS === "web";

// Only use AsyncStorage on native apps.
// During web/static export, disable persistence so Expo export does not crash.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: !isWeb && !isServer ? AsyncStorage : undefined,
    autoRefreshToken: !isWeb && !isServer,
    persistSession: !isWeb && !isServer,
    detectSessionInUrl: false,
  },
});