import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AutenticacionServicio } from '../servicios/autenticacion.servicio';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private autenticacionServicio: AutenticacionServicio,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.autenticacionServicio.esAdmin()) {
      return true;
    }
    
    this.router.navigate(['/materias']);
    return false;
  }
}