import { unlockPro } from "@/lib/pro";
import { router } from "expo-router";
import { useRef } from "react";
import { Pressable, Text, View } from "react-native";
import Purchases from "react-native-purchases";

export default function UpgradeScreen() {
  const tapLock = useRef(false);

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#0f172a", justifyContent: "center" }}>

      <Text style={{ color: "white", fontSize: 26, fontWeight: "bold" }}>
        Go Pro
      </Text>

      <Text style={{ color: "#94a3b8", marginTop: 10 }}>
        Unlock full GeoForge experience:
      </Text>

      <Text style={{ color: "white", marginTop: 20 }}>
        • PG Exam Mode{"\n"}
        • Unlimited questions{"\n"}
        • Advanced study tools{"\n"}
        • All future modes and features 
      </Text>
<Pressable
  onPress={async () => {
    try {
      const info = await Purchases.restorePurchases();

      if (info.entitlements.active["pro"]) {
        await unlockPro();
        router.replace("/modes");
      }
    } catch (e) {
      console.log("Restore error:", e);
    }
  }}
  style={{ marginTop: 15 }}
>
  <Text style={{ color: "#94a3b8", textAlign: "center" }}>
    Restore Purchases
  </Text>
</Pressable>
      <Pressable
   onPress={async () => {
  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;

    if (!current || current.availablePackages.length === 0) {
      console.log("No packages found");
      return;
    }

    const purchase = await Purchases.purchasePackage(
      current.availablePackages[0]
    );

    const isPro =
      purchase.customerInfo.entitlements.active["pro"] !== undefined;

    if (isPro) {
      console.log("✅ Pro unlocked");

      await unlockPro(); // sync to Supabase

      router.replace("/modes");
    }
  } catch (e) {
    console.log("Purchase error:", e);
  }
}}
        style={{
          marginTop: 30,
          backgroundColor: "#7c3aed",
          padding: 15,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Unlock Pro (Test)
        </Text>
      </Pressable>

    </View>
  );
}