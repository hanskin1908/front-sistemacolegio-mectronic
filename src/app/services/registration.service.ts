import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Registration, RegistrationRequest } from '../models/registration.model';
import { Subject } from '../models/subject.model';
// Import the Student model
import { Student } from '../models/student.model';
import { SubjectService } from './subject.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private apiUrl = `${environment.apiUrl}/Registros`;
  private MAX_SUBJECTS = 3;

  constructor(
    private http: HttpClient, 
    private subjectService: SubjectService,
    private authService: AuthService
  ) { }

  getStudentRegistrations(studentId: number): Observable<Registration[]> {
    return this.http.get<any>(`${this.apiUrl}/estudiante/${studentId}`)
      .pipe(
        map(response => {
          if (response && response.exito && response.data) {
            return response.data.map((item: any) => ({
              id: item.id,
              studentId: item.estudianteId,
              subjectId: item.materiaId,
              registrationDate: new Date(item.fechaRegistro),
              student: item.nombreEstudiante ? { 
                id: item.estudianteId, 
                name: item.nombreEstudiante,
                studentId: '',
                email: ''
              } : undefined,
              subject: item.nombreMateria ? {
                id: item.materiaId,
                name: item.nombreMateria,
                code: '',
                credits: 0,
                professorId: 0
              } : undefined
            }));
          }
          return [];
        }),
        catchError(this.handleError)
      );
  }

  getSubjectRegistrations(subjectId: number): Observable<Registration[]> {
    return this.http.get<any>(`${this.apiUrl}/materia/${subjectId}`)
      .pipe(
        map(response => {
          if (response && response.exito && response.data) {
            return response.data.map((item: any) => ({
              id: item.id,
              studentId: item.estudianteId,
              subjectId: item.materiaId,
              registrationDate: new Date(item.fechaRegistro),
              student: item.nombreEstudiante ? { 
                id: item.estudianteId, 
                name: item.nombreEstudiante,
                studentId: '',
                email: ''
              } : undefined,
              subject: item.nombreMateria ? {
                id: item.materiaId,
                name: item.nombreMateria,
                code: '',
                credits: 0,
                professorId: 0
              } : undefined
            }));
          }
          return [];
        }),
        catchError(this.handleError)
      );
  }

  getRegistration(id: number): Observable<Registration> {
    return this.http.get<any>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          if (response && response.exito && response.data) {
            const item = response.data;
            return {
              id: item.id,
              studentId: item.estudianteId,
              subjectId: item.materiaId,
              registrationDate: new Date(item.fechaRegistro),
              student: item.nombreEstudiante ? { 
                id: item.estudianteId, 
                name: item.nombreEstudiante,
                studentId: '',
                email: ''
              } : undefined,
              subject: item.nombreMateria ? {
                id: item.materiaId,
                name: item.nombreMateria,
                code: '',
                credits: 0,
                professorId: 0
              } : undefined
            };
          }
          throw new Error('Registration not found');
        }),
        catchError(this.handleError)
      );
  }

  registerSubject(request: RegistrationRequest): Observable<Registration> {
    const studentId = request.studentId;
    
    // Check if student already has 3 subjects
    return this.getStudentRegistrations(studentId).pipe(
      switchMap(registrations => {
        if (registrations.length >= this.MAX_SUBJECTS) {
          return throwError(() => new Error('No puedes registrar más de 3 materias'));
        }
        
        // Get the professors of the subjects the student is already registered for
        const registeredSubjectIds = registrations.map(r => r.subjectId);
        
        if (registeredSubjectIds.includes(request.subjectId)) {
          return throwError(() => new Error('Ya estás registrado en esta materia'));
        }
        
        // Get the new subject to check its credits
        return this.subjectService.getSubject(request.subjectId).pipe(
          switchMap(newSubject => {
            // If student has no registrations yet, check if the subject doesn't exceed 9 credits
            if (registeredSubjectIds.length === 0) {
              if (newSubject.credits > 9) {
                return throwError(() => new Error('No puedes registrar una materia que exceda el límite de 9 créditos'));
              }
              
              // Map the request to match the backend DTO property names
              const backendRequest = {
                estudianteId: request.studentId,
                nombreEstudiante: request.studentName || '',
                materiaId: request.subjectId,
                nombreMateria: request.subjectName || '',
                fechaRegistro: new Date()
              };
              console.log('Sending registration request (simple case):', backendRequest);
              console.log('Backend expects RegistroCreacionDto with properties: EstudianteId, NombreEstudiante, MateriaId, NombreMateria, FechaRegistro');
              return this.http.post<any>(this.apiUrl, backendRequest)
                .pipe(
                  map(response => {
                    if (response && response.exito && response.data) {
                      const item = response.data;
                      return {
                        id: item.id,
                        studentId: item.estudianteId,
                        subjectId: item.materiaId,
                        registrationDate: new Date(item.fechaRegistro),
                        student: item.nombreEstudiante ? { 
                          id: item.estudianteId, 
                          name: item.nombreEstudiante,
                          studentId: '',
                          email: ''
                        } : undefined,
                        subject: item.nombreMateria ? {
                          id: item.materiaId,
                          name: item.nombreMateria,
                          code: '',
                          credits: 0,
                          professorId: 0
                        } : undefined
                      };
                    }
                    throw new Error('Error al registrar la materia');
                  }),
                  catchError(this.handleError)
                );
            }
            
            // Get all subjects the student is registered for to check total credits
            return this.subjectService.getSubjectsByIds(registeredSubjectIds).pipe(
              switchMap(registeredSubjects => {
                // Calculate current total credits
                const currentTotalCredits = registeredSubjects.reduce((total, subject) => total + subject.credits, 0);
                
                // Check if adding the new subject would exceed the 9 credits limit
                if (currentTotalCredits + newSubject.credits > 9) {
                  return throwError(() => new Error(`No puedes registrar esta materia porque excederías el límite de 9 créditos. Actualmente tienes ${currentTotalCredits} créditos.`));
                }
                
                // Check if the new subject's professor is already teaching the student
                const professorIds = registeredSubjects.map(s => s.professorId);
                
                if (professorIds.includes(newSubject.professorId)) {
                  return throwError(() => new Error('No puedes tener más de una materia con el mismo profesor'));
                }
                
                // All checks passed, proceed with registration
                // Map the request to match the backend DTO property names
                const backendRequest = {
                  estudianteId: request.studentId,
                  nombreEstudiante: request.studentName || '',
                  materiaId: request.subjectId,
                  nombreMateria: request.subjectName || '',
                  fechaRegistro: new Date()
                };
                console.log('Sending registration request (complex case):', backendRequest);
                console.log('Backend expects RegistroCreacionDto with properties: EstudianteId, NombreEstudiante, MateriaId, NombreMateria, FechaRegistro');
                console.log('Case sensitivity matters! Backend expects: EstudianteId, not estudianteId');
                return this.http.post<any>(this.apiUrl, backendRequest)
                  .pipe(
                    map(response => {
                      if (response && response.exito && response.data) {
                        const item = response.data;
                        return {
                          id: item.id,
                          studentId: item.estudianteId,
                          subjectId: item.materiaId,
                          registrationDate: new Date(item.fechaRegistro),
                          student: item.nombreEstudiante ? { 
                            id: item.estudianteId, 
                            name: item.nombreEstudiante,
                            studentId: '',
                            email: ''
                          } : undefined,
                          subject: item.nombreMateria ? {
                            id: item.materiaId,
                            name: item.nombreMateria,
                            code: '',
                            credits: 0,
                            professorId: 0
                          } : undefined
                        };
                      }
                      throw new Error('Error al registrar la materia');
                    }),
                    catchError(this.handleError)
                  );
              })
            );
          })
        );
      })
    );
  }

  unregisterSubject(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          if (response && response.exito) {
            return response.data;
          }
          throw new Error(response.mensaje || 'Error al eliminar el registro');
        }),
        catchError(this.handleError)
      );
  }

  getClassmates(subjectId: number, currentStudentId: number): Observable<Student[]> {
    return this.getSubjectRegistrations(subjectId).pipe(
      map((registrations): Student[] => {
        // Filter out the current student and extract student information
        return registrations
          .filter(reg => reg.studentId !== currentStudentId && reg.student)
          .map(reg => ({
            id: reg.studentId,
            name: reg.student!.name,
            studentId: reg.student!.studentId || '',
            email: reg.student!.email || ''
          }));
      }),
      catchError(this.handleError)
    );
  }

  // Get total credits for a student
  getStudentTotalCredits(studentId: number): Observable<number> {
    return this.getStudentRegistrations(studentId).pipe(
      switchMap(registrations => {
        if (registrations.length === 0) {
          return new Observable<number>(observer => {
            observer.next(0);
            observer.complete();
          });
        }
        
        const subjectIds = registrations.map(r => r.subjectId);
        return this.subjectService.getSubjectsByIds(subjectIds).pipe(
          map(subjects => {
            return subjects.reduce((total, subject) => total + subject.credits, 0);
          })
        );
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
    } else if (error.message) {
      // Custom error message
      errorMessage = error.message;
    } else if (error.status) {
      // HTTP error
      errorMessage = `Error ${error.status}: ${error.statusText}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  // Verifica si el usuario actual es un estudiante
  isCurrentUserStudent(): Observable<boolean> {
    return this.authService.getCurrentUser().pipe(
      map(user => {
        return user?.role === 'student';
      }),
      catchError(() => of(false))
    );
  }

  // Verifica si el usuario actual tiene acceso a la sección de estudiantes
  canAccessStudentSection(): Observable<boolean> {
    return this.authService.getCurrentUser().pipe(
      map(user => {
        // Solo los administradores y profesores pueden acceder a la sección de estudiantes
        return user?.role === 'admin' || user?.role === 'professor';
      }),
      catchError(() => of(false))
    );
  }

  // Obtiene solo las materias registradas para el estudiante actual
  getCurrentStudentRegistrations(): Observable<Registration[]> {
    return this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (user && user.role === 'student') {
          return this.getStudentRegistrations(user.id);
        }
        return of([]);
      }),
      catchError(() => of([]))
    );
  }
}