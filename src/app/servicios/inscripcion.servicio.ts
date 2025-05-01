import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Inscripcion, SolicitudInscripcion } from '../modelos/inscripcion.modelo';
import { Asignatura } from '../modelos/asignatura.modelo';
import { Estudiante } from '../modelos/estudiante.modelo';
import { AsignaturaServicio } from './asignatura.servicio';
import { AutenticacionServicio } from './autenticacion.servicio';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InscripcionServicio {
  private apiUrl = `${environment.apiUrl}/Registros`;
  private MAX_ASIGNATURAS = 3;

  constructor(
    private http: HttpClient,
    private asignaturaServicio: AsignaturaServicio,
    private autenticacionServicio: AutenticacionServicio
  ) { }

  obtenerInscripcionesEstudiante(estudianteId: number): Observable<Inscripcion[]> {
    console.log(estudianteId)
    return this.http.get<any>(`${this.apiUrl}/estudiante/${estudianteId}`)
      .pipe(
        map(respuesta => {
          if (respuesta && respuesta.exito && respuesta.data) {
            console.log('Procesando inscripciones del estudiante:', respuesta.data);
            return respuesta.data.map((item: any) => ({
              id: item.id,
              estudianteId: item.estudianteId,
              nombreEstudiante: item.nombreEstudiante || '',
              materiaId: item.materiaId,
              nombreMateria: item.nombreMateria || '',
              creditos: item.creditos || 0,
              nombreProfesor: item.nombreProfesor || null,
              fechaRegistro: item.fechaRegistro ? new Date(item.fechaRegistro).toISOString() : new Date().toISOString()
            }));
          }
          return [];
        }),
        catchError(error => {
          console.error('Error al obtener inscripciones:', error);
          return of([]);
        })
      );
  }

  obtenerInscripcionesAsignatura(asignaturaId: number): Observable<Inscripcion[]> {
    return this.http.get<any>(`${this.apiUrl}/materia/${asignaturaId}`)
      .pipe(
        map(respuesta => {
          console.log('Obteniendo inscripciones para la asignatura:', asignaturaId);
          if (respuesta && respuesta.exito && respuesta.data) {
            console.log('Datos de inscripciones obtenidos:', respuesta.data);
            return respuesta.data.map((item: any) => ({
              id: item.id,
              estudianteId: item.estudianteId,
              asignaturaId: item.materiaId,
              fechaInscripcion: new Date(item.fechaRegistro),
              estudiante: item.nombreEstudiante ? {
                id: item.estudianteId,
                nombre: item.nombreEstudiante,
                matricula: '',
                email: ''
              } : undefined,
              asignatura: item.nombreMateria ? {
                id: item.materiaId,
                nombre: item.nombreMateria,
                codigo: '',
                creditos: item.creditos || 0,
                profesorId: item.profesorId || 0,
                profesor: item.nombreProfesor ? {
                  id: item.profesorId || 0,
                  nombre: item.nombreProfesor,
                  apellido: '',
                  email: '',
                  departamento: '',
                  nombreCompleto: item.nombreProfesor
                } : undefined
              } : undefined
            }));
          }
          return [];
        }),
        catchError(error => {
          console.error('Error al obtener inscripciones de asignatura:', error);
          return of([]);
        })
      );
  }

  obtenerInscripcion(id: number): Observable<Inscripcion> {
    return this.http.get<any>(`${this.apiUrl}/${id}`)
      .pipe(
        map(respuesta => {
          if (respuesta && respuesta.exito && respuesta.data) {
            const item = respuesta.data;
            return {
              id: item.id,
              estudianteId: item.estudianteId,
              nombreEstudiante: item.nombreEstudiante,
              materiaId: item.materiaId,
              nombreMateria: item.nombreMateria,
              creditos: item.creditos || 0,
              nombreProfesor: item.nombreProfesor,
              fechaRegistro: item.fechaRegistro
            };
          }
          throw new Error('Inscripción no encontrada');
        }),
        catchError(error => {
          console.error('Error al obtener inscripción:', error);
          return throwError(() => new Error('Error al obtener inscripción'));
        })
      );
  }

  inscribirAsignatura(solicitud: SolicitudInscripcion): Observable<Inscripcion> {
    const estudianteId = solicitud.estudianteId;
    return this.obtenerInscripcionesEstudiante(estudianteId).pipe(
      switchMap(inscripciones => {
        if (inscripciones.length >= this.MAX_ASIGNATURAS) {
          return throwError(() => new Error('No puedes inscribirte en más de 3 asignaturas'));
        }
        const asignaturasRegistradasIds = inscripciones.map(i => i.materiaId);
        // Usar materiaId si está disponible, de lo contrario usar asignaturaId
        const materiaIdToCheck = solicitud.materiaId || solicitud.asignaturaId || 0;
        if (materiaIdToCheck !== 0 && asignaturasRegistradasIds.includes(materiaIdToCheck)) {
          return throwError(() => new Error('Ya estás inscrito en esta asignatura'));
        }
        if (asignaturasRegistradasIds.length === 0) {
          const solicitudBackend = {
            estudianteId: solicitud.estudianteId,
            nombreEstudiante: solicitud.nombreEstudiante || '',
            materiaId: solicitud.materiaId,
            nombreMateria: solicitud.nombreMateria || '',
            creditos: 0,
            nombreProfesor: null,
            fechaRegistro: new Date().toISOString()
          };
          return this.http.post<any>(this.apiUrl, solicitudBackend)
            .pipe(
              map(respuesta => {
                console.log('Respuesta recibida:', solicitudBackend);
                if (respuesta && respuesta.exito && respuesta.data) {
                  const item = respuesta.data;
                  // Convertir a formato Inscripcion
                  return {
                    id: item.id,
                    estudianteId: item.estudianteId,
                    nombreEstudiante: item.nombreEstudiante || '',
                    materiaId: item.materiaId,
                    nombreMateria: item.nombreMateria || '',
                    creditos: item.creditos || 0,
                    nombreProfesor: item.nombreProfesor || null,
                    fechaRegistro: item.fechaRegistro ? new Date(item.fechaRegistro).toISOString() : new Date().toISOString()
                  };
                }
                throw new Error('Error al registrar la asignatura');
              }),
              catchError(error => {
                console.error('Error al inscribir asignatura:', error);
                return throwError(() => new Error('Error al inscribir asignatura'));
              })
            );
        }
        const materiaId = solicitud.materiaId || solicitud.asignaturaId || 0;
        if (materiaId === 0) {
          return throwError(() => new Error('ID de materia no vu00e1lido'));
        }
        return this.asignaturaServicio.obtenerAsignatura(materiaId).pipe(
          switchMap(nuevaAsignatura => {
            return this.asignaturaServicio.obtenerAsignaturasPorIds(asignaturasRegistradasIds).pipe(
              switchMap(asignaturasRegistradas => {
                const profesoresIds = asignaturasRegistradas.map(a => a.profesorId);
                if (profesoresIds.includes(nuevaAsignatura.profesorId)) {
                  return throwError(() => new Error('No puedes tener más de una asignatura con el mismo profesor'));
                }
                const solicitudBackend = {
                  estudianteId: solicitud.estudianteId,
                  nombreEstudiante: solicitud.nombreEstudiante || '',
                  materiaId: solicitud.materiaId || solicitud.asignaturaId,
                  nombreMateria: solicitud.nombreMateria || solicitud.nombreAsignatura || '',
                  fechaRegistro: new Date()
                };
                return this.http.post<any>(this.apiUrl, solicitudBackend)
                  .pipe(
                    map(respuesta => {
                      if (respuesta && respuesta.exito && respuesta.data) {
                        const item = respuesta.data;
                        // Convertir a formato Inscripcion
                        return {
                          id: item.id,
                          estudianteId: item.estudianteId,
                          nombreEstudiante: item.nombreEstudiante || '',
                          materiaId: item.materiaId,
                          nombreMateria: item.nombreMateria || '',
                          creditos: item.creditos || 0,
                          nombreProfesor: item.nombreProfesor || null,
                          fechaRegistro: item.fechaRegistro ? new Date(item.fechaRegistro).toISOString() : new Date().toISOString()
                        };
                      }
                      throw new Error('Error al registrar la asignatura');
                    }),
                    catchError(error => {
                      console.error('Error al inscribir asignatura:', error);
                      return throwError(() => new Error('Error al inscribir asignatura'));
                    })
                  );
              })
            );
          })
        );
      })
    );
  }

  desinscribirAsignatura(inscripcionId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${inscripcionId}`)
      .pipe(
        map(respuesta => {
          if (respuesta && respuesta.exito) {
            return respuesta.data;
          }
          throw new Error('Error al eliminar la inscripción');
        }),
        catchError(error => {
          console.error('Error al desinscribir asignatura:', error);
          return throwError(() => new Error('Error al eliminar la inscripción'));
        })
      );
  }

  obtenerCompaneros(asignaturaId: number, estudianteId: number): Observable<Estudiante[]> {
    return this.http.get<any>(`${this.apiUrl}/materia/${asignaturaId}`)
      .pipe(
        map(response => {
          if (response && response.exito && response.data) {
            console.log('companeros',response.data)
            return response.data
              .filter((item: any) => item.estudianteId !== estudianteId)
              .map((item: any) => ({
                id: item.estudianteId,
                nombre: item.nombreEstudiante,
                matricula: '',
                email: ''
              }));
          }
          return [];
        }),
        catchError(error => {
          console.error('Error al obtener compañeros:', error);
          return of([]);
        })
      );
  }

  registrarAsignatura(solicitud: SolicitudInscripcion): Observable<Inscripcion> {
    return this.inscribirAsignatura(solicitud);
  }

  puedeAccederSeccionEstudiante(): Observable<boolean> {
    return this.autenticacionServicio.obtenerUsuarioActual().pipe(
      map(user => {
        // Solo los administradores y profesores pueden acceder a la sección de estudiantes
        return user?.role === 'admin' || user?.role === 'professor';
      }),
      catchError(() => of(false))
    );
  }

  obtenerTotalCreditosEstudiante(estudianteId: number): Observable<number> {
    return this.obtenerInscripcionesEstudiante(estudianteId).pipe(
      map(inscripciones => {
        if (inscripciones.length === 0) {
          return 0;
        }
        
        // Calcular el total de créditos directamente de las inscripciones
        return inscripciones.reduce((total, inscripcion) => {
          // Verificar si la asignatura y sus créditos están definidos
          const creditos = inscripcion.creditos || 0;
          return total + creditos;
        }, 0);
      }),
      catchError(error => {
        console.error('Error al obtener créditos:', error);
        return of(0);
      })
    );
  }
}