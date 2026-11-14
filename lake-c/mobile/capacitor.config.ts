import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'br.unemat.lakec',
  appName: 'LAKE-C Campo',
  webDir: 'www',
  bundledWebRuntime: false,
  android: { allowMixedContent: false },
  ios: {
    contentInset: 'automatic',
    appendUserAgent: ' LAKECField/1.0'
  }
};
export default config;
