import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuController, NavController, Platform } from '@ionic/angular';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Preferences } from '@capacitor/preferences';
import { IonRouterOutlet } from '@ionic/angular';
import { UserService } from './core/services/user.service';
import { LocationService } from './core/services/location.service';
import { SolicitudService } from './core/services/solicitud.service';
import { OnesignalService } from './core/services/onesignal.service';
import { SplashScreen } from '@capacitor/splash-screen';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild(IonRouterOutlet) routerOutlet?: IonRouterOutlet;
  user: any = null;
  rating: any = null;
  stars: string[] = [];

  constructor(
    private soli: SolicitudService,
    private menuCtrl: MenuController,
    private platform: Platform,
    private authService: AuthService,
    private api: UserService,
   
    private router: Router) {

        // Mostrar la splash screen al inicio
    //SplashScreen.show();

    // Después de un tiempo, ocultarla (por ejemplo, 3 segundos)
  /*  setTimeout(() => {
      SplashScreen.hide();
    }, 3000); */
  }

  ngOnInit() {

    //await this.location. startBackgroundLocation();
    this.platform.ready().then(async () => {
      //  this.requestHighAccuracy();
      this.getSplash();
      this.initializeApp();
    });

    App.addListener('pause', () => {
      this.saveState();  // Guardar estado cuando se minimiza
    });

    App.addListener('resume', () => {
      this.restoreState();  // Restaurar estado cuando se reanuda
    });
  }

  getSplash(){
    SplashScreen.hide();
  }

  initializeApp() {
    // Inicialización en segundo plano
    // this.initializeBackgroundServices();
    
    const isAuthenticated = this.authService.isAuthenticated();
    const userRole = this.authService.getRole();
    const currentUrl = this.router.url;
    if (isAuthenticated) {

      this.user = this.authService.getUser();
      console.log("USER ", this.user)
      // Solo redirige al módulo principal si el usuario no está ya en una ruta interna válida
      if (userRole === 'usuario' && !currentUrl.startsWith('/user')) {

        if (this.user.verificacion != 0) {
          this.getRating()
          this.menuCtrl.enable(true, 'userMenu');
          this.menuCtrl.enable(false, 'driverMenu');

          this.soli.startPolling();
          this.router.navigate(['/user'], { replaceUrl: true });
        } else {
          
          this.router.navigate(['/auth/verificacion'], { replaceUrl: true });
          this.menuCtrl.enable(false, 'userMenu');
          this.menuCtrl.enable(false, 'driverMenu');
        }
      } else if (userRole === 'conductor' && !currentUrl.startsWith('/driver')) {
        this.getRating()
        this.soli.startPolling();
        this.menuCtrl.enable(true, 'driverMenu');
        this.menuCtrl.enable(false, 'userMenu');
        this.router.navigate(['/driver'], { replaceUrl: true });
      }
    } else {
      this.menuCtrl.enable(false, 'userMenu');
      this.menuCtrl.enable(false, 'driverMenu');
      // Redirige a la autenticación si no está autenticado
      this.router.navigate(['/auth'], { replaceUrl: true });
    }


  }
  /*
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
    } */
  /*
    async initializeBackgroundServices() {
      this.location.checkPermissions();
      await this.location.getUserLocation();
  
      this.backgroundMode.enable();
      // await this.onesignal.initialize(userRole, this.user.idUser);
    }
  */

  getRating() {

    try {
      this.api.getRating(this.user.idUser).subscribe((re) => {
        if (re.msg == 'SUCCESSFULLY') {
          this.rating = re.result;
          this.updateStars(this.rating.rating);
          return 0;
        } else {
          return 1;
        }
      })
    } catch (error) {
      console.log("error consultando Rating")
    }

  }


  updateStars(valor: number) {
    this.stars = Array(5)
      .fill('star-outline')
      .map((_, i) => {
        if (i < Math.floor(valor)) {
          return 'star'; // Estrella llena
        } else if (i < valor) {
          return 'star-half'; // Estrella a la mitad
        } else {
          return 'star-outline'; // Estrella vacía
        }
      });
  }
  logout() {
    this.menuCtrl.close();
    this.authService.logout();

  }



  closeMenu(item: any) {
    if (item == 'viajar') {
      window.location.reload();
    } else if (item == 'inicio'){
      window.location.reload();
    }

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


  async saveState() {
    const currentRoute = this.router.url;  // Obtiene la URL actual
    await Preferences.set({ key: 'lastRoute', value: currentRoute });
  }

  async restoreState() {
    const { value } = await Preferences.get({ key: 'lastRoute' });
    if (value) {
      this.router.navigateByUrl(value);  // Navega a la última vista guardada
    }
  }

}
