import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-calificacion',
  templateUrl: './calificacion.component.html',
  styleUrls: ['./calificacion.component.scss'],
})
export class CalificacionComponent {
    @Input() emisorId: number | undefined; // ID del usuario actual
    @Input() receptorId: number | undefined; // ID del conductor
    @Input() idViaje: number | undefined;
    @Input() rol: string | undefined; // ID del usuario actual
  calificacion: number = 5;
  comentario: string = '';
  stars: number[] = [1, 2, 3, 4, 5];

  constructor(private api: UserService, private modalController: ModalController, private http: HttpClient) { }

  setCalificacion(valor: number) {
    this.calificacion = valor;
  }

  enviarCalificacion() {
    if (this.calificacion === 0) {
      alert('Por favor, selecciona una calificación.');
      return;
    }

    const data = {
      idViaje: this.idViaje,
      idUser: this.receptorId,
      punteo: this.calificacion,
      comentario: this.comentario
    };

    this.api.guardarCalificacion(data).subscribe(() => {
      alert('Calificación enviada');

      this.modalController.dismiss({
        califico: true, // Ejemplo de dato enviado
        
      });
    }, error => {
      alert('Error al enviar la calificación');
    });
  }

}
