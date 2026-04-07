export default {
  expo: {
    updates: {
      url: "https://u.expo.dev/54b2831a-4d0a-4d91-a189-a58afe3c3557",
    },

    runtimeVersion: {
      policy: "appVersion",
    },

    extra: {
      eas: {
        projectId: "54b2831a-4d0a-4d91-a189-a58afe3c3557",
      },

      // 🔥 THIS IS WHAT FIXES YOUR SUPABASE ISSUE
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
  },
};