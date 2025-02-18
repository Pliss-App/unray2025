import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { UserService } from 'src/app/core/services/user.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ActionSheetController, AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-documentacion',
  templateUrl: './documentacion.page.html',
  styleUrls: ['./documentacion.page.scss'],
})
export class DocumentacionPage implements OnInit {
  form: FormGroup;
  active: boolean = true;
  // Lista de campos
  fields: any = [];
  isLoading = false;
  // Previsualizaciones de imágenes
  previews: { [key: string]: string } = {};

  // Imágenes en Base64
  imagesBase64: { [key: string]: string } = {};
  user: any = {};

  constructor( private navCtrl: NavController,private actionSheetController: ActionSheetController, private alertController: AlertController, private loadingController: LoadingController,
    private toastController: ToastController, private fb: FormBuilder, private camera: Camera, private userService: UserService, private authService: AuthService) {
    this.user = this.authService.getUser();
    this.getDocumentacion();
    const controls: { [key: string]: any } = {};
    this.fields.forEach((field: any) => {
      controls[field.nombre] = [null, Validators.required];
      // Inicializar previsualizaciones con la imagen por defecto
      this.previews[field.nombre] = 'https://www.utec.edu.sv/solicitud-maestrias/assets/img/default_img.png';
    });
    this.form = this.fb.group(controls);

  }

  ngOnInit() {

  }

  async getDocumentacion() {
    const loading = await this.loadingController.create({
      message: 'Verificando documentación...',
      spinner: 'crescent',
      duration: 10000, // Tiempo máximo antes de que se cierre el loading
    });

    await loading.present();
    try {
      this.userService.getDocumentacionRequisitos().subscribe(async (re: any) => {
        this.fields = re?.result;
        this.active = false;

      })
    } catch (error) {
      console.error('Error verificando la documentación:', error);
    } finally {
      // Cierra el loading
      await loading.dismiss();
    }

  }

  async presentActionSheet(fieldName: string) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Seleccionar una opción',
      buttons: [
        {
          text: 'Tomar Foto',
          icon: 'camera',
          handler: () => this.captureImage(fieldName, this.camera.PictureSourceType.CAMERA),
        },
        {
          text: 'Elegir de la Galería',
          icon: 'image',
          handler: () => this.captureImage(fieldName, this.camera.PictureSourceType.PHOTOLIBRARY),
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }

  captureImage(fieldName: string, sourceType: number) {
    const options: CameraOptions = {
      quality: 80,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: sourceType,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
    };

    this.camera.getPicture(options).then(
      (imageData) => {
        const base64Image = `data:image/jpeg;base64,${imageData}`;
        this.previews[fieldName] = base64Image; // Actualizar la previsualización
        this.imagesBase64[fieldName] = imageData; // Guardar el Base64
        this.form.controls[fieldName].setValue(imageData); // Validar el campo
      },
      (err) => {
        console.error('Error al capturar la imagen:', err);
      }
    );
  }

  async onSubmit() {
    this.isLoading = true; // Mostrar indicador de carga mientras se procesa la solicitud

    if (this.form.valid) {
      // Llamada al servicio para enviar los datos
      var data = {
        documentacion: this.imagesBase64,
        idUser: this.user.idUser
      }
      this.userService.insertDocumentos(data).subscribe({
        next: async (response) => {
          this.isLoading = false; 
          this.imagesBase64 = {};
          this.previews = {};
          this.onReset();
          this.getDocumentacion();
          // Mostrar mensaje de éxito
          const successAlert = await this.alertController.create({
            header: 'Éxito',
            message: 'Los documentos se enviaron correctamente.',
            cssClass: 'alert-custom',
            buttons: [        {
              text: 'OK',
              handler: () => {
                this.navCtrl.navigateRoot('/driver'); // Reemplaza '/inicio' con la ruta correcta de tu página de inicio
              }
            }],
          });
          await successAlert.present();
        },
        error: async (error) => {
          this.isLoading = false; 
          // Mostrar mensaje de error
          const errorAlert = await this.alertController.create({
            header: 'Error',
            message: 'Hubo un problema al enviar los documentos. Intenta nuevamente.',
            buttons: ['OK'],
          });
          await errorAlert.present();
        },
      });
    } else {
      // Validación del formulario
      const toast = await this.toastController.create({
        message: 'Por favor, completa todos los campos correctamente.',
        duration: 3000,
        color: 'warning',
      });
      toast.present();
    }
  }

  // Resetear el formulario
  onReset() {
    this.form.reset(); // Restablece el formulario a su estado inicial
  }

  logout() {

    this.authService.logout();

  }
}
