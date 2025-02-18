import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
@Injectable({
  providedIn: 'root'
})
export class ConductorService {

  constructor(private apiService: ApiService) { }

  getSolicitudes(id:any) {
    return this.apiService.get(`viaje/solicitudes/${id}`);
  }

  procesarSolicitud(idConductor:any,data: any){
    return this.apiService.post(`viaje/solicitudes/${idConductor}/accion`, data);
  }

  aceptarSolicitud(data: any){
    return this.apiService.post('viaje/aceptar_solicitud',data);
  }

}
