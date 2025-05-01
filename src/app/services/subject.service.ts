import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Subject } from '../models/subject.model';
import { Student } from '../models/student.model';
import { Professor } from '../models/professor.model';
import { environment } from '../../environments/environment';

interface MateriaDto {
  nombre: string;
  codigo: string;
  creditos: number;
  profesorId: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private apiUrl = `${environment.apiUrl}/Materias`;
  private registrosUrl = `${environment.apiUrl}/Registros`;

  constructor(private http: HttpClient) { }

  // Funciu00f3n auxiliar para crear un objeto Professor compatible
  private createProfessorObject(id: any, name: string): Professor {
    const [nombre, apellido] = name.split(' ').length > 1 ? 
      [name.split(' ')[0], name.split(' ').slice(1).join(' ')] : 
      [name, ''];
    
    return {
      id: id,
      nombre: nombre,
      apellido: apellido,
      email: '', // Campo requerido pero no disponible desde la API de materias
      departamento: '', // Campo requerido por el modelo actualizado
      name: name // Mantener compatibilidad
    };
  }

  getStudentSubjects(studentId: number): Observable<Subject[]> {
    return this.http.get<any>(`${this.apiUrl}/estudiante/${studentId}`)
      .pipe(
        map(response => {
          if (response && response.exito && response.data) {
            return response.data.map((item: any) => ({
              id: item.id,
              name: item.nombre,
              code: item.codigo,
              credits: item.creditos,
              professorId: item.profesorId || 0,
              professor: item.nombreProfesor ? 
                this.createProfessorObject(item.profesorId, item.nombreProfesor) : 
                undefined
            }));
          }
          return [];
        }),
        catchError(this.handleError)
      );
  }

  getSubjects(isProfessor: boolean = false): Observable<Subject[]> {
    // Si es profesor, usar el endpoint seguro
    if (isProfessor) {
      return this.http.get<any>(`${this.apiUrl}/profesor-materias`).pipe(
        map(response => {
          if (response && response.exito && response.data && response.data.materias) {
            return response.data.materias.map((item: any) => ({
              id: item.id,
              name: item.nombre,
              code: item.codigo,
              credits: item.creditos,
              professorId: item.profesorId || 0,
              professor: item.nombreProfesor ?
                this.createProfessorObject(item.profesorId, item.nombreProfesor) :
                undefined
            }));
          }
          return [];
        }),
        catchError(this.handleError)
      );
    }
    // Admin y otros roles usan el endpoint clásico
    return this.http.get<any>(this.apiUrl)
      .pipe(
        map(response => {
          if (response && response.exito && response.data) {
            return response.data.map((item: any) => ({
              id: item.id,
              name: item.nombre,
              code: item.codigo,
              credits: item.creditos,
              professorId: item.profesorId || 0,
              professor: item.nombreProfesor ?
                this.createProfessorObject(item.profesorId, item.nombreProfesor) :
                undefined
            }));
          }
          return [];
        }),
        catchError(this.handleError)
      );
  }

  getSubject(id: number): Observable<Subject> {
    return this.http.get<any>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          if (response && response.exito && response.data) {
            const item = response.data;
            return {
              id: item.id,
              name: item.nombre,
              code: item.codigo,
              credits: item.creditos,
              professorId: item.profesorId || 0,
              professor: item.nombreProfesor ? 
                this.createProfessorObject(item.profesorId, item.nombreProfesor) : 
                undefined
            };
          }
          throw new Error('Subject not found');
        }),
        catchError(this.handleError)
      );
  }

  getSubjectsByIds(ids: number[]): Observable<Subject[]> {
    // If there's only one ID, use the single subject endpoint
    if (ids.length === 1) {
      return this.getSubject(ids[0]).pipe(
        map(subject => [subject]),
        catchError(error => {
          console.error('Error fetching subject by single ID:', error);
          return of([]);
        })
      );
    }
    
    // For multiple IDs, build the URL correctly
    let url = `${this.apiUrl}/multiple?`;
    // Add each ID as a separate parameter
    ids.forEach((id, index) => {
      url += `ids=${id}`;
      if (index < ids.length - 1) {
        url += '&';
      }
    });
    
    console.log('URL for fetching multiple subjects:', url);
    
    return this.http.get<any>(url)
      .pipe(
        map(response => {
          if (response && response.exito && response.data) {
            return response.data.map((item: any) => ({
              id: item.id,
              name: item.nombre,
              code: item.codigo,
              credits: item.creditos,
              professorId: item.profesorId || 0,
              professor: item.nombreProfesor ? 
                this.createProfessorObject(item.profesorId, item.nombreProfesor) : 
                undefined
            }));
          }
          return [];
        }),
        catchError(this.handleError)
      );
  }

  getStudentsBySubject(id: number, isProfessor: boolean = false): Observable<Student[]> {
    if (isProfessor) {
      // Endpoint seguro para profesores
      return this.http.get<any>(`${environment.apiUrl}/Estudiantes/por-materia-profesor/${id}`, { observe: 'response' })
        .pipe(
          map(response => {
            if (response.body && response.body.exito && response.body.data) {
              return response.body.data.map((item: any) => ({
                id: item.id,
                name: item.nombre,
                studentId: item.matricula || '',
                email: item.email || ''
              }));
            }
            return [];
          }),
          catchError((error) => {
            if (error.status === 403) {
              return throwError(() => new Error('NO_PERMISSIONS'));
            } else if (error.status === 404) {
              return throwError(() => new Error('NOT_FOUND'));
            }
            return this.handleError(error);
          })
        );
    }
    // Admin y otros roles usan el endpoint clásico
    return this.http.get<any>(`${environment.apiUrl}/Registros/materia/${id}`)
      .pipe(
        map(response => {
          if (response && response.exito && response.data) {
            return response.data.map((item: any) => ({
              id: item.estudianteId,
              name: item.nombreEstudiante,
              studentId: '',
              email: '',
            }));
          }
          return [];
        }),
        catchError(this.handleError)
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

  createSubject(materiaDto: MateriaDto): Observable<any> {
    // Asegurarse de que profesorId sea un número
    const materiaToSend = {
      ...materiaDto,
      profesorId: materiaDto.profesorId ? Number(materiaDto.profesorId) : null
    };
    
    console.log('Datos enviados al crear materia (después de conversión):', materiaToSend);
    
    return this.http.post<any>(this.apiUrl, materiaToSend)
      .pipe(
        map(response => {
          console.log('Respuesta del servidor al crear materia:', response);
          if (response && response.exito && response.data) {
            return response.data;
          }
          throw new Error(response.mensaje || 'Error al crear la materia');
        }),
        catchError(error => {
          console.error('Error al crear materia:', error);
          return this.handleError(error);
        })
      );
  }
}