const testSupabase = async () => {
  try {
    console.log("TEST START");

    // 🔥 LAZY LOAD (THIS FIXES CRASH)
    const { supabase } = await import("@/lib/supabase");

    const { error } = await supabase
      .from("exam_history")
      .select("id")
      .limit(1);

    if (error) {
      console.log("SAFE ERROR:", error.message);
    } else {
      console.log("SAFE SUCCESS");
    }
  } catch (e) {
    console.log("SAFE CRASH:", e);
  }
};