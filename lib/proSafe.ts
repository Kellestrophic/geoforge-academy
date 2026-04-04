import { isProUser as rawIsProUser, requirePro as rawRequirePro } from "@/lib/pro";

export async function safeIsProUser() {
  try {
    const result = await rawIsProUser();
    return !!result;
  } catch (e) {
    console.log("❌ safeIsProUser crash prevented:", e);
    return false;
  }
}

export async function safeRequirePro() {
  try {
    return await rawRequirePro();
  } catch (e) {
    console.log("❌ safeRequirePro crash prevented:", e);
    return false;
  }
}