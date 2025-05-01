import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    if (this.authService.isAuthenticated()) {
      // Check for role-based access if required
      const requiredRole = route.data['role'] as string;
      if (requiredRole) {
        if (requiredRole === 'admin' && !this.authService.isAdmin()) {
          return this.router.createUrlTree(['/login'], { 
            queryParams: { returnUrl: state.url, accessDenied: true } 
          });
        }
        if (requiredRole === 'student' && !this.authService.isStudent()) {
          return this.router.createUrlTree(['/login'], { 
            queryParams: { returnUrl: state.url, accessDenied: true } 
          });
        }
        if (requiredRole === 'professor' && !this.authService.isProfessor()) {
          return this.router.createUrlTree(['/login'], { 
            queryParams: { returnUrl: state.url, accessDenied: true } 
          });
        }
      }
      return true;
    }
    return this.router.createUrlTree(['/login'], { 
      queryParams: { returnUrl: state.url } 
    });
  }
}