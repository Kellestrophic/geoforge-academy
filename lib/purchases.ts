import { supabase } from "@/lib/supabase";
import { Platform } from "react-native";
import Purchases from "react-native-purchases";


let configured = false;

export async function initPurchases() {
  if (configured) return;
  if (Platform.OS === "web") return;

  try {
    // ❌ DO NOT fetch session here
    // ✅ configure FIRST, attach user later

    await Purchases.configure({
      apiKey: "appl_snuDbfMxZUDwVrRvBTgEDGZgOpY",
    });

    configured = true;

    console.log("✅ Purchases configured");

    // 🔥 OPTIONAL: attach user AFTER config (safe)
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;

    if (userId) {
      await Purchases.logIn(userId);
      console.log("✅ Purchases logged in user:", userId);
    }

  } catch (e) {
    console.log("❌ Purchases config failed:", e);
  }
}