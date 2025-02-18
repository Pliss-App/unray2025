import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuController, NavController, Platform } from '@ionic/angular';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';
import { IonRouterOutlet } from '@ionic/angular';
import { UserService } from './core/services/user.service';
import { LocationService } from './core/services/location.service';
import { SolicitudService } from './core/services/solicitud.service';
import { OnesignalService } from './core/services/onesignal.service';
import { Vibration } from '@awesome-cordova-plugins/vibration/ngx';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild(IonRouterOutlet) routerOutlet?: IonRouterOutlet;
  user: any = null;
  constructor(
    private soli: SolicitudService, private backgroundMode: BackgroundMode,
    private locationService: LocationService,
    private userService: UserService,
    private navCtrl: NavController,
    private menuCtrl: MenuController,
    private platform: Platform,
    private authService: AuthService,
    private location: LocationService, private locationAccuracy: LocationAccuracy,
    private router: Router, private androidPermissions: AndroidPermissions) {

  }

  ngOnInit() {
    //await this.location. startBackgroundLocation();
    this.platform.ready().then(async () => {
      this.requestHighAccuracy();
      this.initializeApp();
    });
  }

  initializeApp() {
    const isAuthenticated = this.authService.isAuthenticated();
    const userRole = this.authService.getRole();
    const currentUrl = this.router.url;
    if (isAuthenticated) {

      this.user = this.authService.getUser();
      console.log("USER ", this.user)
      // Solo redirige al módulo principal si el usuario no está ya en una ruta interna válida
      if (userRole === 'usuario' && !currentUrl.startsWith('/user')) {

        this.menuCtrl.enable(true, 'userMenu');
        this.menuCtrl.enable(false, 'driverMenu');
        this.soli.startPolling();
        //await this.onesignal.initialize(userRole, this.user.idUser);
        this.router.navigate(['/user'], { replaceUrl: true });
      } else if (userRole === 'conductor' && !currentUrl.startsWith('/driver')) {

        this.soli.startPolling();
        this.menuCtrl.enable(true, 'driverMenu');
        this.menuCtrl.enable(false, 'userMenu');
        //await this.onesignal.initialize(userRole, this.user.idUser);
        this.router.navigate(['/driver'], { replaceUrl: true });
      }
      //  this.locationService.startTracking(this.user.idUser);
    } else {
      this.menuCtrl.enable(false, 'userMenu');
      this.menuCtrl.enable(false, 'driverMenu');
      // Redirige a la autenticación si no está autenticado
      this.router.navigate(['/auth'], { replaceUrl: true });
    }

    // Inicialización en segundo plano
    this.initializeBackgroundServices();
  }

  async requestHighAccuracy() {
    try {
      const canRequest = await this.locationAccuracy.canRequest();
      if (canRequest) {
        await this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
        console.log('Ubicación activada en alta precisión');
      }
    } catch (error) {
      console.error('Error activando GPS:', error);
    }
  }

  async initializeBackgroundServices() {
    await this.location.getUserLocation();
    this.location.checkPermissions();
    this.backgroundMode.enable();
    // await this.onesignal.initialize(userRole, this.user.idUser);
  }

  logout() {
    this.menuCtrl.close();
    this.authService.logout();

  }

  closeMenu(item: any) {

    /*if (item == 'viajar') {
      window.location.reload();
      // this.routerOutlet?.pop(); 
      /*  this.router.navigateByUrl('/user/profile', { skipLocationChange: true }).then(() => {
         this.router.navigate(['/user']);
       });*/
    // } else {

    // } */
    this.menuCtrl.close();

  }
}
