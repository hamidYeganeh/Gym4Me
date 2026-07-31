import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.gym4me.app",
  appName: "Gym4Me",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
    },
    StatusBar: {
      style: "DEFAULT",
    },
  },
};

export default config;
