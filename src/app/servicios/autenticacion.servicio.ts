import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { LoginRequest, RegisterRequest, AuthResponse, UserProfile } from '../models/auth.model';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionServicio {
  private apiUrl = `${environment.apiUrl}/auth`;
  private temporizadorExpiracionToken: any;
  private usuarioSubject = new BehaviorSubject<UserProfile | null>(null);
  usuario$ = this.usuarioSubject.asObservable();
  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient, private router: Router) {
    this.autoLogin();
  }

  registrar(datosRegistro: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<any>(`${this.apiUrl}/register`, datosRegistro)
      .pipe(
        catchError(this.manejarError),
        tap(respuesta => {
          const datosAuth = respuesta.data;
          this.manejarAutenticacion(datosAuth);
        }),
        map(respuesta => respuesta.data)
      );
  }

  login(datosLogin: LoginRequest): Observable<AuthResponse> {
    return this.http.post<any>(`${this.apiUrl}/login`, datosLogin)
      .pipe(
        catchError(this.manejarError),
        tap(respuesta => {
          const datosAuth = respuesta.data;
          this.manejarAutenticacion(datosAuth);
        }),
        map(respuesta => respuesta.data)
      );
  }

  logout() {
    localStorage.removeItem('userData');
    this.usuarioSubject.next(null);
    this.router.navigate(['/login']);
    if (this.temporizadorExpiracionToken) {
      clearTimeout(this.temporizadorExpiracionToken);
    }
    this.temporizadorExpiracionToken = null;
  }

  autoLogin() {
    const userData = localStorage.getItem('userData');
    if (!userData) {
      return;
    }
    
    const datosParseados: any = JSON.parse(userData);
    console.log('Datos recuperados del localStorage:', datosParseados);
    
    const token = datosParseados._token;
    if (this.jwtHelper.isTokenExpired(token)) {
      this.logout();
      return;
    }
    
    const fechaExpiracion = new Date(datosParseados._tokenExpirationDate);
    if (fechaExpiracion <= new Date()) {
      this.logout();
      return;
    }
    
    // Decodificar el token para obtener información adicional
    const tokenDecodificado = this.jwtHelper.decodeToken(token);
    console.log('Token decodificado:', tokenDecodificado);
    
    // Intentar obtener studentId primero del localStorage y luego del token
    let studentId = datosParseados.studentId;
    if (studentId === undefined && tokenDecodificado.studentId) {
      studentId = typeof tokenDecodificado.studentId === 'string' ? 
        parseInt(tokenDecodificado.studentId, 10) : tokenDecodificado.studentId;
    }
    
    // Intentar obtener professorId primero del localStorage y luego del token
    let professorId = datosParseados.professorId;
    if (professorId === undefined && tokenDecodificado.professorId) {
      professorId = typeof tokenDecodificado.professorId === 'string' ? 
        parseInt(tokenDecodificado.professorId, 10) : tokenDecodificado.professorId;
    }
    
    const usuario: UserProfile = {
      id: datosParseados.id,
      name: datosParseados.name,
      email: datosParseados.email,
      role: datosParseados.role,
      studentId: studentId,
      professorId: professorId
    };
    
    console.log('Usuario reconstruido:', usuario);
    this.usuarioSubject.next(usuario);
    
    const duracionExpiracion = fechaExpiracion.getTime() - new Date().getTime();
    this.autoLogout(duracionExpiracion);
  }

  autoLogout(duracionExpiracion: number) {
    this.temporizadorExpiracionToken = setTimeout(() => {
      this.logout();
    }, duracionExpiracion);
  }

  obtenerToken(): string | null {
    const userData = localStorage.getItem('userData');
    if (!userData) {
      return null;
    }
    const datosParseados = JSON.parse(userData);
    return datosParseados._token;
  }

  estaAutenticado(): boolean {
    const token = this.obtenerToken();
    if (!token) {
      return false;
    }
    return !this.jwtHelper.isTokenExpired(token);
  }

  esEstudiante(): boolean {
    return this.usuarioSubject.value?.role === 'student';
  }

  esAdmin(): boolean {
    return this.usuarioSubject.value?.role === 'admin';
  }

  esProfesor(): boolean {
    return this.usuarioSubject.value?.role === 'professor';
  }

  obtenerIdUsuarioActual(): number | null {
    return this.usuarioSubject.value?.id || null;
  }

  obtenerUsuarioActualId(): number | null {
    return this.usuarioSubject.value?.id || null;
    console.log('ID del usuario actual obtenido:', this.usuarioSubject.value?.id || null);
  }

  private manejarAutenticacion(datosAuth: AuthResponse) {
    const tokenDecodificado = this.jwtHelper.decodeToken(datosAuth.token);
    const fechaExpiracion = new Date(tokenDecodificado.exp * 1000);
    
    // Extraer studentId y professorId del token decodificado
    const studentId = tokenDecodificado.studentId ? 
      (typeof tokenDecodificado.studentId === 'string' ? 
        parseInt(tokenDecodificado.studentId, 10) : tokenDecodificado.studentId) : undefined;
    
    const professorId = tokenDecodificado.professorId ? 
      (typeof tokenDecodificado.professorId === 'string' ? 
        parseInt(tokenDecodificado.professorId, 10) : tokenDecodificado.professorId) : undefined;
    
    const usuario: UserProfile = {
      id: datosAuth.userId,
      name: datosAuth.name,
      email: datosAuth.email,
      role: datosAuth.role,
      studentId: studentId,
      professorId: professorId
    };
    
    const userData = {
      ...usuario,
      _token: datosAuth.token,
      _tokenExpirationDate: fechaExpiracion.toISOString()
    };
    
    console.log('Guardando datos de usuario:', userData);
    localStorage.setItem('userData', JSON.stringify(userData));
    this.usuarioSubject.next(usuario);
    this.autoLogout(datosAuth.expiresIn * 1000);
  }

  obtenerPerfilUsuario(userId: number): Observable<UserProfile> {
    return this.http.get<any>(`${this.apiUrl}/profile/${userId}`)
      .pipe(
        catchError(this.manejarError),
        map(respuesta => respuesta.data)
      );
  }

  private manejarError(errorRes: any) {
    let mensajeError = '¡Ocurrió un error desconocido!';
    if (!errorRes.error || !errorRes.error.message) {
      return throwError(() => new Error(mensajeError));
    }
    return throwError(() => new Error(errorRes.error.message));
  }

  obtenerUsuarioActual(): Observable<UserProfile | null> {
    return this.usuario$;
  }

  obtenerValorUsuarioActual(): UserProfile | null {
    return this.usuarioSubject.value;
  }
}
