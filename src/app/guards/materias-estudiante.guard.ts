import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AutenticacionServicio } from '../servicios/autenticacion.servicio';
import { AsignaturaServicio } from '../servicios/asignatura.servicio';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MateriasEstudianteGuard implements CanActivate {
  constructor(
    private autenticacionServicio: AutenticacionServicio,
    private asignaturaServicio: AsignaturaServicio,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    if (!this.autenticacionServicio.esEstudiante()) {
      return true;
    }
    
    const asignaturaId = +route.paramMap.get('id')!;
    const estudianteId = this.autenticacionServicio.obtenerIdUsuarioActual();
    
    if (!estudianteId) {
      this.router.navigate(['/mis-materias']);
      return false;
    }
    
    return this.asignaturaServicio.obtenerAsignaturasEstudiante( estudianteId).pipe(
      map(inscrito => {
        if (inscrito) {
          return true;
        }
        this.router.navigate(['/mis-materias']);
        return false;
      }),
      catchError(() => {
        this.router.navigate(['/mis-materias']);
        return of(false);
      })
    );
  }
}