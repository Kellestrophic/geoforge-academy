import { unlockPro } from "@/lib/pro";
import { initPurchases } from "@/lib/purchases";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Purchases from "react-native-purchases";


export default function UpgradeScreen() {
  const tapLock = useRef(false);
const [debugText, setDebugText] = useState("");
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
  await initPurchases(); // 🔥 ADD THIS
const info = await Purchases.restorePurchases();
    const entitlements = info?.entitlements?.active ?? {};

if (entitlements["GeoForge Pro"]) {
  try {
    console.log("🔥 restore → calling unlockPro...");
    await unlockPro();
    console.log("✅ restore unlock success");
  } catch (e) {
    console.log("❌ restore unlock failed:", e);
  }

  setTimeout(() => {
    router.replace("/modes");
  }, 300);
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
    await initPurchases(); // 🔥 ADD THIS
const offerings = await Purchases.getOfferings();

const debug = {
  current: offerings.current,
  packages: offerings.current?.availablePackages
};

console.log("DEBUG:", debug);

setDebugText(JSON.stringify(debug, null, 2));

console.log("OFFERINGS:", offerings);
    
    const current = offerings.current;

    if (!current || current.availablePackages.length === 0) {
      console.log("No packages found");
      return;
    }

    const purchase = await Purchases.purchasePackage(
      current.availablePackages[0]
    );

const entitlements = purchase?.customerInfo?.entitlements?.active ?? {};

console.log("ENTITLEMENTS:", entitlements);

const isPro = !!entitlements["GeoForge Pro"];

if (isPro) {
  console.log("✅ Pro unlocked");

  try {
    console.log("🔥 calling unlockPro...");
    await unlockPro();
    console.log("✅ unlockPro success");
  } catch (e) {
    console.log("❌ unlockPro failed:", e);
  }

  setTimeout(() => {
    router.replace("/modes");
  }, 300);
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
          Unlock Pro 
                  </Text>
      </Pressable>
<Text style={{ color: "white", marginTop: 20 }}>
  {debugText}
</Text>
    </View>
  );
}