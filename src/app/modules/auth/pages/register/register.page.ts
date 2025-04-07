import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { UserService } from 'src/app/core/services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  registro!: FormGroup;
  error: any = null;
  isSubmitting: boolean = false;
  tieneCodigoReferido: boolean = false;
  constructor(public toastController: ToastController, private router: Router,
    private loadingController: LoadingController,
    private formBuilder: FormBuilder,
    private api: UserService, public alertController: AlertController) { }

  ngOnInit() {
    this.registro = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.required]],
      apellido: ['', [Validators.required, Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      tieneCodigoReferido: [false], // Toggle de referido
      codigo: [''],
      fecha: [''],
    }, { validator: this.passwordsMatchValidator }
    );
  }

  passwordsMatchValidator(formGroup: AbstractControl): { [key: string]: boolean } | null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordsMismatch: true };
    }
    return null;
  }

  isFieldInvalid(field: string): boolean {
    return (
      !!this.registro.get(field)?.invalid && !!this.registro.get(field)?.touched
    );
  }

  async onSubmit() {
    this.registro.patchValue({ fecha: this.obtenerFechaHoraLocal() });
    if (this.registro.valid) {
      this.isSubmitting = true;

      // Muestra el loading
      const loading = await this.loadingController.create({
        message: 'Creando cuenta...',
        spinner: 'crescent', // Puedes cambiar el tipo de spinner aquí
        backdropDismiss: false, // Evita que el usuario cierre el loading manualmente
      });
      await loading.present(); // Mostrar loading
      try {
        const response = await this.api.createProfile(this.registro.value);
        response.subscribe((re) => {
          if (re.success == true) {
            if (re.status === 200) {
              this.isSubmitting = false;
              loading.dismiss();
              this.clearForm();
              this.presentAlert();
            }
          } else if (re.success == false) {
            this.isSubmitting = false;
            loading.dismiss();
            this.error = re.msg;
            this.errorDuranteCreacion(this.error)
          }
        })
      } catch (error) {
        console.error("Error ", error);
        loading.dismiss();
      }
    } else {
      this.registro.markAllAsTouched(); // Marca todos los campos como tocados para mostrar errores
    }
  }


  async errorDuranteCreacion(item: any) {
    const toast = await this.toastController.create({
      message: `${item}`,
      duration: 4000,
      position: 'top',
      color: 'danger'
    });
    toast.present();
  }


  clearForm() {
    this.registro.reset();
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'CUENTA CREADA',
      subHeader: 'Te hemos enviado un código de verificación a tu correo. Inicia sesión y verifica tu cuenta.',
      mode: 'ios', // Cambia el estilo según la plataforma (ios/md)
      buttons: [
        {
          text: 'Iniciar sesión',
          handler: () => {
            // Aquí puedes agregar la lógica para redirigir a la pantalla de inicio de sesión
            //  console.log('Iniciar sesión clicked');
            this.router.navigateByUrl('/auth/login', { replaceUrl: true });
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            // Aquí puedes agregar la lógica para manejar el evento de cancelar
            console.log('Cancelar clicked');
          }
        }
      ],
      cssClass: 'custom-alert'
    });

    await alert.present();
  }

  obtenerFechaHoraLocal(): string {
    const now = new Date();
    return now.getFullYear() + "-" +
      String(now.getMonth() + 1).padStart(2, "0") + "-" +
      String(now.getDate()).padStart(2, "0") + " " +
      String(now.getHours()).padStart(2, "0") + ":" +
      String(now.getMinutes()).padStart(2, "0") + ":" +
      String(now.getSeconds()).padStart(2, "0");
  }

}
