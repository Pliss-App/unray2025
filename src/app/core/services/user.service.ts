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


  getRating(id:any) {
    return this.apiService.get(`user/rating/${id}`);
  }


  verificarCuenta(data:any) {
    return this.apiService.put(`user/verificar-cuenta`, data);
  }


  profileCalificacion(id:any) {
    return this.apiService.get(`user/usercalificacion/${id}`);
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
    return this.apiService.get('servicios/activos');
  }

  getEstado(id: any) {
    return this.apiService.get(`user/estado/${id}`);
  }

  getSaldo(id: any) {
    return this.apiService.get(`conductor/saldo-billetera/${id}`);
  }

  getPreguntasFrecuentes(rol:any) {
    return this.apiService.get(`user/preguntasfrecuentes/${rol}`);
  }

  getFoto(id: any) {
    return this.apiService.get(`user/foto/${id}`);
  }

  updatetLocation(data: any) {
    return this.apiService.post(`user/update-location`, data);
  }


  
  eliminarCuenta(data: any) {
    return this.apiService.put(`user/eliminar-cuenta`, data);
  }

  updatePasswordNew(data: any) {
    return this.apiService.put(`user/reset-password`, data);
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

  insertProblemaSugerencia(data: any) {
    return this.apiService.post(`user/insert-problema-sugerencia`, data);
  }

  insertNotaSoporteUsuario(data: any) {
    return this.apiService.post(`user/insertnotasoporteusuario`, data);
  }

  enviarSolicitud(data: any) {
    return this.apiService.post(`solicitudes/crear`, data);
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

  updateEstadoUser(id: any, data: any) {
    return this.apiService.put(`user/update-estado/${id}`, data);
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

  updateEstadoConductorViaje(id_: any) {
    return this.apiService.put(`solicitudes/update-estado-usuario`, {id: id_});
  }

  sendMensajes(data: any) {
    return this.apiService.sendChat(`viaje/send/mensajes`, data);
  }

  getMensajes(idViaje: any, emisor_id: any, receptor_id: any) {
    return this.apiService.getChat(`viaje/obtener/mensajes`,idViaje, emisor_id, receptor_id);
  }

  getLocation(id: any) {
    return this.apiService.get(`viaje/location_driver/${id}`);
  }

  getIconDriverLocation(id: any) {
    return this.apiService.get(`user/icon-driver/${id}`);
  }

  getHistorial(userId: any, role: any, offset:any) {
    return this.apiService.get(`viaje/historial?userId=${userId}&role=${role}&offset=${offset}`);
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

  //AQUI
  getNoCalificacion(id:any) {
    return this.apiService.get(`viaje/soli_no_calificacion/${id}`);
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


  getSMSDefinido(item:any) {
    return this.apiService.get(`viaje/obtener-sms-definido/${item}`);
  }


  getNotificacionesUser(id:any) {
    return this.apiService.get(`user/notificaciones/${id}`);
  }

  updatetNotificacion(data: any) {
    return this.apiService.put(`user/update-notificaciones`, data);
  }

}
