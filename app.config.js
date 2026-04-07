export default ({ config }) => ({
  ...config,

  android: {
    package: "com.anonymous.geoforgeacademy",
  },

  extra: {
    eas: {
      projectId: "54b2831a-4d0a-4d91-a189-a58afe3c3557",
    },

    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
});