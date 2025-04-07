import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
//import { ApiService } from 'src/app/services/api.service';  // Asegúrate de tener el ApiService para las llamadas HTTP


@Component({
  selector: 'app-verificacion',
  templateUrl: './verificacion.page.html',
  styleUrls: ['./verificacion.page.scss'],
})
export class VerificacionPage implements OnInit {
  verificationForm: FormGroup;
  user: any;



  constructor(private authService: AuthService,
    private formBuilder: FormBuilder,
    private api: UserService,  // Servicio para la API
    private alertController: AlertController
  ) {
    this.user = this.authService.getUser();
    this.verificationForm = this.formBuilder.group({
      id: [`${this.user.idUser}`,],  // Validación de 6 dígitos
      verificationCode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],  // Validación de 6 dígitos
    });
  }

  ngOnInit() {
  }

  // Método para manejar el envío del formulario
  async onSubmit() {
    if (this.verificationForm?.invalid) {
      return;
    }


    try {
      const response = await this.api.verificarCuenta(this.verificationForm.value).toPromise();
      if (response.success) {
        this.authService.refreshLogin(response);
        // console.log(response)
        this.showAlert('Cuenta verificada', 'Tu cuenta ha sido verificada satisfactoriamente. Ya puedes continuar.');

      } else {
        this.showAlert('Error', 'El código de verificación es incorrecto. Intenta nuevamente.');
      }
    } catch (error) {
      this.showAlert('Error', 'Hubo un error al verificar tu cuenta. Intenta nuevamente más tarde.');
    }
  }

  // Método para mostrar alertas
  /*async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  } */


  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: [
        {
          text: 'OK',
          handler: () => {

            if (header != 'Error') {
              window.location.reload(); // 🔄 Recarga la página al presionar "OK"
            }

          }
        }
      ],
      backdropDismiss: false
    });

    await alert.present();
  }

}
