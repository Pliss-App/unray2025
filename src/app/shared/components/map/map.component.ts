import { Component, Input, OnInit } from '@angular/core';
import * as tt from '@tomtom-international/web-sdk-maps';
import { SharedService } from 'src/app/core/services/shared.service';
import * as ttServices from '@tomtom-international/web-sdk-services';
import { async, Subscription } from 'rxjs';
import { LocationService } from 'src/app/core/services/location.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})

export class MapComponent implements OnInit {
  @Input() markers: { lat: number; lon: number; label?: string }[] = [];
  latitude: number | undefined;
  longitude: number | undefined;
  map: any;
  currentPosition = { lat: 0, lon: 0 };
  currentMarker: any;
  markeWatchPosition: any = null;
  positionSubscription: Subscription | undefined;
  googleStyleIconUrl = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
  markerDestination: any = null;
  coordSalida: any = null;
  coordDestino: any = null;
  ruteEstimate: any = null;
  routeLayer: any = null;

  constructor(private location: LocationService, private sharedDataService: SharedService) {
  }


  ngOnInit() {
    this.getCurrentPosition();
    this.meLocation();
    this.meDestination();
  }

  ionViewWillEnter() {
    this.routeLayer = null;
  }

  ionViewWillLeave() {
    if (this.markerDestination) {
      this.markerDestination.remove();
      this.markerDestination = null;
    };

    this.coordSalida = null;
    this.coordDestino = null;
    this.ruteEstimate = null;
  }

  initializeMap(lat: number, lon: number) {
    this.map = tt.map({
      key: 'yhGwpc1KP3yK4Pqb7KZXjJD91wf3aTy9',    // Reemplaza con tu clave de API de TomTom
      container: 'map',                    // ID del contenedor del mapa en el HTML
      center: [lon, lat],           // Coordenadas iniciales (Ámsterdam en este ejemplo)
      zoom: 14
    });
    this.startTracking();
    this.map.setCenter([lon, lat]);
    this.currentMarker = this.createCustomMarker(lat, lon);
    this.coordSalida = { lng: lon, lat: lat };
    setTimeout(() => {
      this.map.resize();
    }, 500);

  }

  async startTracking() {
    this.positionSubscription = await this.location.watchLocation$.subscribe(async coords => {
      if (coords) {
        var angle = coords.heading || 0;
        if (this.markeWatchPosition) {
          //  this.updateMarkerPosition(coords.lat, coords.lon);
          // Actualizar la posición y la rotación del marcador
          this.markeWatchPosition.setLngLat([coords.lon, coords.lat]);
          const arrowElement = this.markeWatchPosition.getElement().querySelector('div > div:last-child');
          if (arrowElement) {
            arrowElement.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
          }
        } else {
          this.markeWatchPosition = new tt.Marker({
            element: this.createCustomPointElement(45), // Método para crear el punto y la flecha
            anchor: 'center'
          }).setLngLat([coords.lon, coords.lat])
            .addTo(this.map);
        }

      }
    })
  }


  getCurrentPosition() {
    this.location.location$.subscribe(async coords => {
      this.initializeMap(coords.lat, coords.lon);
      this.currentPosition.lat = coords.lat;
      this.currentPosition.lon = coords.lon;
    })
  }

  createCustomMarker(lat: number, lon: number) {
    const persIcon = document.createElement("div");
    persIcon.style.backgroundImage = `url(assets/marker/userlocal.png)`;
    persIcon.style.backgroundRepeat = 'no-repeat';
    persIcon.style.backgroundSize = "contain";
    persIcon.style.width = "50px";
    persIcon.style.height = "50px";


    // Crear el marcador con el icono personalizado
    this.actualizarDato(lon, lat);
    const marker = new tt.Marker({
      element: persIcon,
      anchor: 'bottom',
      draggable: true,
    })
      .setLngLat([lon, lat])
      .addTo(this.map);
    marker.on('dragend', () => {
      const newCoordinates = marker.getLngLat();
      this.coordSalida = { lng: newCoordinates.lng, lat: newCoordinates.lat }
      this.actualizarDato(newCoordinates.lng, newCoordinates.lat);
      if (this.coordDestino != null) {
        this.calculeRouter();
      }
    });

    return marker;
  }


  addMarkers() {
    this.markers.forEach((marker: any) => {
      new tt.Marker({
        //  element: persIcon,
        anchor: "center",
        draggable: true,
      })
        .setLngLat([marker.lon, marker.lat])
        .addTo(this.map);
    });
  }

  actualizarDato(lng: number, lat: number) {
    const data = { lat: lat, lng: lng };
    this.sharedDataService.setData(data);
  }

  addCustomMarkerWithRadius(lng: number, lat: number, radius: number, orientation: number) {
    this.map.on('load', () => {
      if (this.map.getLayer("circle-radius")) {
        this.map.removeLayer("circle-radius");
      }

      if (this.map.getSource("circle-radius")) {
        this.map.removeSource("circle-radius");
      }
      // Agregar el círculo de radio alrededor
      this.map.addLayer({
        id: 'circle-radius',
        type: 'circle',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [lng, lat]
              }
            }]
          }
        },
        paint: {
          'circle-radius': radius / 100, // Ajuste según el nivel de zoom y la unidad
          'circle-color': '#007aff',
          'circle-opacity': 0.8,
        }
      });
    });
  }

  createCustomPointElement(angle: number): HTMLElement {
    // Contenedor principal
    const element = document.createElement('div');
    element.style.width = '40px';
    element.style.height = '40px';
    element.style.position = 'relative';


    // Círculo (punto)
    const circle = document.createElement('div');
    circle.style.width = '13px';
    circle.style.height = '13px';
    circle.style.backgroundColor = '#4285F4'; // Color azul de Google Maps
    circle.style.borderRadius = '50%';
    circle.style.position = 'absolute';
    circle.style.top = '50%';
    circle.style.left = '50%';
    circle.style.transform = 'translate(-50%, -50%)';

    // Flecha (triángulo)
    const arrow = document.createElement('div');
    arrow.style.width = '0';
    arrow.style.height = '0';
    arrow.style.borderLeft = '4px solid transparent';
    arrow.style.borderRight = '4px solid transparent';
    arrow.style.borderBottom = '8px solid #4285F4'; // Color azul de Google Maps
    arrow.style.position = 'absolute';
    arrow.style.zIndex = '2'
    arrow.style.top = '5%';
    arrow.style.left = '50%';
    arrow.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`; // Rotar la flecha según la dirección

    // Agregar círculo y flecha al contenedor
    element.appendChild(circle);
    element.appendChild(arrow);

    return element;
  }

  meLocation() {
    this.sharedDataService.melocation.subscribe((data) => {
      if (data) {
        this.coordSalida = { lng: data.lng, lat: data.lat }
        this.currentMarker.setLngLat([data.lng, data.lat]);
        this.map.setZoom(15);
        this.map.setCenter([data.lng, data.lat]);
        this.actualizarDato(data.lng, data.lat);
        if (this.coordDestino != null) {
          this.calculeRouter();
        }
      }
    });
  }

  meDestination() {
    this.sharedDataService.medestination.subscribe((data) => {

      if (data) {

        this.coordDestino = { lng: data.lng, lat: data.lat }
        if (this.markerDestination) {
          this.markerDestination.setLngLat([data.lng, data.lat]);
        } else {

          this.markerDestination = new tt.Marker({

            anchor: 'center',

          }).setLngLat([data.lng, data.lat])
            .addTo(this.map);
          //this.currentMarker.setLngLat([data.lng, data.lat]);
          /* this.map.setZoom(13);
          */
          // this.actualizarDato(data.lng, data.lat);
        }

        if (data.direction === 'destino') {
          this.calculeRouter()
        }
        this.map.setCenter([data.lng, data.lat]);
      }
    });
  }

  calculeRouter() {
    ttServices.services.calculateRoute({
      key: 'yhGwpc1KP3yK4Pqb7KZXjJD91wf3aTy9',
      locations: [
        { lng: this.coordSalida.lng, lat: this.coordSalida.lat },
        //...points,
        { lng: this.coordDestino.lng, lat: this.coordDestino.lat }
      ],
      travelMode: "car",
      avoid: "tollRoads"
    }).then(response => {
      var timeToDestination = null;
      var destinationDistance = null;
      timeToDestination = (
        response.routes[0].summary.travelTimeInSeconds / 60
      ).toFixed(2);
      destinationDistance = (
        response.routes[0].summary.lengthInMeters / 1000
      ).toFixed(2);

      this.ruteEstimate = {
        time: timeToDestination,
        distance: destinationDistance,
        abrtime: 'min',
        abrdistance: 'km'
      };

      this.sharedDataService.distance(this.ruteEstimate);
      const geoJson = response.toGeoJson();

      this.pinterRouteMap(geoJson);
      /*  this.markerMiPosition.setLngLat([
          this.myCoordPosition.lng,
          this.myCoordPosition.lat,
        ]);*/
    }).catch(error => {
    })
  }

  pinterRouteMap(geojson: any) {
    if (this.map.getLayer("routeLayer")) {
      this.map.removeLayer("routeLayer");
    }

    if (this.map.getSource("routeLayer")) {
      this.map.removeSource("routeLayer");
    }

    this.routeLayer = this.map.addLayer({
      id: "routeLayer",
      type: "line",
      source: {
        type: "geojson",
        data: geojson,
      },
      paint: {
        "line-color": "#4a90e2",
        "line-width": 6,
      },
    });

    const tt = window.tt;
    const bounds = new tt.LngLatBounds();
    geojson.features[0].geometry.coordinates.forEach((coord: any) => {
      bounds.extend([coord[0], coord[1]]);
    });

    this.map.fitBounds(bounds, {
      padding: { top: 50, bottom: 50, left: 50, right: 50 },
      maxZoom: 15,
      duration: 1000,
    });
  }

  ngOnDestroy() {
    /*  if (this.positionSubscription) {
        this.positionSubscription.unsubscribe();
      } */

    if (this.map) {


      if (this.markerDestination) {
        this.markerDestination.remove();
        this.markerDestination = null;    // Limpia la referencia
      }

      this.map.removeLayer("routeLayer").
        this.map.remove(); // Elimina el mapa de TomTom
      this.map = null;   // Limpia la referencia
    }
  }
}
