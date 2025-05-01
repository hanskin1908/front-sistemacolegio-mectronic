import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { InscripcionServicio } from './inscripcion.servicio';
import { AutenticacionServicio } from './autenticacion.servicio';

@Injectable({
  providedIn: 'root'
})
export class MateriasEstudianteGuardia implements CanActivate {
  constructor(
    private inscripcionServicio: InscripcionServicio,
    private autenticacionServicio: AutenticacionServicio,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    if (!this.autenticacionServicio.esEstudiante()) {
      return of(true);
    }
    if (route.paramMap.has('id')) {
      const asignaturaId = +route.paramMap.get('id')!;
      const usuarioActualId = this.autenticacionServicio.obtenerIdUsuarioActual();
      if (!usuarioActualId) {
        return of(this.router.createUrlTree(['/asignaturas']));
      }
      return this.inscripcionServicio.obtenerInscripcionesEstudiante(usuarioActualId).pipe(
        map(inscripciones => {
          const estaInscrito = inscripciones.some(insc => insc.asignaturaId === asignaturaId);
          if (estaInscrito) {
            return true;
          }
          return this.router.createUrlTree(['/asignaturas']);
        })
      );
    }
    return of(true);
  }
}
