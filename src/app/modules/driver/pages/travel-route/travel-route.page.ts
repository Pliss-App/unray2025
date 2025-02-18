import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  solicitud: any;
  idUser: string = '';
  user: any;
  idConductor: string = '';
  private intervalId: any;
  
  constructor(private router: Router, private shared: SharedService,
    private soli: SolicitudService,
    private api: UserService, private auth: AuthService) {

    this.user = this.auth.getUser();
  }

  ngOnInit() {
    this.startPolling();
  }

  startPolling() {
    const timestamp = new Date().getTime();
    this.api.checkActiveTravel(this.user.idUser, timestamp).subscribe((response) => {
      if (response?.success) {
        this.solicitud = response.result;
          this.idConductor = this.solicitud.idConductor;
      }
    });

    this.intervalId = setInterval(() => {
      const timestamp = new Date().getTime(); 
      this.api.checkActiveTravel(this.user.idUser,  timestamp).subscribe((response) => {
        if (response?.success) {
          this.solicitud = response.result;
          this.idConductor = this.solicitud.idConductor;
        } else {
          this.getDestroyInterval();
          this.soli.resumePollingOnTripEnd();
         // this.cleanupAndRedirect();
        }
      });
    }, 2000)
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
