import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-viaje-sheet',
  templateUrl: './viaje-sheet.component.html',
  styleUrls: ['./viaje-sheet.component.scss'],
})
export class ViajeSheetComponent  implements OnInit {
  @Input() minHeight: number = 100; // Altura mínima del Bottom Sheet
  @Input() maxHeight: number = 400; // Altura máxima del Bottom Sheet
  @ViewChild('sheet', { static: true }) sheet!: ElementRef;

  private startY: number = 0;
  private currentHeight: number = 0;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
  }
  onTouchStart(event: TouchEvent) {
    this.startY = event.touches[0].clientY;
    this.currentHeight = this.sheet.nativeElement.offsetHeight;
  }

  onTouchMove(event: TouchEvent) {
    const deltaY = this.startY - event.touches[0].clientY;
    let newHeight = this.currentHeight + deltaY;

    // Restringir la altura entre los valores mínimos y máximos
    newHeight = Math.max(this.minHeight, Math.min(this.maxHeight, newHeight));
    this.renderer.setStyle(this.sheet.nativeElement, 'height', `${newHeight}px`);
  }

  onTouchEnd() {
    // Mantener el estado al finalizar el movimiento
  }
}
