import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';


// @ts-ignore
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
// import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Camera } from '@awesome-cordova-plugins/camera/ngx';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { LaunchNavigator} from '@awesome-cordova-plugins/launch-navigator/ngx';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { LocationService } from './core/services/location.service';
//import { OneSignal } from "@ionic-native/onesignal/ngx";
// import { OneSignal } from '@awesome-cordova-plugins/onesignal';
import { Vibration } from '@awesome-cordova-plugins/vibration/ngx';
const config: SocketIoConfig = {
  url: 'http://localhost:3000', // Asegúrate de poner la URL correcta de tu backend
  options: {},
};

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(),  SocketIoModule.forRoot(config), AppRoutingModule, HttpClientModule,    SharedModule ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy, },Vibration, LocationAccuracy, BackgroundMode , LaunchNavigator, CallNumber /*, OneSignal*/,AndroidPermissions, LocationService, Geolocation, Camera],
  bootstrap: [AppComponent],
})
export class AppModule {}
