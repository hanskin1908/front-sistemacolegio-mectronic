import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { RegistrationService } from './registration.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class StudentSubjectsGuard implements CanActivate {
  constructor(
    private registrationService: RegistrationService, 
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    // Si no es un estudiante, permitir acceso normal
    if (!this.authService.isStudent()) {
      return of(true);
    }

    // Si es un estudiante y estu00e1 intentando acceder a una materia especu00edfica
    if (route.paramMap.has('id')) {
      const subjectId = +route.paramMap.get('id')!;
      const currentUserId = this.authService.getCurrentUserId();
      
      if (!currentUserId) {
        return of(this.router.createUrlTree(['/subjects']));
      }

      // Verificar si el estudiante estu00e1 registrado en esta materia
      return this.registrationService.getStudentRegistrations(currentUserId).pipe(
        map(registrations => {
          const isRegistered = registrations.some(reg => reg.subjectId === subjectId);
          if (isRegistered) {
            return true;
          }
          // Si no estu00e1 registrado, redirigir a la lista de materias
          return this.router.createUrlTree(['/subjects']);
        })
      );
    }

    // Para la lista general de materias, permitir acceso
    return of(true);
  }
}