import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl ='https://unrayappserver.onrender.com/api'; //'https://unrayappserver.onrender.com/api';

  constructor(private http: HttpClient) {}

  // Configuración de encabezados
  private getHeaders() {
    const token = JSON.parse(localStorage.getItem('currentUser')!)?.token;
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Método para obtener datos
  get(endpoint: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${endpoint}`, { headers: this.getHeaders() });
  }

  // Método para enviar datos
  post(endpoint: string, data: any): Observable<any> {
   
    return this.http.post(`${this.apiUrl}/${endpoint}`, data, { headers: this.getHeaders() });
  }

  // Método para actualizar datos
  put(endpoint: string, data: any): Observable<any> {

    return this.http.put(`${this.apiUrl}/${endpoint}`, data, { headers: this.getHeaders() });
  }

  // Método para eliminar datos
  delete(endpoint: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${endpoint}`, { headers: this.getHeaders() });
  }

//Esto es solo para mensajes del chat 
  sendChat(endpoint: string, data:any) {
    return this.http.post(`${this.apiUrl}/${endpoint}`, data);
  }

  getChat(endpoint: string, emisor_id: number, receptor_id: number) {
    return this.http.get(`${this.apiUrl}/${endpoint}`, {
      params: { emisor_id: emisor_id, receptor_id: receptor_id },
    });
  }
}
