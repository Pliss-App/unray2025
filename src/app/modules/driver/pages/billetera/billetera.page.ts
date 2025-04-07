import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonDatetime, MenuController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { ConductorService } from 'src/app/core/services/conductor.service';

@Component({
  selector: 'app-billetera',
  templateUrl: './billetera.page.html',
  styleUrls: ['./billetera.page.scss'],
})
export class BilleteraPage implements OnInit {
  @ViewChild('fechaInicioPicker', { static: false }) fechaInicioPicker!: IonDatetime;
  @ViewChild('fechaFinPicker', { static: false }) fechaFinPicker!: IonDatetime;

  saldo: number = 0;
  isLoading = false;
  movimientos: any = [];
  userRole: any;
  user: any = null;
  filtroTipo: string = ''; // Tipo de transacción seleccionado
  fechaInicio: string = '';
  fechaFin: string = '';
  movimientosFiltrados  :any=[];

  constructor(private api: UserService, private apiConductor: ConductorService,
    private auth: AuthService, private menuController: MenuController,
    private navCtrl: NavController, private alertController: AlertController) {

    this.userRole = this.auth.getRole();
    this.user = this.auth.getUser();
  }



  ngOnInit() {
    this.getSaldo();
    this.getMovimientos()
  }

  openMenu() {
    if (this.userRole === 'usuario') {
      this.menuController.open('userMenu'); // Especifica el menú a abrir

    } else if (this.userRole === 'conductor') {
      this.menuController.open('driverMenu'); // Especifica el menú a abrir
    }
  }

  getSaldo() {
    this.isLoading = true;
    try {
      this.api.getSaldo(this.user.idUser).subscribe((re) => {
        if (re.result) {
          const data = re.result;
          this.saldo = data.saldo;
          this.isLoading = false;
        }
      })
    } catch (error) {
      console.error(error);
      this.isLoading = false;
    }
  }

  getMovimientos() {
    this.isLoading = true;
    try {
      this.apiConductor.getMovimientos(this.user.idUser).subscribe((re) => {
        if (re.result) {
          const data = re.result;
          this.movimientos = data;
          this.movimientosFiltrados = [...this.movimientos];
       
          this.isLoading = false;
        }
      })
    } catch (error) {
      console.error(error);
      this.isLoading = false;
    }
  }


  filtrarMovimientos() {
    this.movimientosFiltrados = this.movimientos.filter((mov:any) => {
      const cumpleTipo = this.filtroTipo ? mov.tipo === this.filtroTipo : true;
      const cumpleFechaInicio = this.fechaInicio ? new Date(mov.fecha) >= new Date(this.fechaInicio) : true;
      const cumpleFechaFin = this.fechaFin ? new Date(mov.fecha) <= new Date(this.fechaFin) : true;
      return cumpleTipo && cumpleFechaInicio && cumpleFechaFin;
    });
  }



  getFecha(item: any) {
    // Suponiendo que `movimiento.fecha` está en formato UTC
    let fechaUtc = new Date(item);

    // Convertir a la zona horaria local
    let fechaLocal = new Date(fechaUtc.toLocaleString());

    // Asignar a la propiedad que se usará en el HTML
    return fechaLocal;
  }
}
