import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { interval, switchMap } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { SharedService } from 'src/app/core/services/shared.service';
import { SolicitudService } from 'src/app/core/services/solicitud.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-travel-route',
  templateUrl: './travel-route.page.html',
  styleUrls: ['./travel-route.page.scss'],
})
export class TravelRoutePage implements OnInit {
  user: any;
  solicitud: any;
  sheetHeight = 150; // Altura inicial
  idUser: string = '';
  idConductor: string = '';
  points: any = [];
  estados: any = null;
  private pollingSubscription: any;
  private intervalId: any;

  constructor(private router: Router,
    private shared: SharedService,
    private soli: SolicitudService,
    private loadingCtrl: LoadingController,
    private api: UserService,
    private auth: AuthService,) {

    this.user = this.auth.getUser();

    console.log("Entro a cargar soliciud")

  }

  ngOnInit() {
    console.log("Entro a cargar soliciud w")
    this.startPolling();
  }

  actualizarAlturaMapa(nuevaAltura: number) {
    this.sheetHeight = nuevaAltura;
    this.forceMapResize();
  }

  forceMapResize() {
    setTimeout(() => {
      google.maps.event.trigger(window, 'resize');
    }, 50); // Pequeño retraso para evitar flickering
  }

  async startPolling() {

    const loading = await this.loadingCtrl.create({
      message: 'Cargando datos...',
      spinner: 'crescent', // Opciones: 'bubbles', 'dots', 'circles', 'crescent', 'lines'
    });
    await loading.present();

    try {

      const timestamp = new Date().getTime();
      this.api.checkActiveTravel(this.user.idUser, timestamp).subscribe((response) => {
        console.log("DATOS DEL VIAJE ", response)
        if (response?.success) {

          this.solicitud = response.result;
          this.idConductor = this.solicitud.idConductor;
          var detVia = {

          }
          this.shared.kmRecorridos(detVia);
        }
      });
      //
      this.intervalId = setInterval(() => {
        const timestamp = new Date().getTime();
        this.api.checkActiveTravel(this.user.idUser, timestamp).subscribe((response) => {
          if (response?.success) {
            this.solicitud = response.result;
            this.idConductor = this.solicitud.idConductor;

          } else {
            this.getDestroyInterval();
            this.soli.resumePollingOnTripEnd();
          }
        });
      }, 2000);
      await loading.dismiss();
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      // 3️⃣ Ocultar el Loading cuando termine de cargar
      await loading.dismiss();
    }
  }

  cleanupAndRedirect() {
    // Opcional: Limpia variables o servicios si es necesario
    this.solicitud = null;
    this.idConductor = "";

    // Redirige a la página principal eliminando el historial
    this.router.navigate(['/user'], { replaceUrl: true });
    // this.router.navigate(['/pagina-principal'], { replaceUrl: true });
  }
  finalizarViaje() {
    // Lógica para finalizar el viaje
    this.soli.resumePollingOnTripEnd();
  }

  getDestroyInterval() {
    // Limpia el intervalo al salir de la vista
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  ngOnDestroy(): void {
    this.getDestroyInterval();
  }

}
