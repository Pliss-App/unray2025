import { Component, OnInit } from '@angular/core';
import * as tt from '@tomtom-international/web-sdk-maps';
import { SharedService } from 'src/app/core/services/shared.service';
import * as ttServices from '@tomtom-international/web-sdk-services';
import { Subscription } from 'rxjs';
import { LocationService } from 'src/app/core/services/location.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.scss'],
})
export class MapaComponent implements OnInit {
  map: any;
  user: any = {};
  marker: any;
  previousCoords: { lon: number, lat: number } | null = null;
  mapLoaded: boolean = false;

  constructor(private location: LocationService, private authService: AuthService) {
    this.user = this.authService.getUser();
  }


  async ngOnInit() {
    await this.initializeMap();
    await this.startWatchPosition()
  }


  ionViewDidEnter() {
  }


  async initializeMap() {
    await this.location.location$.subscribe(async coords => {
      if (!this.map) {
        this.map = tt.map({
          key: 'yhGwpc1KP3yK4Pqb7KZXjJD91wf3aTy9',    // Reemplaza con tu clave de API de TomTom
          container: 'mapa_conductor',  
          style: `https://api.tomtom.com/style/2/custom/style/dG9tdG9tQEBAQVBDVzhDd3hBdDJHR0NaRDsrF1U07ZZLlIkpMaGnngb6.json?key=yhGwpc1KP3yK4Pqb7KZXjJD91wf3aTy9`,                  // ID del contenedor del mapa en el HTML
          center: [coords.lon, coords.lat],           // Coordenadas iniciales (Ámsterdam en este ejemplo)
          zoom: 16
        });

        // Escuchar el evento de rotación del mapa
        this.map.on('rotate', () => {
          const currentAngle = this.getCurrentMarkerRotation();
        });

        setTimeout(() => {
          this.map.resize(); // Redimensionar el mapa
        }, 50);

      }
    })


  }

  getCurrentMarkerRotation(): number {
    const markerElement = this.marker.getElement().querySelector(`img[alt="${this.user.marker}"]`);
    if (markerElement) {
      const transform = markerElement.style.transform;
      const angle = transform.replace('rotate(', '').replace('deg)', '');
      return parseInt(angle, 10);
    }
    return 0;
  }

  async startWatchPosition() {
    this.location.watchLocation$.subscribe((coords) => {
      const coordenadas = {
        lon: coords.lon,
        lat: coords.lat,
      };
      const angle = coords.heading || 0;
    this.initializeRealTimeMarker(coordenadas, angle);
      //this.initializeRealTimeMarker2(coordenadas, angle)
    })
  }

  // Método para inicializar el marcador
  initializeRealTimeMarker(coords: { lon: number, lat: number, }, angle: number) {
    if (!this.marker) {
      this.marker = new tt.Marker({
        element: this.createCustomPointElement(angle), // Crear el elemento personalizado
        anchor: 'center'
      }).setLngLat([coords.lon, coords.lat])
        .addTo(this.map);
    } else {
      this.marker.setLngLat([coords.lon, coords.lat]);
      this.updateMarkerRotation(angle); // Actualizar la rotación
    }
  }

  // Método para actualizar la rotación del marcador
  updateMarkerRotation(angle: number) {
    const arrowElement = this.marker.getElement().querySelector(`img[alt="${this.user.marker}"]`);
    if (arrowElement) {
      const mapRotation = this.map.getBearing();
      arrowElement.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    }
  }

  /*
  updateMarkerRotation(angle: number) {
    const arrowElement = this.marker.getElement().querySelector(`img[alt="${this.user.marker}"]`);
    if ( arrowElement) {
      const mapRotation = this.map.getBearing();
      arrowElement.style.transform = `rotate(${angle}deg)`;
    }
  }*/

  createCustomPointElement(angle: number): HTMLElement {
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="position: relative;">
        <img src="assets/img/${this.user.marker}/marker.png" alt="${this.user.marker}" style="width: 35px; height: 35px; transform: rotate(${angle}deg); transition: transform 0.2s;">
      </div>
    `;
    return element;
  }



  async initializeRealTimeMarker2(coords: { lon: number, lat: number }, angle: number) {
    // Ajustar la ubicación con Map Matching
    const correctedCoords = await this.correctLocationWithMapMatching(coords);
  
    if (!this.marker) {
      this.marker = new tt.Marker({
        element: this.createCustomPointElement(angle),
        anchor: 'center',
      })
        .setLngLat([correctedCoords.lon, correctedCoords.lat])
        .addTo(this.map);
    } else {
      this.marker.setLngLat([correctedCoords.lon, correctedCoords.lat]);
      this.updateMarkerRotation(angle);

     
        this.smoothTransition({ lon: correctedCoords.lon, lat: correctedCoords.lat }, correctedCoords);
      
    }
  }
  

  async correctLocationWithMapMatching(coords: { lon: number, lat: number }) {
    const url = `https://api.tomtom.com/traffic/services/4/map/match/route?key=yhGwpc1KP3yK4Pqb7KZXjJD91wf3aTy9`;
  
    const body = {
      route: [
        {
          lat: coords.lat,
          lon: coords.lon,
          timestamp: Date.now()
        }
      ]
    };
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
  
      const data = await response.json();
  
      if (data.matchedPoints && data.matchedPoints.length > 0) {
        return {
          lat: data.matchedPoints[0].latitude,
          lon: data.matchedPoints[0].longitude,
        };
      }
    } catch (error) {
      console.error('Error en Map Matching:', error);
    }
  
    return coords; // Si falla, usa las coordenadas originales
  }
  

  smoothTransition(start: { lon: number, lat: number }, end: { lon: number, lat: number }, duration = 2000) {
    let startTime: number | null = null;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
  
      const interpolated = {
        lon: start.lon + (end.lon - start.lon) * progress,
        lat: start.lat + (end.lat - start.lat) * progress,
      };
  
      this.marker.setLngLat([interpolated.lon, interpolated.lat]);
  
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
  
    requestAnimationFrame(animate);
  }

  
}
