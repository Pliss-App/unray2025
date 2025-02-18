import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, MenuController, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { SharedService } from 'src/app/core/services/shared.service';
import { SolicitudService } from 'src/app/core/services/solicitud.service';
import { OnesignalService } from 'src/app/core/services/onesignal.service';
import { LocationService } from 'src/app/core/services/location.service';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { WebSocketService } from 'src/app/core/services/web-socket.service';
import { CalificacionComponent } from 'src/app/shared/components/calificacion/calificacion.component';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  userRole: any;
  message: string = '';
  user: any = null;
  interSoli: any= null;

  constructor(private onesignal: OnesignalService, private alertController: AlertController,
    private sharedDataService: SharedService, private soli: SolicitudService, private socketService: WebSocketService,
    private router: Router, private location: LocationService, private geolocation: Geolocation,
    private auth: AuthService, private userService: UserService, private modalController: ModalController, private menuController: MenuController) {
    this.userRole = this.auth.getRole();
    this.user = this.auth.getUser();
    this.onesignal.initialize(this.userRole, this.user.idUser);
  }

  async ngOnInit() {
    //this.soli.startPolling();
    this.escucharSolicitud();
    this.getCalificar();

    await this.getEstadoCalificacion()

  }


  getEstadoCalificacion() {
    this.interSoli = setInterval(async () => {
      await this.getNotCalificacion()
    }, 1500);
  }

  getCalificar() {
    this.socketService.listen('calificar', async (data: any) => {
      if (data.estado == true) {
        this.mostrarModalCalificacion(data.idUser, data.idViaje);
      }

    })
  }

  getNotCalificacion() {
    this.userService.getNoCalificacionUsuario(this.user.idUser, 'user').subscribe((response) => {
      if (response.success == true) {
        var data = response.result;
        this.mostrarModalCalificacion(data[0].idConductor, data[0].id);
        clearInterval(this.interSoli);
        this.interSoli=null;
      }
    })
  }

  openMenu() {
    if (this.userRole === 'usuario') {
      this.menuController.open('userMenu'); // Especifica el menú a abrir
    } else if (this.userRole === 'conductor') {
      this.menuController.open('driverMenu'); // Especifica el menú a abrir
    }
  }

  escucharSolicitud() {
    this.socketService.listen('solicitud_iniciar', async (data: any) => {
      //this.router.navigate(['/user/travel-route']);
      console.log("ESCUAHR CUSNCO SE ACEPTA LA SOLICITUD ", data)
    }
    )

  }

  goToProfile() {
    this.router.navigate(['/user/profile']); // Navegar a la página de perfil
  }

  sendMessage() {
    // Este método puede actualizar `message` para enviar nuevo valor a `app-child`
    this.message = this.message + '!';
  }

  async locate() {
    /*
    this.location.location$.subscribe(coords => {
      this.sharedDataService.locate({ lat: coords.lat, lng: coords.lon });
    }) */

    this.geolocation.getCurrentPosition({
      enableHighAccuracy: true, // Asegura mejor precisión
      timeout: 10000, // Tiempo máximo de espera (10s)
      maximumAge: 0, // No usar caché
    }).then((position) => {

      const coords = {
        lat: position.coords.latitude, lon: position.coords.longitude,
        heading: position.coords.heading
      };

   //   this.showAlert('📍 Ubicación obtenida', `Lat: ${coords.lat}, Lng: ${coords.lon}`);
      this.sharedDataService.locate({ lat: coords.lat, lng: coords.lon });

    },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        this.showAlert('❌ Error obteniendo ubicación', error.message);
      },

    );
  }

  async showAlert(title: string, message: string) {
    const alert = await this.alertController.create({
      header: title,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async mostrarModalCalificacion(idDriver: any, idViaje: any) {

    const modal = await this.modalController.create({
      component: CalificacionComponent,
      componentProps: {
        emisorId: this.user.idUser, // Cambiar dinámicamente
        receptorId: idDriver, // Cambiar dinámicamente
        idViaje: idViaje,
        rol: 'user'
      },
      backdropDismiss: false // Evita que el usuario cierre el modal sin calificar
    });
    await modal.present();


    // Capturar el valor devuelto desde el modal
    const { data } = await modal.onDidDismiss();
    if (data.calificado == true) {
      await this.getEstadoCalificacion()
    }
  }

  cerrar() {
    this.auth.logout();
  }


  onSearch() {


    this.location.getAutocompleteSuggestions('Plaza Madero GUATEMALA').subscribe((response: any) => {
     console.log(" viende data ", response.results);
    });
  }


}
