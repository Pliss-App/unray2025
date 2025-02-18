import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, MenuController, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { LocationService } from 'src/app/core/services/location.service';
import { UserService } from 'src/app/core/services/user.service';
import { ConductorService } from 'src/app/core/services/conductor.service';
import { io, Socket } from 'socket.io-client';
import { WebSocketService } from 'src/app/core/services/web-socket.service';
import { interval, Subscription } from 'rxjs';
import { OnesignalService } from 'src/app/core/services/onesignal.service';
import { CalificacionComponent } from 'src/app/shared/components/calificacion/calificacion.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  private socket!: Socket;
  solicitud: any;
  solicitudes: any;
  user: any;
  userRole: any;

  isActive: boolean = false;
  loading: boolean = true;

  intervalo: any;
  subscription: Subscription | null = null;
  timerSubscription: Subscription | null = null;
  private solicitudSub: Subscription | undefined;

  solicitudId: number | null = null;
  solicitudIdUser: number | null = null;
  solicitudTimer: any;

  interSoli: any;
  tiempoRestante: number = 30;  // Tiempo restante en segundos (30 segundos)
  progreso: number = 1;         // Progreso de la barra, va de 0 a 1
  colorProgreso: string = 'success';  // Color de la barra de progreso

  constructor(private onesignal: OnesignalService, private driverService: ConductorService,
    private socketService: WebSocketService,
    private menuController: MenuController,
    private locationService: LocationService,
    private router: Router,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private auth: AuthService,
    private userService: UserService,
    private alertCtrl: AlertController) {
    this.user = this.auth.getUser();
    this.userRole = this.auth.getRole();
    this.onesignal.initialize(this.userRole, this.user.idUser);
  }

  async ngOnInit() {
    await this.escucharSolicitudes();
    await this.checkDocumentation();
    //   await this.cargarSolicitudPendiente(this.user.idUser);
    // this.getObtenerSolicitud();
    await this.getEstadoCalificacion()

  }


  getEstadoCalificacion() {
    this.interSoli = setInterval(async () => {
      await this.getNotCalificacion()
    }, 1500);
  }

  getNotCalificacion() {
    this.userService.getNoCalificacionConductor(this.user.idUser, 'user').subscribe((response) => {


      if (response.success == true) {
        var data = response.result;
        this.mostrarModalCalificacion(data[0].idUser, data[0].id);
        clearInterval(this.interSoli);
        this.interSoli=null;
      }
    })
  }

    async mostrarModalCalificacion(idDriver: any, idViaje: any) {
  
      const modal = await this.modalController.create({
        component: CalificacionComponent,
        componentProps: {
          emisorId: this.user.idUser, // Cambiar dinámicamente
          receptorId: idDriver, // Cambiar dinámicamente
          idViaje: idViaje,
          rol: 'conductor'
        },
        backdropDismiss: false // Evita que el usuario cierre el modal sin calificar
      });
      await modal.present();
  
  
      // Capturar el valor devuelto desde el modal
      const { data } = await modal.onDidDismiss();
      console.log('Valor recibido:', data);
      if (data.calificado == true) {
        await this.getEstadoCalificacion()
      }
    }


  escucharSolicitudes() {
    this.socketService.listen('nueva_solicitud', async (data: any) => {
      this.solicitud = data;
      this.solicitudIdUser = data.idUser;
      this.solicitudId = data.solicitudId;
      await this.userService.getFoto(data.idUser).subscribe((re) => {
        console.log("Datos de la foto ", this.solicitud)
        var response = re.result;
        this.solicitud.foto = response.foto;
      })
      this.mostrarSolicitud();
    });

    // Escuchar si la solicitud expira
    this.socketService.listen('solicitud_expirada', (data: any) => {
      if (this.solicitudId === data.solicitudId) {
        this.solicitud = null; // Ocultar solicitud
        this.solicitudId = null;
        this.limpiarTemporizador();
      }
    });
  }

  async mostrarSolicitud() {
    // Iniciar temporizador de 30 segundos
    this.solicitudTimer = setInterval(() => {
      this.tiempoRestante--;
      this.progreso = this.tiempoRestante / 30; // Calcula el progreso (de 0 a 1)

      // Cambiar color de la barra de progreso a rojo si el tiempo se acerca al final
      if (this.tiempoRestante <= 5) {
        this.colorProgreso = 'danger';
      }

      // Si el tiempo se agotó, rechazamos automáticamente
      if (this.tiempoRestante <= 0) {
        this.rechazarSolicitud();
      }
    }, 1000);
  }

  limpiarTemporizador() {
    if (this.solicitudTimer) {
      clearTimeout(this.solicitudTimer);
      this.solicitudTimer = null;

      this.tiempoRestante = 30;  // Tiempo restante en segundos (30 segundos)
      this.progreso = 1;         // Progreso de la barra, va de 0 a 1
      this.colorProgreso = 'success';  // Color de la barra de progreso

    }
  }

  aceptarSolicitud() {
    if (this.solicitudId) {
      // this.procesarSolicitud('Aceptado');
      var data = {
        solicitudId: this.solicitudId,
        conductorId: this.user.idUser
      }
      this.driverService.aceptarSolicitud(data).subscribe((re) => {
        this.socketService.emit(`respuesta_solicitud`, { estado: 'Aceptado', solicitudId: this.solicitudId, conductorId: this.user.idUser, idUser: this.solicitudIdUser });
        return 0;
      })
    }
    this.limpiarTemporizador();
    this.solicitud = null;
  }

  rechazarSolicitud() {
    if (this.solicitudId) {
      this.procesarSolicitud('Rechazado');
      this.socketService.emit(`respuesta_solicitud_${this.solicitudId}`, { estado: 'Rechazado' });
    }
    this.limpiarTemporizador();
    this.solicitud = null;


  }


  getObtenerSolicitud() {
    // Configura un intervalo para consultar el estado de la solicitud cada 5 segundos
    setInterval(() => {
      this.cargarSolicitudPendiente(this.user.idUser);
    }, 1000)
    /*   this.subscription = interval(1000).subscribe(() => {
         
       });*/
  }

  async cargarSolicitudPendiente(idConductor: string) {
    this.driverService.getSolicitudes(idConductor).subscribe({
      next: async (response) => {
        if (response.success) {
          this.solicitud = response.solicitud[0];
          this.tiempoRestante = response.tiempoRestante;
          this.progreso = this.tiempoRestante / 30;

          if (this.progreso === 0) {
            await this.cargarSolicitudPendiente(this.user.idUser);
            //  this.detenerIntervalo();
          }
          this.actualizarColorProgreso();
          this.loading = false;
        } else {
          //this.detenerIntervalo();
          this.solicitud = null;
          this.tiempoRestante = 0;
          this.loading = false;

        }
      },
      error: (err) => {
        console.error('Error al obtener la solicitud:', err);
      },
    });
  }

  // Método para detener el intervalo
  detenerIntervalo(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;

    }
  }

  actualizarColorProgreso() {
    if (this.progreso > 0.3) {
      this.colorProgreso = 'success'; // Verde
    } else {
      this.colorProgreso = 'danger'; // Rojo
    }
  }
  iniciarTemporizador() {
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.tiempoRestante > 0) {
        this.tiempoRestante -= 1;
      } else {
        this.timerSubscription?.unsubscribe();
        this.solicitud = null;
        //  alert('La solicitud ha expirado.');
      }
    });
  }


  /*async aceptarSolicitud() {
    this.procesarSolicitud('Aceptado');
    await this.cargarSolicitudPendiente(this.user.idUser);
    this.solicitud = null;
    this.tiempoRestante = 0;
    this.loading = false;

  } */

  /* async rechazarSolicitud() {
     this.procesarSolicitud('Rechazado');
     await this.cargarSolicitudPendiente(this.user.idUser);
     this.solicitud = null;
     this.tiempoRestante = 0;
     this.loading = false;
   } */

  procesarSolicitud(accion: string) {
    const data = {
      conductorId: this.user.idUser,
      solicitudId: this.solicitud.solicitudId,
      accion: accion
    }
    const response = this.driverService.procesarSolicitud(this.user.idUser, data);
    response.subscribe((re) => {
      console.log("DD", re);
      this.detenerIntervalo();

      this.solicitud = null;
      this.tiempoRestante = 0;
      this.loading = false;
      //  this.getObtenerSolicitud();
    })
  }

  openMenu() {
    if (this.userRole === 'usuario') {
      this.menuController.open('userMenu'); // Especifica el menú a abrir
    } else if (this.userRole === 'conductor') {
      this.menuController.open('driverMenu'); // Especifica el menú a abrir
    }
  }


  async checkDocumentation() {
    const loading = await this.loadingController.create({
      message: 'Verificando documentación...',
      spinner: 'crescent',
      duration: 10000, // Tiempo máximo antes de que se cierre el loading
    });

    await loading.present();

    try {
      this.userService.getDocumentacion(this.user.idUser).subscribe((re) => {
        if (!re?.result) {
          this.isActive = false;
          this.router.navigate(['/driver/documentacion'], { replaceUrl: true });
        } else {
          this.isActive = true;
        }
      })
    } catch (error) {
      console.error('Error verificando la documentación:', error);
    } finally {
      // Cierra el loading
      await loading.dismiss();
    }

  }




  stopTracking() {
    // Detener el seguimiento
    this.locationService.stopTracking();
  }
  cerrar() {
    this.auth.logout();
  }

  // Limpia el intervalo al destruir el componente
  ngOnDestroy(): void {
    this.limpiarTemporizador();
  }

}
