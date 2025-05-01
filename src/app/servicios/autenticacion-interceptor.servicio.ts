import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AutenticacionServicio } from './autenticacion.servicio';
import { Router } from '@angular/router';

@Injectable()
export class AutenticacionInterceptorServicio implements HttpInterceptor {
  private refrescando = false;

  constructor(private autenticacionServicio: AutenticacionServicio, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.autenticacionServicio.obtenerToken();
    if (!token) {
      return next.handle(req);
    }
    const reqModificado = this.agregarCabeceraToken(req, token);
    return next.handle(reqModificado).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.autenticacionServicio.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  private agregarCabeceraToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`)
    });
  }
}
