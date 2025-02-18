import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private popUpCancelar =  new BehaviorSubject<any>(null);
  popAction = this.popUpCancelar.asObservable();

  private paramSource =  new BehaviorSubject<any>(null);
  time = this.paramSource.asObservable();

  private dataSource = new BehaviorSubject<any>(null);
  currentData = this.dataSource.asObservable();

  private _locate = new BehaviorSubject<any>(null);
  melocation = this._locate.asObservable();

  private _destination = new BehaviorSubject<any>(null);
  medestination = this._destination.asObservable();

  private _distance = new BehaviorSubject<any>(null);
  meDistance = this._distance.asObservable();

  private km =  new BehaviorSubject<any>(null);
  calculo = this.km.asObservable();

  constructor() { }

  // Método para actualizar el dato
  setData(data: any) {
    this.dataSource.next(data);
  }

  locate(data: any) {
    this._locate.next(data);
  }

  changeParam(param: any) {
    this.paramSource.next(param);  // Cambia el valor
  }

  actionPopUp(param: any) {
    this.popUpCancelar.next(param);  // Cambia el valor
  }
  
  destination(data: any) {
 
    this._destination.next(data);
  }

  
  distance(data: any) {
 
    this._distance.next(data);
  }

 kmRecorridos(param: any) {
    this.km.next(param);  // Cambia el valor
  }
}
