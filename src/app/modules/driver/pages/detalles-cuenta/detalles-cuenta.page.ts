import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-detalles-cuenta',
  templateUrl: './detalles-cuenta.page.html',
  styleUrls: ['./detalles-cuenta.page.scss'],
})
export class DetallesCuentaPage implements OnInit {

  constructor(private modalCtrl: ModalController) {}



  ngOnInit() {
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

}
