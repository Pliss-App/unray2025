import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AlertController, MenuController, NavController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  private currentUserSubject!: BehaviorSubject<any>;
  username: any = null;
  user: any = null;
  profileForm!: FormGroup;
  isUpdateButtonDisabled: boolean = true;
  userRole: any;

  constructor(private toastController: ToastController, private auth: AuthService,
    private navCtrl: NavController, private authService: AuthService, private menuController: MenuController, 
    private fb: FormBuilder, private api: UserService) {
    this.userRole = this.auth.getRole();
  }

  ngOnInit() {
    this.profileForm = this.fb.group({
      nombre: [''],        // Campo de nombre
      apellido: [''],    // Campo de apellido
      telefono: [''],       // Campo de teléfono
      correo: [''],       // Campo de correo
    });
    this.profileForm.markAsPristine();
    this.profileForm.valueChanges.subscribe(() => {
      // Habilita el botón de actualizar si el formulario cambió, de lo contrario lo desactiva
      this.isUpdateButtonDisabled = this.profileForm.pristine;
    });
    const isAuthenticated = this.authService.isAuthenticated();
    const userRole = this.authService.getRole();

    if (isAuthenticated) {
      this.user = this.authService.getUser();
      this.username = this.user.nombre + " " + this.user.apellido;
    }

  }

  openMenu() {
    if (this.userRole === 'usuario') {
      this.menuController.open('userMenu'); // Especifica el menú a abrir
   
    } else if (this.userRole === 'conductor') {
      this.menuController.open('driverMenu'); // Especifica el menú a abrir
    }
  }

  async updateProfile(): Promise<void> {
    if (this.profileForm.valid) {
      const toast = await this.toastController.create({
        message: 'Actualizando datos...',
        duration: 2000,
        position: 'top',
        color: 'dark',
      });
      await toast.present();

      try {
        const response = this.api.updateUserProfile(this.user.idUser, this.profileForm.value);
        response.subscribe(async (re) => {
          if (re && re.token) {
            const successToast = await this.toastController.create({
              message: '¡Datos actualizados correctamente!',
              duration: 2000,
              color: 'success',
              position: 'top',
            });
            await successToast.present();
            this.username = re.user?.nombre + " " + re.user?.apellido;
            this.user = re.user;
            this.authService.refreshLogin(re);
            this.profileForm.markAsPristine();
            this.isUpdateButtonDisabled = true;

          }
          else {
            const errorToast = await this.toastController.create({
              message: 'Hubo un problema al actualizar los datos.',
              duration: 2000,
              color: 'danger',
              position: 'top',
            });
            await errorToast.present();
          }

        })
      } catch (error) {
        // Manejo de errores en caso de fallo en la llamada a la API
        const errorToast = await this.toastController.create({
          message: 'Error de conexión. No se pudo actualizar.',
          duration: 2000,
          color: 'danger',
          position: 'top',
        });
        await errorToast.present();

      }
    }
  }

  goBack() {
    this.navCtrl.back();
  }

}
