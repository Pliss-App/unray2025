import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: "com.unrayapp.app",
  appName: "Un Ray",
  webDir: "www",
  bundledWebRuntime: false,
  plugins: {
    GoogleMaps: {
      apiKey: {
        android: 'AIzaSyCdS2NwR42Mk9uTeKeOKKlipcCRhpHtdV8',
        ios: 'AIzaSyCdS2NwR42Mk9uTeKeOKKlipcCRhpHtdV8',
      }
    },

    /* SplashScreen: {
       launchShowDuration: 3000, // Duración en milisegundos
       backgroundColor: '#ffffff', // Color de fondo
       androidScaleType: 'CENTER_CROP', // Escalado en Android
       splashFullScreen: true, // Pantalla completa
     },*/

     SplashScreen: {
      launchShowDuration: 3000, // Tiempo de duración del splash en ms
      backgroundColor: "#ffffff", // Color de fondo
      androidSplashResourceName: "splash",
      showSpinner: false // Ocultar el spinner de carga
    },

    Geolocation: {
      androidPermission: "fine"
    },
    Camera: {
      permissions: ['camera', 'photos'],
    },
    OneSignal: {
      appId: '9e1814a7-d611-4c13-b6e4-fa16fafc21e3', // Reemplaza con tu APP ID de OneSignal
      //safari_web_id: 'safari_web_id', // Si usas Safari (opcional)
      autoRegister: true,
      inAppLaunchURL: true,
      googleProjectNumber: '524176191412',
      notificationIcon: 'assets/marker/icon.png', // Ruta del icono
    }

  }
};

export default config;
