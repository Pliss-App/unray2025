import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private apiService: ApiService) { }

  // Obtener perfil del usuario actual
  getUserProfile() {
    return this.apiService.get('user/profile');
  }

  // Obtener usuario conductor
  getDriverProfile(id: any) {
    return this.apiService.get(`viaje/soli/driver/${id}`);
  }

    // Obtener usuario 
    getUserProfileDriver(id: any) {
      return this.apiService.get(`viaje/soli/user/${id}`);
    }
  


  getServicios() {
    return this.apiService.get('servicios/todos');
  }

  getSaldo(id: any) {
    return this.apiService.get(`conductor/saldo-billetera/${id}`);
  }



  getFoto(id: any) {
    return this.apiService.get(`user/foto/${id}`);
  }

  updatetLocation(data: any) {
    return this.apiService.post(`user/update-location`, data);
  }

  updatePasswordNew(data: any) {
    return this.apiService.post(`user/reset-password`, data);
  }

  cancelarSolicitud(data: any) {
    return this.apiService.put(`viaje/cancelar-viaje`, data);
  }

  recover(data: any) {
    return this.apiService.post(`user/recover`, data);
  }

  insertDocumentos(data: any) {
    return this.apiService.post(`documentacion/insert`, data);
  }

  recargarBilletara(data: any) {
    return this.apiService.post(`conductor/recargar-billetera`, data);
  }

  getDocumentacion(id: any) {
    return this.apiService.get(`user/documentacion/${id}`);
  }

  getDocumentacionRequisitos() {
    return this.apiService.get(`documentacion/requisitos`);
  }

  createProfile(data: any) {
    return this.apiService.post('user/registro', data);
  }

  // Actualizar perfil del usuario
  updateUserProfile(id: any, data: any) {
    return this.apiService.put(`user/updateUser/${id}`, data);
  }

  // Actualizar perfil del usuario
  updateFotoPerfil(data: any) {
    return this.apiService.put('user/updateFoto', data);
  }

  createSolicitud(data: any) {
    return this.apiService.post('viaje/solicitudes', data);
  }


  createSolicitudDriver(data: any) {
    return this.apiService.post('viaje/crear_viaje', data);
  }

  aceptarSolicitud(data: any){
    return this.apiService.post('viaje/aceptar_solicitud',data);
  }

  // Actualizar perfil del usuario
  deleteSolicitud(id: any) {
    console.log("DATOS PARA ELIMINAR ", id)
    return this.apiService.delete(`viaje/delete_solicitud/${id}`);
  }

  checkActiveTravel(userId: any, timestamp: number) {
    return this.apiService.get(`viaje/soli_user/${userId}`);
  }

  vaijeActiveTravel(userId: any) {
    return this.apiService.get(`viaje/soli_user/${userId}`);
  }

  sendMensajes(data: any) {
    return this.apiService.sendChat(`viaje/send/mensajes`, data);
  }

  getMensajes(emisor_id: any, receptor_id: any) {
    return this.apiService.getChat(`viaje/obtener/mensajes`, emisor_id, receptor_id);
  }

  getLocation(id: any) {
    return this.apiService.get(`viaje/location_driver/${id}`);
  }

  getIconDriverLocation(id: any) {
    return this.apiService.get(`user/icon-driver/${id}`);
  }

  getestadoviaje(id: any) {
    return this.apiService.get(`viaje/estado_viaje/${id}`);
  }

  getCancelacionRoute() {
    return this.apiService.get(`viaje/motivos_cancelacion`);
  }

  getNoCalificacionUsuario(id:any, rol:any) {
    return this.apiService.get(`viaje/soli_calificacion_usuario/${id}/${rol}`);
  }

  getNoCalificacionConductor(id:any, rol:any) {
    return this.apiService.get(`viaje/soli_calificacion_conductor/${id}/${rol}`);
  }

  updateEstadoViaje({ data }: { data: any; }) {
    return this.apiService.put(`viaje/update-estado-viaje`, data);
  }  

  finalizarViaje(data: any) {
    return this.apiService.put(`viaje/finalizar-viaje`, data);
  } 

  updateTokenOneSignal(data: any) {
    return this.apiService.put(`viaje/update-onesignal`, data);
  } 

  guardarCalificacion(data: any) {
    return this.apiService.post('viaje/calificar', data);
  }

  updatetSocketIo(data: any) {
    return this.apiService.put(`user/update-socket-io`, data);
  }
}
