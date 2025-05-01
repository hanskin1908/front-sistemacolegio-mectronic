import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private classmatesModalSubject = new BehaviorSubject<{show: boolean, subjectId: number | null}>({show: false, subjectId: null});
  classmatesModal$ = this.classmatesModalSubject.asObservable();

  constructor() { }

  showClassmatesModal(subjectId: number): void {
    this.classmatesModalSubject.next({show: true, subjectId});
  }

  hideClassmatesModal(): void {
    this.classmatesModalSubject.next({show: false, subjectId: null});
  }
}