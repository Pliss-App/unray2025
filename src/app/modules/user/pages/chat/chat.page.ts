import { HttpClient } from '@angular/common/http';
import { AfterViewChecked, Component, Input, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonContent, ModalController } from '@ionic/angular';
import { OnesignalService } from 'src/app/core/services/onesignal.service';
import { UserService } from 'src/app/core/services/user.service';
//import { Socket } from 'socket.io-client';
//import { Socket } from 'socket.io-client';
//import { Socket } from 'socket.io-client';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  @Input() emisorId: number | undefined; // ID del usuario actual
  @Input() receptorId: number | undefined; // ID del conductor
  mensajes: any[] = [];
  mensaje = '';
  @ViewChild('chatContent', { static: false }) chatContent: IonContent | undefined;
  @ViewChild(IonContent) content: IonContent | undefined;
  isScrolledToBottom = true; // Estado para detectar si el usuario está desplazado al fondo


  constructor(private onesignal: OnesignalService, private alertCtrl: AlertController, private modalController: ModalController, private http: HttpClient, private uSer: UserService) { }

  ngOnInit() {

    setInterval(() => {
      this.cargarMensajes();
      if (this.isScrolledToBottom) {
        this.scrollToBottom(); // Desplazar hacia abajo si el usuario no ha desplazado hacia arriba
      }
    }, 1000)
    this.cargarMensajes();
  }
  ngAfterViewInit() {
    this.scrollToBottom();
  }
  // Detectar el desplazamiento del usuario
  onScroll(event: any) {
    this.isScrolledToBottom = event.detail.scrollTop + event.detail.clientHeight === event.detail.scrollHeight;
  }
  scrollToBottom() {
    // Espera un ciclo de vida para asegurarse de que los cambios estén reflejados
    setTimeout(() => {
      this.content?.scrollToBottom(0); // Desplazar al fondo con un tiempo de animación de 300 ms
    }, 100);
  }

  cargarMensajes() {
    try {
      const response = this.uSer.getMensajes(this.emisorId, this.receptorId);
      response.subscribe((re: any) => {
        this.mensajes = re.result;

      })
      if (this.isScrolledToBottom) {
        this.scrollToBottom(); // Desplazar hacia abajo si el usuario no ha desplazado hacia arriba
      }
    } catch (error) {
      console.error('Error al consultar mensajes:', error);
    }
  }

  enviarMensaje() {

    if (this.mensaje != '') {
      const data = {
        emisor_id: this.emisorId,
        receptor_id: this.receptorId,
        mensaje: this.mensaje,
      };

      var noti = {
        userId: null,
        sonido: 'vacio',
        title: 'Un Ray - Chat',
        message: this.mensaje
      }
      this.onesignal.getToken(this.receptorId).subscribe((resp => {



        var data = resp.result;
        var token = data.onesignal_token;
        noti.userId = token
        //this.idTokenOne = token;



        console.log("Noti ", noti)
        const response = this.onesignal.enviarNotificacion(noti);
        response.subscribe((resp) => {
          console.log("ENVIADO", resp)
        })
      }))
      const response = this.uSer.sendMensajes(data);
      response.subscribe((re) => {
        this.scrollToBottom();
        this.cargarMensajes();
      })
      //  this.socket.emit('sendMessage', data);
      this.mensajes.push(data); // Mostrar el mensaje enviado
      this.mensaje = ''; // Limpiar input
    }
  }


  closeModal() {
    this.modalController.dismiss();
  }

  async showErrorAlert(error: any) {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: 'No se pudo conectar al servidor. Por favor, intenta nuevamente más tarde.',
      buttons: ['Aceptar'],
    });
    await alert.present();
  }
}
