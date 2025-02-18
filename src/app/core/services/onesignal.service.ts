import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
//import { OneSignal } from 'onesignal-ngx';
//import { OneSignal } from '@ionic-native/onesignal/ngx';
import OneSignal from 'onesignal-cordova-plugin';
import { UserService } from './user.service';
import { ApiService } from './api.service';
//import { OneSignal, OSNotificationPayload } from '@ionic-native/onesignal/ngx'; 
@Injectable({
  providedIn: 'root'
})
export class OnesignalService {

  private appId = '9e1814a7-d611-4c13-b6e4-fa16fafc21e3'; // Reemplaza con tu OneSignal App ID
  private googleProjectNumber = '524176191412'; // Solo si usas FCM

  constructor(private api: UserService, private platform: Platform, private apiService: ApiService/*, private oneSignal:  OneSignal*/) {
    // this.initialize();
  }

  async initialize(item: any, id: any) {

    if (this.platform.is('cordova')) {
      OneSignal.initialize(this.appId);

      // Obtener el userId de OneSignal (playerId)
      OneSignal.User.pushSubscription.getIdAsync().then((resp) => {
        var data = {
          id: id,
          token: resp
        }
        this.api.updateTokenOneSignal(data);
      })

      OneSignal.User.addTag(`notif-${item}`, "true");

      // Manejar la recepción de notificaciones
      OneSignal.Notifications.addEventListener("foregroundWillDisplay", (event: any) => {
        console.log("Notificación recibida en primer plano:", event);
        event.preventDefault();
        event.notification.display();
      });
      // Manejar cuando se abre una notificación
      OneSignal.Notifications.addEventListener("click", (event) => {
        console.log("Notificación abierta:", event);
        // Aquí puedes redirigir a una página específica
      });
    } else {
      console.log('❌ No está corriendo con Cordova.');
    }
  }

  enviarNotificacion(data: any) {
    return this.apiService.post('viaje/send-notification', data);
  }

  


  getToken(id: any) {
    return this.apiService.get(`viaje/get-token/${id}`);
  }
}
