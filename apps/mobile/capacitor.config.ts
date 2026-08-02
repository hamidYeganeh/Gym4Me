import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.gym4me.app",
  appName: "Gym4Me",
  webDir: "out",
  backgroundColor: "#1f1f1f",
  server: {
    androidScheme: "https",
  },
  android: {
    backgroundColor: "#1f1f1f",
  },
  ios: {
    backgroundColor: "#1f1f1f",
    scheme: "Gym4Me",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#1fff6f",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      // Overlay so CSS `env(safe-area-inset-*)` owns notch / status bar spacing
      overlaysWebView: true,
      // Light icons/text for dark brand background
      style: "LIGHT",
      backgroundColor: "#1f1f1f",
    },
  },
};

export default config;
