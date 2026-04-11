import { createClient } from "@supabase/supabase-js";

let client: any = null;

export async function getSupabase() {
  if (client) return client;

  try {
    client = createClient(
      "https://umucokzpurfkopvqhymz.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtdWNva3pwdXJma29wdnFoeW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0ODcyMTgsImV4cCI6MjA5MDA2MzIxOH0.mli4hOy4yHLTD6UEVyPtfrkAYPBRFvdFFQ4wSqiUW5w",
      {
        auth: {
          storage: undefined,
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    console.log("✅ Supabase initialized safely");

    return client;
  } catch (e) {
    console.log("❌ Supabase init failed:", e);
    return null;
  }
}