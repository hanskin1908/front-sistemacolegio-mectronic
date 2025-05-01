import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Profesor } from '../modelos/profesor.modelo';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfesorServicio {
  private apiUrl = `${environment.apiUrl}/profesores`;

  constructor(private http: HttpClient) { }

  obtenerProfesores(): Observable<Profesor[]> {
    return this.http.get<any>(this.apiUrl)
      .pipe(
        map(respuesta => {
          console.log('Respuesta del servidor para profesores:', respuesta);
          if (respuesta && respuesta.exito && respuesta.data) {
            return respuesta.data.map((item: any) => {
              console.log('Item de profesor:', item);
              return {
                id: item.id,
                nombre: item.nombre,
                apellido: item.apellido || '',
                // Intentar obtener el email de cualquiera de los dos campos posibles
                email: item.email || item.correo || '',
                departamento: item.departamento || '',
                nombreCompleto: `${item.nombre} ${item.apellido || ''}`.trim()
              };
            });
          }
          return [];
        }),
        catchError(this.manejarError)
      );
  }

  obtenerProfesor(id: number): Observable<Profesor> {
    return this.http.get<any>(`${this.apiUrl}/${id}`)
      .pipe(
        map(respuesta => {
          console.log('Respuesta del servidor para profesor individual:', respuesta);
          if (respuesta && respuesta.exito && respuesta.data) {
            const item = respuesta.data;
            console.log('Item de profesor individual:', item);
            return {
              id: item.id,
              nombre: item.nombre,
              apellido: item.apellido || '',
              // Intentar obtener el email de cualquiera de los dos campos posibles
              email: item.email || item.correo || '',
              departamento: item.departamento || '',
              nombreCompleto: `${item.nombre} ${item.apellido || ''}`.trim()
            };
          }
          throw new Error('Profesor no encontrado');
        }),
        catchError(this.manejarError)
      );
  }

  crearProfesor(profesor: Profesor): Observable<any> {
    // Filtrar solo los campos necesarios para el backend
    const profesorData = {
      nombre: profesor.nombre,
      email: profesor.email,
      departamento: profesor.departamento
    };
    
    return this.http.post<any>(this.apiUrl, profesorData)
      .pipe(
        catchError(this.manejarError)
      );
  }

  actualizarProfesor(id: number, profesor: Profesor): Observable<any> {
    // Filtrar solo los campos necesarios para el backend
    const profesorData = {
      nombre: profesor.nombre,
      email: profesor.email,
      departamento: profesor.departamento
    };
    
    return this.http.put<any>(`${this.apiUrl}/${id}`, profesorData)
      .pipe(
        catchError(this.manejarError)
      );
  }

  eliminarProfesor(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.manejarError)
      );
  }

  private manejarError(error: any) {
    let mensajeError = 'u00a1Ocurriu00f3 un error desconocido!';
    if (error.error instanceof ErrorEvent) {
      mensajeError = `Error: ${error.error.message}`;
    } else if (error.error && error.error.message) {
      mensajeError = error.error.message;
    } else if (error.status) {
      mensajeError = `Error ${error.status}: ${error.statusText}`;
    }
    return throwError(() => new Error(mensajeError));
  }
}