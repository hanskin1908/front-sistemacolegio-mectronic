import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { InscripcionServicio } from './inscripcion.servicio';

@Injectable({
  providedIn: 'root'
})
export class AccesoEstudianteGuardia implements CanActivate {
  constructor(private inscripcionServicio: InscripcionServicio, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.inscripcionServicio.puedeAccederSeccionEstudiante().pipe(
      map(puedeAcceder => {
        if (puedeAcceder) {
          return true;
        }
        return this.router.createUrlTree(['/asignaturas']);
      })
    );
  }
}
