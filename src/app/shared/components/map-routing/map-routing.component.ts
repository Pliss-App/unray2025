import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import * as tt from '@tomtom-international/web-sdk-maps';
import { SharedService } from 'src/app/core/services/shared.service';
import * as ttServices from '@tomtom-international/web-sdk-services';
import { UserService } from 'src/app/core/services/user.service';
import { LocationService } from 'src/app/core/services/location.service';


@Component({
  selector: 'app-map-routing',
  templateUrl: './map-routing.component.html',
  styleUrls: ['./map-routing.component.scss'],
})
export class MapRoutingComponent implements OnInit {
  @Input() idConductor: string | null = null;
  @Input() origin!: { lat: number; lng: number }; // Coordenadas de salida
  @Input() destination!: { lat: number; lng: number }; // Coordenadas de destino
  @Input() waypoints: { lat: number; lng: number }[] = []; // Puntos intermedios opcionales
  @Input() idSoli: string | undefined; // Puntos intermedios opcionales
  previousCoords: { lon: number, lat: number } | null = null;
  latitude: number | undefined;
  longitude: number | undefined;
  map: any;
  marker: any;
  estados: any = null;
  currentMarker: any;
  iconDriver: any = null;
  coordeDriver: any;
  tipoPunto: any;
  tiempo: number = 0;
  intervalEstadoId: any;
  intervalLocationId: any;

  constructor(private locationService: LocationService,
    private cdRef: ChangeDetectorRef,
    private shared: SharedService,
    private sharedDataService: SharedService,
    private uSer: UserService) {
  }

  ngOnInit() {
    this.initializeMap();
    this.cdRef.detectChanges();
    /*  setTimeout(() => {
        
       
      }, 500); */
    this.meLocation();
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.map.resize();
    }, 500);
  }


  initializeMap() {
    this.map = tt.map({
      key: 'yhGwpc1KP3yK4Pqb7KZXjJD91wf3aTy9',    // Reemplaza con tu clave de API de TomTom
      container: 'map-routing',                    // ID del contenedor del mapa en el HTML
      center: this.origin, //|| [lon, lat],         // Coordenadas iniciales (Ámsterdam en este ejemplo)
      zoom: 16
    });
    this.map.setCenter(this.origin);
    this.addMarker(this.origin, 'Salida');
    this.addMarker(this.destination, 'Destino');

    if (this.waypoints.length > 0) {
      this.waypoints.forEach((point, index) =>
        this.addMarker(point, `Punto ${index + 1}`)
      );
    }
    this.getLocationDriver();
    this.getEstadoViaje();
    this.intervalEstadoId = setInterval(() => {
      this.getEstadoViaje();
    }, 1000)
  }

  getEstadoViaje() {
    const response = this.uSer.getestadoviaje(this.idSoli);
    response.subscribe((re) => {
      this.estados = re.result[0];

      if (this.estados.estado_viaje == 'En Ruta a Destino' || this.estados.estado_viaje == 'Conductor Llego a Salida') {
        //   this.drawRoute('B');
        this.tipoPunto = 'B';
      } else if (this.estados.estado_viaje == 'En Ruta a Salida') {
        // this.drawRoute('A');
        this.tipoPunto = 'A';
      }
    })
  }

  getLocationDriver() {
    this.getLocation()
  }

  getLocation() {
    const responses = this.uSer.getIconDriverLocation(this.idConductor);
    responses.subscribe((re) => {
      this.intervalLocationId = setInterval(() => {
        this.uSer.getLocation(this.idConductor).subscribe(
          (data: any) => {

            this.iconDriver = re.result;
            const { lat, lon, angle } = data.result[0];

            const coordenadas = {
              lon: lon,
              lat: lat,
            };
            this.coordeDriver = data.result[0];
            if (this.tipoPunto == 'A') {
              this.drawRoute('A');
            }
            this.initializeRealTimeMarker(coordenadas, angle)
          })
      }, 10000);
    },
      (error) => {
        console.error('Error al obtener coordenadas:', error);
      }

    );

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
    const arrowElement = this.marker.getElement().querySelector(`img[alt="${this.iconDriver}"]`);
    if (arrowElement) {
      const mapRotation = this.map.getBearing();
      arrowElement.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    }
  }

  createCustomPointElement(angle: number): HTMLElement {
    const element = document.createElement('div');
    element.innerHTML = `
    <div style="position: relative;">
      <img src="assets/img/${this.iconDriver}/marker.png" alt="${this.iconDriver}" style="width: 35px; height: 35px; transform: rotate(${angle}deg); transition: transform 0.2s;">
    </div>
  `;
    return element;
  }

  actualizarDato(lng: number, lat: number) {
    const data = { lat: lat, lng: lng };
    this.sharedDataService.setData(data);
  }

  meLocation() {
    this.sharedDataService.melocation.subscribe((data) => {
      if (data) {
        this.currentMarker.setLngLat([data.lng, data.lat]);
        this.map.setZoom(15);
        //    this.map.setCenter([data.lng, data.lat]);
        this.actualizarDato(data.lng, data.lat);
      }
    });
  }

  addMarker(position: { lat: number; lng: number }, title: string) {
    // Determinar el color del marcador según el título
    let markerColor = 'blue'; // Color por defecto
    if (title.toLowerCase() === 'salida') {
      markerColor = 'green';
    } else if (title.toLowerCase() === 'destino') {
      markerColor = 'red';
    }
    // Crear un marcador personalizado con el color
    const markerElement = document.createElement('div');
    markerElement.style.width = '24px';
    markerElement.style.height = '24px';
    markerElement.style.backgroundColor = markerColor;
    markerElement.style.borderRadius = '50%';
    markerElement.style.border = '2px solid white';
    markerElement.style.boxShadow = '0px 2px 6px rgba(0,0,0,0.3)';

    // Crear y añadir el marcador al mapa
    const marker = new tt.Marker({
      element: markerElement,
      anchor: 'bottom', // Asegurar que el marcador esté anclado correctamente
    })
      .setLngLat([position.lng, position.lat])
      .addTo(this.map);

    // Crea un popup
    const popup = new tt.Popup({
      offset: { bottom: [0, -20] }, // Coloca el popup encima del marcador
    }).setHTML(`<div class="custom-popup"><strong>${title}</strong></div>`);

    // Asociar el popup al marcador
    marker.setPopup(popup).togglePopup();
  }

  drawRoute(punto: any) {
    var routePoints: any;
    if (punto == 'B') {
      routePoints = [this.origin, ...this.waypoints, this.destination].map(
        (point) => ({ point })
      );
    } else {
      routePoints = [{ lat: this.coordeDriver.lat, lng: this.coordeDriver.lon }, this.origin,].map(
        (point) => ({ point })
      );
    }

    ttServices.services.calculateRoute({
      key: 'yhGwpc1KP3yK4Pqb7KZXjJD91wf3aTy9',
      traffic: true,
      routeType: 'fastest',
      locations: routePoints.map((p: any) => `${p.point.lng},${p.point.lat}`).join(':'),
    }).then((routeData) => {
      // Obtener el tiempo estimado de llegada
      const eta = routeData.routes[0].summary.travelTimeInSeconds; // en segundos
      const etaMinutes = Math.round(eta / 60); // convertir a minutos
      this.tiempo = etaMinutes;
      this.shared.changeParam(this.tiempo);
      const geoJson = routeData.toGeoJson();
      if (this.map.isStyleLoaded()) {
        this.addRouteLayer(geoJson);
      } else {
        this.map.once('style.load', () => {
          this.addRouteLayer(geoJson);
        });
      }

    });
  }

  addRouteLayer(geoJson: any) {
    if (this.map.getSource('route')) {
      (this.map.getSource('route') as tt.GeoJSONSource).setData(geoJson);
    } else {
      this.map.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: geoJson,
        },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#4a90e2',
          'line-width': 6,
          'line-opacity': 0.8, // Para suavidad
        },
      });
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }

    if (this.intervalEstadoId) {
      clearInterval(this.intervalEstadoId);
    }

    if (this.intervalLocationId) {
      clearInterval(this.intervalLocationId);
    }

    this.getLocation()
  }

}