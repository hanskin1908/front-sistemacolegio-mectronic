import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Professor } from '../models/professor.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfessorService {
  private apiUrl = `${environment.apiUrl}/profesores`; // Cambiado a 'profesores' para coincidir con el backend

  constructor(private http: HttpClient) { }

  // Funciu00f3n auxiliar para agregar la propiedad 'name' a los objetos Professor
  private addNameProperty(professor: any): Professor {
    if (professor) {
      // Extraer nombre y apellido si el nombre contiene espacio
      let nombre = professor.nombre;
      let apellido = '';
      
      if (nombre && nombre.includes(' ')) {
        const parts = nombre.split(' ');
        if (parts.length >= 2) {
          nombre = parts[0];
          apellido = parts.slice(1).join(' ');
        }
      }
      
      return {
        ...professor,
        apellido: apellido, // Agregar apellido si no existe
        name: professor.nombre // Mantener el nombre completo para compatibilidad
      };
    }
    return professor;
  }

  getProfessors(): Observable<Professor[]> {
    return this.http.get<any>(this.apiUrl)
      .pipe(
        catchError(this.handleError),
        map(response => {
          const professors = response.data || [];
          // Agregar propiedad name a cada profesor
          return professors.map((prof: any) => this.addNameProperty(prof));
        })
      );
  }

  getProfessor(id: number): Observable<Professor> {
    return this.http.get<any>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError),
        map(response => this.addNameProperty(response.data))
      );
  }

  createProfessor(professor: Professor): Observable<Professor> {
    // Filter only the necessary fields for the backend
    const professorData = {
      nombre: professor.nombre,
      email: professor.email,
      departamento: professor.departamento
    };
    
    return this.http.post<any>(this.apiUrl, professorData)
      .pipe(
        catchError(this.handleError),
        map(response => this.addNameProperty(response.data))
      );
  }

  updateProfessor(id: number, professor: Professor): Observable<Professor> {
    // Filter only the necessary fields for the backend
    const professorData = {
      nombre: professor.nombre,
      email: professor.email,
      departamento: professor.departamento
    };
    
    return this.http.put<any>(`${this.apiUrl}/${id}`, professorData)
      .pipe(
        catchError(this.handleError),
        map(response => this.addNameProperty(response.data))
      );
  }

  deleteProfessor(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError),
        map(response => response.data)
      );
  }

  private handleError(error: any) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error && error.error.message) {
      // Server-side error with message
      errorMessage = error.error.message;
    } else if (error.status) {
      // HTTP error
      errorMessage = `Error ${error.status}: ${error.statusText}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}