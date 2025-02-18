import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import * as tt from '@tomtom-international/web-sdk-maps';
import * as ttServices from '@tomtom-international/web-sdk-services';
import { SharedService } from 'src/app/core/services/shared.service';

@Component({
  selector: 'app-search-direction',
  templateUrl: './search-direction.component.html',
  styleUrls: ['./search-direction.component.scss'],
})
export class SearchDirectionComponent implements OnInit, AfterViewInit {
  searchText: string = '';
  savedAddresses: { label: string; lat: number; lng: number, id: string }[] = [];
  // Data passed in by componentProps
  @Input() direction: string | undefined;
  @Input() lastName: string | undefined;
  @Input() middleInitial: string | undefined;
  isFijar: boolean = false;
  lat: any;
  lng: any;

  latitude: any;
  longitude: any;
  map: any;
  currentMarker: any;
  positionSubscription: Subscription | undefined;
  googleStyleIconUrl = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
  data: any;
  constructor(private modalController: ModalController, 
    private sharedDataService: SharedService, 
    public modalCtrl: ModalController, navParams: NavParams, 
) {
    // console.log("DIRECCIN ,", this.direction, " -- ", this.lat)
  }

  ngOnInit() {
    this.getCurrentPosition();
  }

  ngAfterViewInit() {

  }

  getCurrentPosition() {
        this.initializeMap(this.lat, this.lng);
  
  }

  initializeMap(lat: number, lon: number) {
    this.map = tt.map({
      key: 'yhGwpc1KP3yK4Pqb7KZXjJD91wf3aTy9',    // Reemplaza con tu clave de API de TomTom
      container: 'map_direction',                    // ID del contenedor del mapa en el HTML
      center: [lon, lat],           // Coordenadas iniciales (Ámsterdam en este ejemplo)
      zoom: 12
    });

    setTimeout(() => {
      this.map.resize();
    }, 500);

    this.currentMarker = this.createCustomMarker(lat, lon);
    this.map.setCenter([lon, lat]);
  }

  createCustomMarker(lat: number, lon: number) {
    const persIcon = document.createElement("div");
    persIcon.style.backgroundImage = `url(assets/marker/userlocal.png)`;
    persIcon.style.backgroundRepeat = 'no-repeat';
    persIcon.style.backgroundSize = "contain";
    persIcon.style.width = "50px";
    persIcon.style.height = "50px";

    // Crear el marcador con el icono personalizado
    const marker = new tt.Marker({
      element: persIcon,
      anchor: 'bottom',
      draggable: true
    })
      .setLngLat([lon, lat])
      .addTo(this.map);

    marker.on('dragend', () => {
      this.isFijar = false;
      const newCoordinates = marker.getLngLat();
      this.latitude = newCoordinates.lat;
      this.longitude = newCoordinates.lng;

      if(this.direction=== 'salida'){
        const data = { lat: newCoordinates.lat, lng: newCoordinates.lng};
        this.sharedDataService.locate(data);
      } else if(this.direction=== 'destino'){
        const data = { lat: newCoordinates.lat, lng: newCoordinates.lng, direction: 'destino'};
        this.sharedDataService.destination(data);
      }

      this.map.setCenter([newCoordinates.lng, newCoordinates.lat]);
      this.reverseGeocoding(newCoordinates.lat, newCoordinates.lng);
      this.isFijar= true;

    });

    return marker;
  }


  searchAddress(event: any) {
    const query = event.target.value;
    if (!query || query.trim() === '') return;
    var data = null;
    
    ttServices.services.fuzzySearch({
      key: 'yhGwpc1KP3yK4Pqb7KZXjJD91wf3aTy9',
      query: query,
      mapcodes: 'Local',
      countrySet: 'GT',// Limita la búsqueda a Guatemala
      limit: 100,  // Obtiene más resultados (máximo 100)

      //typeahead: true,  // Habilita sugerencias en tiempo real
      //idxSet: 'POI,PAD,Geo,Addr,Str,XStr',  // Incluye Puntos de Interés, Geocódigos y Direcciones
      minFuzzyLevel: 1,  // Ajusta la sensibilidad de la búsqueda
      maxFuzzyLevel: 2   // Amplía el rango de búsqueda de coincidencias
    }).then((result: any) => {
      this.savedAddresses = [];
      data = result;
      var directions = data.results;

  
      for (let i in directions) {

        this.savedAddresses.push({
          lat: directions[i].position.lat,
          label: directions[i].address.freeformAddress,
          lng: directions[i].position.lng,
          id: directions[i].id
        })
      }
    }).catch((error: any) => {
      console.error("Error al buscar la dirección:", error);
    });
  }

  getDirection(item: any) {
    this.isFijar= false;
    if (this.currentMarker) {
      this.latitude = item.lat;
      this.longitude = item.lng;
      this.currentMarker.setLngLat([item.lng, item.lat]);
      this.isFijar= true;
      this.map.setCenter([item.lng, item.lat]);
      this.savedAddresses = [];

      const data = { lat: item.lat, lng: item.lng, direction: 'destino'};
      this.sharedDataService.destination(data);
    }
  }


  reverseGeocoding(lat: number, lng: number) {
    ttServices.services
      .reverseGeocode({
        key: 'yhGwpc1KP3yK4Pqb7KZXjJD91wf3aTy9',
        position: { lat: lat, lng: lng },
      })
      .then((result: any) => {
        this.searchText = result.addresses[0].address.freeformAddress;
      });

    return this.searchText;
  }

  onClearSearch() {
    this.searchText = '';
    this.savedAddresses = [];
  }

  dismiss() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  closeAndReturnData() {
    var data: any = null;
    if (this.direction === 'salida') {
      data = {
        lat:  this.latitude,
        lng:  this.longitude,
        direction: this.direction
      };
    } else if (this.direction === 'destino') {
      data = {
        lat:  this.latitude,
        lng:  this.longitude,
        direction: this.direction
      };
    }

    this.modalController.dismiss(data);
  }



  fijarAndReturnData() {
    var data: any = null;
    if (this.direction === 'salida') {
      data = {
        lat: this.lat,
        lng: this.lng,
        direction: this.direction
      };
    } else if (this.direction === 'destino') {
      data = {
        lat: "this.lat",
        lng: "this.lng",
        direction: this.direction
      };
    }

    this.modalController.dismiss(data);
  }


}
