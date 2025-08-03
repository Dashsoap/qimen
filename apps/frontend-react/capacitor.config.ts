import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.guiguqimen.react.app',
  appName: '云丁未奇门遁甲',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    cleartext: true,
    allowNavigation: [
      '101.201.148.8:3001',
      'http://101.201.148.8:3001',
      'https://101.201.148.8:3001',
      'localhost:3001',
      'http://localhost:3001',
      '127.0.0.1:3001',
      'http://127.0.0.1:3001',
      '10.0.2.2:3001',
      'http://10.0.2.2:3001'
    ]
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    appendUserAgent: 'YunqueQimen-React/1.0',
    backgroundColor: '#000022'
  },
  ios: {
    allowsLinkPreview: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000022',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      splashFullScreen: true,
      splashImmersive: true
    },
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config; 