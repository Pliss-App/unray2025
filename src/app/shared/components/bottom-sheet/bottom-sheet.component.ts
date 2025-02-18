import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { Gesture, GestureController } from '@ionic/angular';
import { UserService } from 'src/app/core/services/user.service';
import { ModalController } from '@ionic/angular';
import { SearchDirectionComponent } from '../search-direction/search-direction.component';
import * as ttServices from '@tomtom-international/web-sdk-services';
import { SharedService } from 'src/app/core/services/shared.service';
import { reverseGeocoding } from 'src/app/utils/fnReutilizables';
import { ServicioService } from 'src/app/core/services/servicio.service';
import { RangoService } from 'src/app/core/services/rango.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { SolicitudService } from 'src/app/core/services/solicitud.service';
import { Subscription } from 'rxjs';
import { LocationService } from 'src/app/core/services/location.service';

@Component({
  selector: 'app-bottom-sheet',
  templateUrl: './bottom-sheet.component.html',
  styleUrls: ['./bottom-sheet.component.scss'],
})
export class BottomSheetComponent implements AfterViewInit, OnChanges {
  @ViewChild('bottomSheet', { read: ElementRef }) bottomSheet!: ElementRef;
  estadoSolicitud: string = '';
  conductorSeleccionado: string | null = null;
  minHeight = 100;  // Altura mínima del bottom sheet en píxeles
  maxHeight = window.innerHeight * 0.8;  // Altura máxima del bottom sheet (80% de la pantalla)
  currentHeight = this.minHeight;
  services: any = [];
  suggestions: string[] = [];
  lat: number = 0;
  lng: number = 0;
  @Input() data: string | null = null;
  directionSalida: any = "";
  directionDestino: any = "";
  listDestination: any = [];
  direccion: string = "";
  distance: any = null;
  listadoCostos: any = null;
  costoViaje: any = null;
  selectedServiceId: number | null = 1;
  isModalOpen = false;
  isActive: boolean = true;
  solicitud: any = {};
  idUser: any = {};
  private solicitudSubscription: Subscription | undefined;
  respuesta: any;

  constructor(
    private location: LocationService, 
    private solicitudService: SolicitudService, private authService: AuthService, 
    private rango: RangoService, private sharedService: SharedService, 
    public modalController: ModalController, private gestureCtrl: GestureController,
    private renderer: Renderer2, private userService: UserService,
    private service: ServicioService) {
    this.idUser = this.authService.getUser();
    this.solicitud.idService = this.selectedServiceId;
    this.solicitud.idConductor = null;
    this.location.location$.subscribe(async coords => {
      this.lat = coords.lat;
      this.lng = coords.lon;
      this.directionSalida = await reverseGeocoding(this.lat, this.lng);
      this.solicitud.start_lat = this.lat;
      this.solicitud.start_lng = this.lng;
      this.solicitud.start_direction = this.directionSalida;

    })
    this.getServicioCosto();
  }

  ngAfterViewInit() {
    this.getServicios();
    this.initializeGesture();
    this.meDestination();
    this.meDistance();
  }

  async ngOnInit() {
    this.positionSalida();
  // Escuchar si la solicitud expira

    // Escuchar las respuestas en tiempo real
    this.solicitudSubscription = await this.solicitudService.solicitudRespuesta$.subscribe(
      (respuesta) => {
        this.respuesta = respuesta;
        if (this.respuesta.success == false) {
          this.estadoSolicitud = this.respuesta.message;
          setTimeout(()=>{
            this.estadoSolicitud = ''
          },3000)
          //    this.userService.deleteSolicitud(this.respuesta.idSoli)
        } else {
          this.estadoSolicitud = this.respuesta.message;
          setTimeout(()=>{
            this.estadoSolicitud = ''
          },3000)
        }

        console.log('Respuesta recibida:', respuesta);
      }
    );
  }


  //limpiar al regresar
  ionViewWillEnter() {
    this.directionDestino = "";
  }

  //limpiar al salir
  ionViewWillLeave() {
    this.costoViaje = null;
    this.distance = null;
    this.isActive = true;
    this.estadoSolicitud = '';
    this.directionDestino = "";
    this.conductorSeleccionado = null;
  }


  async getServicioCosto() {
    const response = await this.service.getCostoServicios(1);
    response.subscribe((re) => {

      this.listadoCostos = re.result;
    })

  }

  positionSalida() {
    this.sharedService.currentData.subscribe(async (data) => {
      //  this.data = data;
      if (data) {
        this.lat = data.lat;
        this.lng = data.lng;

        this.directionSalida = await reverseGeocoding(this.lat, this.lng);

        this.solicitud.start_lat = this.lat;
        this.solicitud.start_lng = this.lng;
        this.solicitud.start_direction = this.directionSalida;
      }

    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      // console.log('Cambio detectado en data:', changes['data'].currentValue);
      // Puedes manejar cualquier otra lógica en respuesta a este cambio
    }
  }

  initializeGesture() {
    const gesture = this.gestureCtrl.create({
      el: this.bottomSheet.nativeElement,
      gestureName: 'bottom-sheet-swipe',
      onMove: (ev) => this.handleMove(ev),
      onEnd: () => this.handleEnd(),
    });
    gesture.enable();
  }


  getServicios() {
    try {
      const response = this.userService.getServicios();
      response.subscribe((re) => {
        if (re.result) {
          this.services = re.result;
        }
      })
    } catch (error) {
      console.error(error)
    }
  }

  handleMove(ev: any) {
    const newHeight = this.currentHeight - ev.deltaY;
    this.currentHeight = Math.max(this.minHeight, Math.min(newHeight, this.maxHeight));
    this.renderer.setStyle(this.bottomSheet.nativeElement, 'height', `${this.currentHeight}px`);
  }

  handleEnd() {
    this.renderer.setStyle(this.bottomSheet.nativeElement, 'height', `${this.currentHeight}px`);
  }

  async presentModal(item: any) {
    var lat: any = null;
    var lng: any = null;
    if (item == 'salida') {
      lat = this.lat;
      lng = this.lng;
    } else {
      lat = this.lat;
      lng = this.lng;
    }

    if (!this.isModalOpen) {
      this.isModalOpen = true;
      const modal = await this.modalController.create({
        component: SearchDirectionComponent,
        componentProps: {
          lat: lat,
          lng: lng,
          direction: item
        }
      });
      modal.onDidDismiss().then((dataReturned) => {
        this.isModalOpen = false;
        if (dataReturned !== null) {
          var data = dataReturned.data;

          if (data.destination == 'destino') {
            var coordenadas = { lat: data.lat, lng: data.lng }
            this.sharedService.destination(coordenadas);
            this.isActive = false;
          }
        }
      });

      return await modal.present();
    }
  }

  meDestination() {
    this.sharedService.medestination.subscribe(async (data) => {

      if (data) {
        this.directionDestino = await reverseGeocoding(data.lat, data.lng);
        this.solicitud.end_direction = this.directionDestino;
        this.solicitud.end_lat = data.lat;
        this.solicitud.end_lng = data.lng;
        this.isActive = false;
      } else {
        this.isActive = true;
      }
    });
  }

  meDistance() {
    this.sharedService.meDistance.subscribe(async (data) => {

      if (data) {
        this.distance = data;
        if (this.distance != null) {
          this.bottomSheet.nativeElement.style.height = '39vh';
          this.obtenerCostoViaje(this.distance.distance);
          this.solicitud.distance = this.distance.distance;
          this.solicitud.duration = this.distance.time;
          this.solicitud.distance_unit = this.distance.abrdistance;
          this.solicitud.duration_unit = this.distance.abrtime;
        }
      }
    });
  }


  // Simular el proceso de búsqueda
  async onSearch(event: any, item: any) {
    this.presentModal(item);
    /*  const modal = await this.modalController.create({
        component: SearchDirectionComponent
      });
      return await modal.present(); */
  }

  addDestination(item: any) {

  }

  async getService(item: any) {
    this.selectedServiceId = item.id;
    this.solicitud.idService = this.selectedServiceId;
    const response = await this.service.getCostoServicios(item.id);
    response.subscribe((re) => {
      this.listadoCostos = re.result;
      if (this.distance != null) {
        this.bottomSheet.nativeElement.style.height = '39vh';
        this.solicitud.distance = this.distance.distance;
        this.solicitud.duration = this.distance.time;
        this.solicitud.distance_unit = this.distance.abrdistance;
        this.solicitud.duration_unit = this.distance.abrtime;
        this.obtenerCostoViaje(this.distance.distance);
      }

    })
  }

  obtenerCostoViaje(km: any) {

    const servicio = this.rango.validarRango(this.listadoCostos, km);

    if (servicio) {
      var suma = servicio.costo_base + (servicio.precio_km * km);
      this.costoViaje = Math.round(suma);
      this.solicitud.costo = this.costoViaje;

    } else {
      console.log(`El valor ${km} no está en ningún rango.`);
    }
  }



  solicitar() {
    try {
      this.estadoSolicitud = 'Buscando el conductor más cercano...';
      this.conductorSeleccionado = null;
      const user: any = this.authService.getUser();
      this.solicitud.idUser = user.idUser;
      this.solicitud.fecha_hora = new Date().toISOString();
      /*    const solicitud = {
            idUser: this.idUser.idUser,
            idConductor: null,
            idService:this.selectedServiceId ,
            start_lat: this.,
            start_lng: '',
            start_direction: '',
            end_lat: '',
            end_lng: '',
            end_direction: '',
            distance: '',
            duration: '',
            costo: '',
            fecha_hora: '',
            estado: ''
          }*/

      // console.log("Datos solicitud ", this.solicitud);

      this.solicitudService.enviarSolicitudAConductor(
        this.solicitud,
        (estado) => {
          this.estadoSolicitud = estado; // Actualiza el estado en tiempo real
          setTimeout(()=>{
            this.estadoSolicitud = ''
          },3000)
        },
        (conductorId) => {
          this.conductorSeleccionado = conductorId; // Conductor que aceptó
        }
      );

    } catch (error) {
      console.error("Ocurrio error :", error)
    }
  }
}
