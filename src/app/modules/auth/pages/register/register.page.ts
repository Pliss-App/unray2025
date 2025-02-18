import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  registro!: FormGroup;

  constructor(private formBuilder: FormBuilder, private api: UserService,public alertController: AlertController) { }

  ngOnInit() {
    this.registro = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.required]],
      apellido: ['', [Validators.required, Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
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
    if (this.registro.valid) {
      try {

        const response = await this.api.createProfile(this.registro.value);
        response.subscribe((re) => {
          if (re.status === 200) {
            this.clearForm();
            this.presentAlert();
          }
        })
      } catch (error) {
        console.error("Error ", error)
      }
    } else {
      this.registro.markAllAsTouched(); // Marca todos los campos como tocados para mostrar errores
    }
  }

  clearForm() {
    this.registro.reset();
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'CUENTA CREADA',
      subHeader: `Tu cuenta se ha creado correctamente.`,
      buttons: ['OK'],
       cssClass: 'custom-alert'
    });

    await alert.present();
  }

}
