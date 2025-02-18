import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: "com.unrayapp.app",
  appName: "Un Ray",
  webDir: "www",
  bundledWebRuntime: false,
  plugins: {
    Geolocation: {
      androidPermission: "fine"
    }
  }
};

export default config;
