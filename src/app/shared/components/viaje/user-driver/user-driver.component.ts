import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Route } from '@tomtom-international/web-sdk-services';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import { ModalController } from '@ionic/angular';
import { ChatPage } from 'src/app/modules/user/pages/chat/chat.page';
import { SharedService } from 'src/app/core/services/shared.service';
import { HttpClient } from '@angular/common/http';
import { async } from 'rxjs';
import { LaunchNavigator, LaunchNavigatorOptions } from '@awesome-cordova-plugins/launch-navigator/ngx';
import { AlertController } from '@ionic/angular';
import { Vibration } from '@awesome-cordova-plugins/vibration/ngx';
import { OnesignalService } from 'src/app/core/services/onesignal.service';
import { CalificacionComponent } from '../../calificacion/calificacion.component';
import { WebSocketService } from 'src/app/core/services/web-socket.service';

@Component({
  selector: 'app-user-driver',
  templateUrl: './user-driver.component.html',
  styleUrls: ['./user-driver.component.scss'],
})
export class UserDriverComponent implements OnInit {
  @Input() idUser: string | null = null;
  @Input() rol: string | null = null;
  @Input() idConductor: string | null = null;
  @Input() idViaje: string | null = null;
  @Input() pointA: string | null = null;
  @Input() origin!: { lat: number; lng: number }; // Coordenadas de salida
  @Input() destination!: { lat: number; lng: number }; // Coordenadas de destino
  @Input() pointB: string | null = null;
  @Input() coste: string | null = null;
  @Input() estado_viaje: string | null = null;
  vibrando: boolean = false; // Controla si está vibrando
  idTokenOne: any;
  intervalId: any;
  profile: any = {};
  tiempo: any = undefined;
  user: any;
  btnLlegue: boolean = true;
  activeAlerta: boolean = false;
  isPopupOpen: boolean = false;
  options = [];

  // URL del placeholder
  placeholderImage: string = 'assets/img/profile.jpg';
  constructor(private http: HttpClient, private vibration: Vibration,
    private shared: SharedService, private alertController: AlertController,
    private modalController: ModalController,
    private onesignal: OnesignalService, private socketService: WebSocketService,
    private api: UserService, private auth: AuthService,
    private route: Router, private callNumber: CallNumber, private launchNavigator: LaunchNavigator) {
    this.user = this.auth.getUser();

  }

  async ngOnInit() {
    await this.getAlertaLlego();
    await this.getCalificar();
    await this.getPerfilUsuario();
    await this.shared.time.subscribe(param => {
      this.tiempo = param;
    });
    this.verificarEstadoViaje();
    await this.getMotivosCancelacion();


  }

  getAlertaLlego() {
    this.socketService.listen('alerta_llegada', async (data: any) => {
      if (!data) {
        console.log("AUN HAY DATA")
      } else {
        if (data.estado == 'Conductor Llego a Salida') {
          this.estado_viaje = data.estado
        }
      }
      //console.log("LLEGO LA ALERTA DEL CONDUCTOR AL USUARIO ", data)
    })
  }

  getCalificar() {
    this.socketService.listen('calificar', async (data: any) => {
      if (data.estado == true) {
        this.mostrarModalCalificacion();
      }

    })
  }

  getMotivosCancelacion() {
    try {
      const response = this.api.getCancelacionRoute();
      response.subscribe((resp) => {
        this.options = resp.result;
      })
    } catch (error) {
      console.log(error)
    }

  }

  getPerfilUsuario() {
    this.profile.foto = this.placeholderImage;
    this.onesignal.getToken(this.idConductor).subscribe((resp => {
      var data = resp.result;
      var token = data.onesignal_token;
      this.idTokenOne = token;

    }))
    if (this.rol == 'conductor') {


      if (this.idConductor != null) {

        this.api.getDriverProfile(this.idConductor).subscribe((re) => {
          if (re.success) {
            this.profile = re?.result;
            if (!this.profile.foto) {
              this.profile.foto = this.placeholderImage;
            }
          }
        })
      }

    } else {
      const id: any = this.auth.getUser();
      if (this.idConductor != null) {
        this.api.getUserProfileDriver(this.idConductor).subscribe((re) => {
          if (re.success) {
            this.profile = re?.result;
            if (!this.profile.foto) {
              this.profile.foto = this.placeholderImage;
            }
          }
        })
      }
    }

  }

  updateEstadoViaje(item: any, idUser: any, idSoli: any) {
    try {
      var data = {
        id: this.idViaje,
        estado: item,
        idUser: idUser,
        solicitudId: idSoli
      }
      this.api.updateEstadoViaje({ data }).subscribe((resp) => {
        return 0;
      })
    } catch (error) {
      console.error(error)
    }

  }


  makeCall(phoneNumber: string) {
    this.callNumber.callNumber(phoneNumber, true)
      .then(() => console.log('Llamada realizada correctamente'))
      .catch((error) => console.error('Error al intentar realizar la llamada:', error));

  }

  async openChatModal() {
    const modal = await this.modalController.create({
      component: ChatPage,
      componentProps: {
        emisorId: this.idUser, // Cambiar dinámicamente
        receptorId: this.idConductor, // Cambiar dinámicamente
      },
    });
    await modal.present();
  }

  openNavigator() {
    var destination: any;
    if (this.estado_viaje == 'En Ruta a Salida') {
      var data = {
        userId: this.idTokenOne,
        sonido: 'vacio',
        title: 'Un Ray - Llego',
        message: `${this.profile.nombre}, acaba de llegar por ti.`
      }
      this.onesignal.enviarNotificacion(data).subscribe((re) => {
        var val = re;
      });
      destination = `${this.origin.lat}, ${this.origin.lng}`;
    }




    if (this.estado_viaje == 'En Ruta a Destino' || this.estado_viaje == 'Conductor Llego a Salida' || this.estado_viaje == 'Conductor en Ruta a Destino' || this.estado_viaje == 'Usuario Va en Camino') {
      destination = `${this.destination.lat}, ${this.destination.lng}`;
      var data = {
        userId: this.idTokenOne,
        sonido: 'vacio',
        title: 'Un Ray - A Destino',
        message: `Tu viaje a iniciado a tu destino.`
      }
      this.onesignal.enviarNotificacion(data).subscribe((re) => {
        var val = re;
      });
    }
    // const destination = "40.730610, -73.935242"; // Coordenadas de destino (Lat, Lng)

    const options: LaunchNavigatorOptions = {
      app: this.launchNavigator.APP.USER_SELECT // Cambia a TOMTOM, APPLE_MAPS, etc.
    };

    this.launchNavigator.navigate(destination, options)
      .then(success => console.log("Navegación iniciada"))
      .catch(error => alert(error));
  }

  activeBtnLlegue() {
    if (this.estado_viaje == 'En Ruta a Salida') {
      this.btnLlegue = false;

    } else {
      this.btnLlegue = true;
    }

    return 0;
  }

  openPopup() {
    this.isPopupOpen = true;
    // this.shared.actionPopUp(true);//
  }


  handleClose() {
    this.isPopupOpen = false;
  }

  handleSave(selectedOption: any) {
    try {
      var data = {
        id: this.idViaje,
        option: selectedOption
      }
      this.api.cancelarSolicitud(data).subscribe((resp) => {
        if (resp) {
          var data = {
            userId: this.idTokenOne,
            sonido: 'vacio',
            title: 'Un Ray - Cancelación',
            message: `${this.profile.nombre}, acaba de cancelar la solicitud.`
          }
          this.onesignal.enviarNotificacion(data).subscribe((re) => {
            var val = re;
          });

        }
      })
    } catch (error) {

    }
    // Guardar en la base de datos a través del backend
    /*   this.http.post('http://localhost:3000/api/guardar', { opcion: selectedOption }).subscribe(
         (response) => {
           console.log('Guardado exitoso:', response);
         },
         (error) => {
           console.error('Error al guardar:', error);
         }
       ); */
  }

  async finalizar() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que deseas finalizar el viaje?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Cancelación del viaje cancelada');
          }
        },
        {
          text: 'Finalizar',
          handler: () => {
            // Llamada al servicio para finalizar el viaje
            var data = {
              idViaje: this.idViaje,
              idUser: this.user.idUser,
              idDriver :  this.user.idUser,
              costo: this.coste
            }
            this.api.finalizarViaje(data).subscribe(
              (resp) => {

                var data = {
                  userId: this.idTokenOne,
                  sonido: 'vacio',
                  title: 'Un Ray - Finalizado',
                  message: `Viaje a sido finalizado.`
                }
                this.onesignal.enviarNotificacion(data).subscribe((re) => {
                  var val = re;
                });

                this.mostrarModalCalificacion();
              },
              (error) => {
                console.error("Error al finalizar el viaje", error);
              }
            );
          }
        }
      ]
    });

    await alert.present();
  }

  verificarEstadoViaje() {
    this.intervalId = setInterval(() => {
      if (this.estado_viaje === 'Conductor Llego a Salida' && this.user.rol == 'usuario') {
        this.iniciarVibracion();
      } else if (this.estado_viaje !== 'Conductor Llego a Salida' && this.user.rol == 'usuario') {
        this.detenerVibracion();
      }
      this.activeBtnLlegue();

      //   if(this.estado_viaje == 'Conductor')
    }, 2500); // Verifica cada 1 segundo
  }

  iniciarVibracion() {
    this.vibrando = true;
    this.vibration.vibrate([1000, 500, 1000]); // Vibra 1s, pausa 0.5s, vibra 1s
  }

  detenerVibracion() {

    this.vibrando = false;
    this.vibration.vibrate(0); // Detiene la vibración
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  atenderNoti() {
    try {
      var data = {
        id: this.idViaje,
        estado: 'Usuario Va en Camino'
      }
      this.estado_viaje = 'Notificar'
      this.api.updateEstadoViaje({ data }).subscribe((re) => {
        this.detenerVibracion();
      });

    } catch (error) {
      console.error(error)
    }
  }


  async mostrarModalCalificacion() {
    var id = null;
    if (this.rol == 'user') {
      id = this.idConductor;
    } else {
      id = this.idUser
    }
    const modal = await this.modalController.create({
      component: CalificacionComponent,
      componentProps: {
        emisorId: this.idUser, // Cambiar dinámicamente
        receptorId: id, // Cambiar dinámicamente
        idViaje: this.idViaje,
        rol: this.rol
      },
      backdropDismiss: false // Evita que el usuario cierre el modal sin calificar
    });
    await modal.present();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
