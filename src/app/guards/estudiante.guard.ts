import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AutenticacionServicio } from '../servicios/autenticacion.servicio';

@Injectable({
  providedIn: 'root'
})
export class EstudianteGuard implements CanActivate {
  constructor(
    private autenticacionServicio: AutenticacionServicio,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.autenticacionServicio.esEstudiante()) {
      return true;
    }
    
    this.router.navigate(['/mis-materias']);
    return false;
  }
}