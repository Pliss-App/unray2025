import { Injectable, OnInit } from '@angular/core';

import { Platform } from '@ionic/angular';
//import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { Geolocation } from '@capacitor/geolocation';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Capacitor } from '@capacitor/core';
import { UserService } from './user.service';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  public watch: any;
  private locationSubject = new BehaviorSubject<{ lat: number, lon: number, heading: any }>({ lat: 0, lon: 0, heading: 0 });
  private watchLocationSubject = new BehaviorSubject<{ lat: number, lon: number, heading: any }>({ lat: 0, lon: 0, heading: 0 });
  currentPosition: any;
  location$ = this.locationSubject.asObservable();
  watchLocation$ = this.watchLocationSubject.asObservable();
  latitude: number = 0;
  longitude: number = 0;
  user: any;
  watchId: string | null = null;
  constructor(private androidPermissions: AndroidPermissions,private http: HttpClient,
     private userAuth: UserService, private geolocation: Geolocation, private auth: AuthService,
    private platform: Platform) {
      this.getUserLocation();
      this.watchUserLocation();
      this.user = this.auth.getUser();

    //  this.getCurrentLocation(); 

  }



  async getUserLocation() {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) return null;
      const coordinates = await Geolocation.getCurrentPosition();
      this.currentPosition = coordinates.coords;
      const coords = {
        lat: coordinates.coords.latitude, lon: coordinates.coords.longitude,
        heading: coordinates.coords.heading
      };
      this.locationSubject.next(coords);
      return 0;
    } catch (error) {
      console.error('Error obteniendo la ubicación:', error);
      return null;
    }
  }

 /* getUserLocation() {
      this.geolocation.getCurrentPosition( {
        enableHighAccuracy: true, // Asegura mejor precisión
        timeout: 30000, // Tiempo de espera antes de fallar
        maximumAge: 0, // No usar caché de ubicación
      }).then((position) =>{

          const coords = {
            lat: position.coords.latitude, lon: position.coords.longitude,
            heading: position.coords.heading
          };
          this.locationSubject.next(coords);
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
        },
       
      );

  } */
/*
  watchUserLocation() {
      this.geolocation.watchPosition(      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }).subscribe((position: any)=>{
          const coords = {
            lat: position.coords.latitude, lon: position.coords.longitude,
            heading: position.coords.heading
          };

          this.watchLocationSubject.next(coords);
          var angle = position.coords.heading;
          var angl: number = Number(angle);
          if (this.auth.isLoggedIn()) {
            if (this.auth.getRole() == 'conductor') {
              this.saveCoordinates(position.coords.latitude, position.coords.longitude, angl);
            }
          }
        },  (error) => {
          console.error('Error obteniendo ubicación:', error);
        },);

  }
*/

  async watchUserLocation() {

  try {
    this.watch = await Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 4000, // 10s de espera
        maximumAge: 0,
      },
      (position, err) => {
        if (err) {
          console.error('Error al obtener ubicación:', err);
          return;
        }
  
        const coords: any = {
          lat: position?.coords.latitude, lon: position?.coords.longitude,
          heading: position?.coords.heading
        };
    
        this.watchLocationSubject.next(coords);
        var angle = position?.coords.heading;
        var angl: number = Number(angle);
        if (this.auth.isLoggedIn()) {
          if (this.auth.getRole() == 'conductor') {
            this.saveCoordinates(position?.coords.latitude, position?.coords.longitude, angl);
          }
        }
      }
    );
  } catch (error) {
    console.error('Error al iniciar el seguimiento:', error);
  }

}
  /* startTracking(idUser: number) {
     this.watch = this.geolocation.watchPosition();
     this.watch.subscribe((position: any) => {
       if (position && position.coords) {
         const lat = position.coords.latitude;
         const lng = position.coords.longitude;
 
         // Envía las coordenadas al backend o actualiza el marcador.
         this.saveCoordinates(lat, lng, idUser);
       }
     });
   }*/

  stopTracking() {
    if (this.watch) {
      this.watch.unsubscribe();
    }
  }

  getAutocompleteSuggestions(query: string) {
    const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json?key=yhGwpc1KP3yK4Pqb7KZXjJD91wf3aTy9&limit=100`;
    return this.http.get(url);
  }

  saveCoordinates(lat: any, lng: any, heading: any) {
    var data = {
      iduser: this.user.idUser,
      lat: lat,
      lon: lng,
      angle: heading
    }
    this.userAuth.updatetLocation(data).subscribe(() => {
    },
      (error) => {
        console.error('Error al enviar las coordenadas:', error);
      });
  }



  async checkPermissions() {
    if (!Capacitor.isNativePlatform()) {
      console.log('El permiso se gestiona automáticamente en la web.');
      return true;
    }

    try {
      const permission = await Geolocation.requestPermissions();
      return permission.location === 'granted';
    } catch (error) {
      console.error('Error solicitando permisos:', error);
      return false;
    }
  }

}
