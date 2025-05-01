import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Student } from '../models/student.model';
import { Registration } from '../models/registration.model';
import { environment } from '../../environments/environment';

// Interfaces para manejar la respuesta del backend
interface ApiResponse<T> {
  exito: boolean;
  mensaje: string;
  errores: string[];
  data: T;
}

interface EstudianteDto {
  id: number;
  nombre: string;
  email: string;
  matricula: string;
  registros: RegistroDto[];
}

interface RegistroDto {
  id: number;
  estudianteId: number;
  nombreEstudiante: string;
  materiaId: number;
  nombreMateria: string;
  fechaRegistro: Date;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}/Estudiantes`;

  constructor(private http: HttpClient) { }

  getStudents(): Observable<Student[]> {
    return this.http.get<ApiResponse<EstudianteDto[]>>(this.apiUrl)
      .pipe(
        map(response => {
          if (!response.exito) {
            throw new Error(response.mensaje || 'Error al obtener estudiantes');
          }
          return response.data.map(dto => this.mapEstudianteDtoToStudent(dto));
        }),
        catchError(this.handleError)
      );
  }

  getStudent(id: number): Observable<Student> {
    return this.http.get<ApiResponse<EstudianteDto>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          if (!response.exito) {
            throw new Error(response.mensaje || 'Error al obtener estudiante');
          }
          return this.mapEstudianteDtoToStudent(response.data);
        }),
        catchError(this.handleError)
      );
  }

  createStudent(student: Student): Observable<Student> {
    const estudianteDto = this.mapStudentToEstudianteDto(student);
    return this.http.post<ApiResponse<EstudianteDto>>(this.apiUrl, estudianteDto)
      .pipe(
        map(response => {
          if (!response.exito) {
            throw new Error(response.mensaje || 'Error al crear estudiante');
          }
          return this.mapEstudianteDtoToStudent(response.data);
        }),
        catchError(this.handleError)
      );
  }

  updateStudent(student: Student): Observable<Student> {
    const estudianteDto = this.mapStudentToEstudianteDto(student);
    return this.http.put<ApiResponse<EstudianteDto>>(`${this.apiUrl}/${student.id}`, estudianteDto)
      .pipe(
        map(response => {
          if (!response.exito) {
            throw new Error(response.mensaje || 'Error al actualizar estudiante');
          }
          return this.mapEstudianteDtoToStudent(response.data);
        }),
        catchError(this.handleError)
      );
  }

  deleteStudent(id: number): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          if (!response.exito) {
            throw new Error(response.mensaje || 'Error al eliminar estudiante');
          }
          return response.data;
        }),
        catchError(this.handleError)
      );
  }

  getStudentRegistrations(id: number): Observable<Registration[]> {
    return this.http.get<ApiResponse<EstudianteDto>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          if (!response.exito) {
            throw new Error(response.mensaje || 'Error al obtener registros del estudiante');
          }
          return response.data.registros.map(dto => this.mapRegistroDtoToRegistration(dto));
        }),
        catchError(this.handleError)
      );
  }

  private mapEstudianteDtoToStudent(dto: EstudianteDto): Student {
    return {
      id: dto.id,
      name: dto.nombre,
      email: dto.email,
      studentId: dto.matricula
    };
  }

  private mapStudentToEstudianteDto(student: Student): EstudianteDto {
    return {
      id: student.id || 0,
      nombre: student.name,
      email: student.email,
      matricula: student.studentId,
      registros: []
    };
  }

  private mapRegistroDtoToRegistration(dto: RegistroDto): Registration {
    return {
      id: dto.id,
      studentId: dto.estudianteId,
      subjectId: dto.materiaId,
      registrationDate: new Date(dto.fechaRegistro)
    };
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