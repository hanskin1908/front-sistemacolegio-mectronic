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
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenExpirationTimer: any;
  private userSubject = new BehaviorSubject<UserProfile | null>(null);
  user$ = this.userSubject.asObservable();
  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient, private router: Router) {
    this.autoLogin();
  }

  register(registerData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<any>(`${this.apiUrl}/register`, registerData)
      .pipe(
        catchError(this.handleError),
        tap(response => {
          // Extract AuthResponse from Response<AuthResponse>
          const authData = response.data;
          this.handleAuthentication(authData);
        }),
        // Map to extract the data property from the response
        map(response => response.data)
      );
  }

  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<any>(`${this.apiUrl}/login`, loginData)
      .pipe(
        catchError(this.handleError),
        tap(response => {
          // Extract AuthResponse from Response<AuthResponse>
          const authData = response.data;
          this.handleAuthentication(authData);
          // Navegar después de que el estado se haya actualizado
          this.router.navigate(['/']);
        }),
        // Map to extract the data property from the response
        map(response => response.data)
      );
  }

  logout() {
    localStorage.removeItem('userData');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  autoLogin() {
    const userData = localStorage.getItem('userData');
    if (!userData) {
      return;
    }

    try {
      const parsedData: {
        id: number;
        name: string;
        email: string;
        role: string;
        studentId?: string | number;
        professorId?: string | number;
        _token: string;
        _tokenExpirationDate: string;
      } = JSON.parse(userData);

      // Check if token is expired
      const token = parsedData._token;
      if (!token || this.jwtHelper.isTokenExpired(token)) {
        this.logout();
        return;
      }

      const expirationDate = new Date(parsedData._tokenExpirationDate);
      if (expirationDate <= new Date()) {
        this.logout();
        return;
      }

      // Crear usuario sin conversiones complejas para mejorar rendimiento
      const user: UserProfile = {
        id: parsedData.id,
        name: parsedData.name,
        email: parsedData.email,
        role: parsedData.role,
        studentId: parsedData.studentId ? Number(parsedData.studentId) : undefined,
        professorId: parsedData.professorId ? Number(parsedData.professorId) : undefined
      };

      this.userSubject.next(user);
      
      // Calcular tiempo de expiración
      const expirationDuration = expirationDate.getTime() - new Date().getTime();
      if (expirationDuration > 0) {
        this.autoLogout(expirationDuration);
      } else {
        this.logout();
      }
    } catch (error) {
      console.error('Error during auto login:', error);
      this.logout();
    }
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  getToken(): string | null {
    const userData = localStorage.getItem('userData');
    if (!userData) {
      return null;
    }
    const parsedData = JSON.parse(userData);
    return parsedData._token;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    return !this.jwtHelper.isTokenExpired(token);
  }

  isStudent(): boolean {
    return this.userSubject.value?.role === 'student';
  }

  isAdmin(): boolean {
    return this.userSubject.value?.role === 'admin';
  }

  isProfessor(): boolean {
    return this.userSubject.value?.role === 'professor';
  }

  getCurrentUserId(): number | null {
    return this.userSubject.value?.id || null;
  }

  private handleAuthentication(authData: AuthResponse) {
    // Decode token to get expiration date
    const decodedToken = this.jwtHelper.decodeToken(authData.token);
    const expirationDate = new Date(decodedToken.exp * 1000);
    
    // Create user profile
    const user: UserProfile = {
      id: authData.userId,
      name: authData.name,
      email: authData.email,
      role: authData.role,
      ...(authData.studentId && { studentId: authData.studentId }),
      ...(authData.professorId && { professorId: authData.professorId })
    };
    
    // Actualizar el estado primero
    this.userSubject.next(user);
    
    // Store user data
    const userData = {
      ...user,
      _token: authData.token,
      _tokenExpirationDate: expirationDate.toISOString()
    };
    
    localStorage.setItem('userData', JSON.stringify(userData));
    this.autoLogout(authData.expiresIn * 1000);
  }

  getUserProfile(userId: number): Observable<UserProfile> {
    return this.http.get<any>(`${this.apiUrl}/profile/${userId}`)
      .pipe(
        catchError(this.handleError),
        map(response => response.data)
      );
  }

  private handleError(errorRes: any) {
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error || !errorRes.error.message) {
      return throwError(() => new Error(errorMessage));
    }
    return throwError(() => new Error(errorRes.error.message));
  }

  // Obtiene el usuario actual como un Observable
  getCurrentUser(): Observable<UserProfile | null> {
    return this.user$;
  }

  // Obtiene el valor actual del usuario sin necesidad de suscripción
  getCurrentUserValue(): UserProfile | null {
    return this.userSubject.value;
  }
}