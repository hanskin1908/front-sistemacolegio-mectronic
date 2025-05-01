import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RegistrationService } from './registration.service';

@Injectable({
  providedIn: 'root'
})
export class StudentAccessGuard implements CanActivate {
  constructor(private registrationService: RegistrationService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.registrationService.canAccessStudentSection().pipe(
      map(canAccess => {
        if (canAccess) {
          return true;
        }
        // Redirigir a la página de materias si es un estudiante
        return this.router.createUrlTree(['/subjects']);
      })
    );
  }
}