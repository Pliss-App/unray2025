import { Component, OnInit } from '@angular/core';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { AlertController, LoadingController } from '@ionic/angular';
import { UserService } from 'src/app/core/services/user.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-recargar-billetera',
  templateUrl: './recargar-billetera.page.html',
  styleUrls: ['./recargar-billetera.page.scss'],
})
export class RecargarBilleteraPage implements OnInit {
  paymentForm: FormGroup;
  photoBase64: string | null = null;
  user: any = {};

  constructor(private iab: InAppBrowser, private api: UserService, private auth: AuthService,
    private fb: FormBuilder,
    private camera: Camera,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {
    this.user = this.auth.getUser();
    this.paymentForm = this.fb.group({
      receiptNumber: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
    });
  }
  ngOnInit(): void {
    // throw new Error('Method not implemented.');
  }

  openVisaLink() {
    const browser = this.iab.create('https://mallvirtualvisanet.com.gt/formulario-de-pago/1556/pliis-technology-businesses', '_blank', {
      location: 'yes', // Muestra barra de herramientas del navegador
      toolbar: 'yes',  // Barra de navegación
      zoom: 'no',      // Desactiva el zoom
    });
  }

  async openPhotoOptions() {
    const alert = await this.alertCtrl.create({
      header: 'Cargar Foto',
      message: 'Selecciona una opción:',
      buttons: [
        {
          text: 'Tomar Foto',
          handler: () => this.takePhoto(this.camera.PictureSourceType.CAMERA),
        },
        {
          text: 'Cargar desde Galería',
          handler: () => this.takePhoto(this.camera.PictureSourceType.PHOTOLIBRARY),
        },
        { text: 'Cancelar', role: 'cancel' },
      ],
    });
    await alert.present();
  }

  async takePhoto(sourceType: number) {
    const options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
    };

    try {
      const imageData = await this.camera.getPicture(options);
      this.photoBase64 = `data:image/jpeg;base64,${imageData}`;
    } catch (error) {
      this.showAlert('Error', 'No se pudo capturar la foto. Intenta nuevamente.');
    }
  }

  async submitForm() {
    if (!this.paymentForm.valid || !this.photoBase64) {
      this.showAlert('Validación', 'Por favor, completa todos los campos y carga tu vaucher o boleta.');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Enviando datos...',
    });
    await loading.present();

    // Simulación de API
    setTimeout(async () => {
      loading.dismiss();
      try {
        var data = {
          iduser: this.user.idUser,
          boleta: this.paymentForm.value.receiptNumber,
          monto: this.paymentForm.value.amount,
          url: this.photoBase64
        };
        this.api.recargarBilletara(data).subscribe((re) => {
          if (re?.msg) {
            this.showAlert('Éxito', 'Datos enviados correctamente.');
            this.resetForm();
          } else {
            this.showAlert('Error', 'Hubo un problema al enviar los datos.');
          }
        })
      } catch (error) {
        this.showAlert('Error', 'Hubo un problema al enviar los datos.');
      }

      //    const success = Math.random() > 0.5; // Simula éxito o error

      /*  if (success) {
          this.showAlert('Éxito', 'Datos enviados correctamente.');
          this.resetForm();
        } else {
          this.showAlert('Error', 'Hubo un problema al enviar los datos.');
        } */
    }, 2000);
  }

  resetForm() {
    this.paymentForm.reset();
    this.photoBase64 = null;
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
