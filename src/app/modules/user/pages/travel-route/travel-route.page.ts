import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  idUser: string = '';
  idConductor: string = '';
  points: any = [];
  estados: any = null;
  private pollingSubscription: any;
  private intervalId: any;

  constructor(private router: Router, private shared: SharedService, private soli: SolicitudService, private api: UserService, private auth: AuthService,) {

    this.user = this.auth.getUser();

    console.log("Entro a cargar soliciud")

  }

  ngOnInit() {
    console.log("Entro a cargar soliciud w")
    this.startPolling();
  }

  startPolling() {
    const timestamp = new Date().getTime(); 
    this.api.checkActiveTravel(this.user.idUser,  timestamp).subscribe((response) => {
      if (response?.success) {
        console.log("TIEN ACTVA ", response);
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
      this.api.checkActiveTravel(this.user.idUser,  timestamp).subscribe((response) => {
        if (response?.success) {
          this.solicitud = response.result;
          this.idConductor = this.solicitud.idConductor;

        } else {
          this.getDestroyInterval();
          this.soli.resumePollingOnTripEnd();
          console.log('Solicitud finalizada o cancelada. Redirigiendo...');
         // this.cleanupAndRedirect();
        }
      });
    }, 2000)
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
