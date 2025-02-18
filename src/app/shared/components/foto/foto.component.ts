import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { Camera , CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-foto',
  templateUrl: './foto.component.html',
  styleUrls: ['./foto.component.scss'],
})
export class FotoComponent implements OnInit {

  @Input() markers: { lat: number; lon: number; label?: string }[] = [];
  latitude: number | undefined;
  longitude: number | undefined;

  user: any = null;
  imageBase64: any = null;
  constructor(
    public toastController: ToastController,
    private authService: AuthService,
    private camera: Camera,
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

  async selectImage() {
    const options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL, // Devuelve Base64
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY, // Cambia a CAMERA para tomar foto
    };

    this.camera.getPicture(options).then(
      (imageData) => {
        this.imageBase64 = 'data:image/jpeg;base64,' + imageData; // Guarda la imagen en formato Base64
        this.updateFoto();
      },
      (err) => {
        console.log("Error al capturar imagen: ", err);
      }
    );
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
