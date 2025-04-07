import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ActionSheetController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-foto',
  templateUrl: './foto.component.html',
  styleUrls: ['./foto.component.scss'],
})
export class FotoComponent implements OnInit {

  @Input() markers: { lat: number; lon: number; label?: string }[] = [];
  latitude: number | undefined;
  longitude: number | undefined;
  isFoto: boolean = false;

  user: any = null;
  imageBase64: any = null;
  constructor(private actionSheetController: ActionSheetController,
    public toastController: ToastController,
    private authService: AuthService,
    private currentUser: UserService) {
  }

  ngOnInit() {

    this.getUser();
  }

  async getFoto() {
    try {
      var response = await this.currentUser.getFoto(this.user.idUser
      );

      response.subscribe((re) => {
        var data = re.result;
        this.imageBase64 = data.foto;
      })
    } catch (error) {
      console.error(error)
    }
  }

  getUser() {
    const isAuthenticated = this.authService.isAuthenticated();
    if (isAuthenticated) {
      this.user = this.authService.getUser();
      this.getFoto();
    }
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Seleccionar una opción',
      buttons: [
        {
          text: 'Tomar Foto',
          icon: 'camera',
          handler: () => this.tomarImage(),
        },
        {
          text: 'Elegir de la Galería',
          icon: 'image',
          handler: () => this.selectImage(),
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

  async tomarImage() {
    // Solicitar permisos antes de tomar la foto
    const permission = await Camera.requestPermissions();

    if (permission.camera !== 'granted') {
      console.error('Permiso de cámara denegado');
      return;
    }
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64, // Puedes cambiar a Uri si prefieres una URL en vez de Base64
      source: CameraSource.Camera,  // Cambia a CAMERA para tomar foto
    });


    this.imageBase64 = `data:image/jpeg;base64,${image.base64String}`;
    this.isFoto = true;

    this.updateFoto();
  }


  async selectImage() {
    // Solicitar permisos antes de tomar la foto
    const permission = await Camera.requestPermissions();

    if (permission.camera !== 'granted') {
      console.error('Permiso de cámara denegado');
      return;
    }
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64, // Puedes cambiar a Uri si prefieres una URL en vez de Base64
      source: CameraSource.Photos,  // Cambia a CAMERA para tomar foto
    });


    this.imageBase64 = `data:image/jpeg;base64,${image.base64String}`;
    this.isFoto = true;

    this.updateFoto();
  }

  async updateFoto() {
    try {
      var data = {
        id: this.user.idUser,
        foto: this.imageBase64
      }
      var response = await this.currentUser.updateFotoPerfil(data);
      response.subscribe((re) => {
        this.getFoto()
        this.popUp();
        this.authService.refreshLogin(re);
        this.isFoto = false;
      })
    } catch (error) {
      console.log(error)
    }
  }

  async popUp() {
    const toast = await this.toastController.create({
      message: 'Foto cargada correctamente.',
      duration: 3000,
      color: 'success'
    });
    toast.present();
  }
}
