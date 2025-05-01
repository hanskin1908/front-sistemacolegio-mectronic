import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalServicio {
  private modalCompañerosSubject = new BehaviorSubject<{mostrar: boolean, asignaturaId: number | null}>({mostrar: false, asignaturaId: null});
  modalCompañeros$ = this.modalCompañerosSubject.asObservable();

  constructor() { }

  mostrarModalCompañeros(asignaturaId: number): void {
    this.modalCompañerosSubject.next({mostrar: true, asignaturaId});
  }

  ocultarModalCompañeros(): void {
    this.modalCompañerosSubject.next({mostrar: false, asignaturaId: null});
  }
}
