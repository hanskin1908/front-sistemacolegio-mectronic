import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Asignatura } from '../modelos/asignatura.modelo';
import { Estudiante } from '../modelos/estudiante.modelo';
import { Profesor } from '../modelos/profesor.modelo';
import { environment } from '../../environments/environment';

interface AsignaturaDto {
  nombre: string;
  codigo: string;
  creditos: number;
  profesorId: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class AsignaturaServicio {
  private apiUrl = `${environment.apiUrl}/Materias`;
  private registrosUrl = `${environment.apiUrl}/Registros`;

  constructor(private http: HttpClient) { }

  private crearObjetoProfesor(id: any, nombreCompleto: string): Profesor {
    const [nombre, apellido] = nombreCompleto.split(' ').length > 1 ?
      [nombreCompleto.split(' ')[0], nombreCompleto.split(' ').slice(1).join(' ')] :
      [nombreCompleto, ''];
    return {
      id: id,
      nombre: nombre,
      apellido: apellido,
      email: '',
      departamento: '',
      nombreCompleto: nombreCompleto
    };
  }

  obtenerAsignaturasEstudiante(estudianteId: number): Observable<Asignatura[]> {
    return this.http.get<any>(`${this.apiUrl}/estudiante/${estudianteId}`)
      .pipe(
        map(respuesta => {
          if (respuesta && respuesta.exito && respuesta.data) {
            return respuesta.data.map((item: any) => ({
              id: item.id,
              nombre: item.nombre,
              codigo: item.codigo,
              creditos: item.creditos,
              profesorId: item.profesorId || 0,
              profesor: item.nombreProfesor ?
                this.crearObjetoProfesor(item.profesorId, item.nombreProfesor) :
                undefined
            }));
          }
          return [];
        }),
        catchError(this.manejarError)
      );
  }

  obtenerAsignaturas(esProfesor: boolean = false): Observable<Asignatura[]> {
    if (esProfesor) {
      return this.http.get<any>(`${this.apiUrl}/profesor-materias`).pipe(
        map(respuesta => {
          if (respuesta && respuesta.exito && respuesta.data && respuesta.data.materias) {
            return respuesta.data.materias.map((item: any) => ({
              id: item.id,
              nombre: item.nombre,
              codigo: item.codigo,
              creditos: item.creditos,
              profesorId: item.profesorId || 0,
              profesor: item.nombreProfesor ?
                this.crearObjetoProfesor(item.profesorId, item.nombreProfesor) :
                undefined
            }));
          }
          return [];
        }),
        catchError(this.manejarError)
      );
    }
    return this.http.get<any>(this.apiUrl)
      .pipe(
        map(respuesta => {
          if (respuesta && respuesta.exito && respuesta.data) {
            return respuesta.data.map((item: any) => ({
              id: item.id,
              nombre: item.nombre,
              codigo: item.codigo,
              creditos: item.creditos,
              profesorId: item.profesorId || 0,
              profesor: item.nombreProfesor ?
                this.crearObjetoProfesor(item.profesorId, item.nombreProfesor) :
                undefined
            }));
          }
          return [];
        }),
        catchError(this.manejarError)
      );
  }

  obtenerAsignatura(id: number): Observable<Asignatura> {
    return this.http.get<any>(`${this.apiUrl}/${id}`)
      .pipe(
        map(respuesta => {
          if (respuesta && respuesta.exito && respuesta.data) {
            const item = respuesta.data;
            return {
              id: item.id,
              nombre: item.nombre,
              codigo: item.codigo,
              creditos: item.creditos,
              profesorId: item.profesorId || 0,
              profesor: item.nombreProfesor ?
                this.crearObjetoProfesor(item.profesorId, item.nombreProfesor) :
                undefined
            };
          }
          throw new Error('Asignatura no encontrada');
        }),
        catchError(this.manejarError)
      );
  }

  obtenerAsignaturasPorIds(ids: number[]): Observable<Asignatura[]> {
    // Si solo hay un ID, usar el endpoint de obtener una asignatura
    if (ids.length === 1) {
      return this.obtenerAsignatura(ids[0]).pipe(
        map(asignatura => [asignatura]),
        catchError(error => {
          console.error('Error al obtener asignatura por ID único:', error);
          return of([]);
        })
      );
    }
    
    // Si hay múltiples IDs, intentar obtener cada asignatura individualmente
    // y combinar los resultados
    console.log('Obteniendo múltiples asignaturas por IDs individuales:', ids);
    
    // Crear un array de observables, uno para cada ID
    const observables = ids.map(id => 
      this.obtenerAsignatura(id).pipe(
        catchError(error => {
          console.error(`Error al obtener asignatura ID ${id}:`, error);
          return of(null); // Devolver null para las asignaturas que no se pueden obtener
        })
      )
    );
    
    // Combinar todos los observables y filtrar los resultados nulos
    return forkJoin(observables).pipe(
      map(asignaturas => asignaturas.filter(a => a !== null) as Asignatura[]),
      catchError(error => {
        console.error('Error al combinar resultados de asignaturas:', error);
        return of([]);
      })
    );
  }

  obtenerEstudiantesPorAsignatura(id: number, esProfesor: boolean = false): Observable<Estudiante[]> {
    if (esProfesor) {
      return this.http.get<any>(`${environment.apiUrl}/Estudiantes/por-materia-profesor/${id}`, { observe: 'response' })
        .pipe(
          map(respuesta => {
            if (respuesta.body && respuesta.body.exito && respuesta.body.data) {
              return respuesta.body.data.map((item: any) => ({
                id: item.id,
                nombre: item.nombre,
                matricula: item.matricula || '',
                email: item.email || ''
              }));
            }
            return [];
          }),
          catchError((error) => {
            if (error.status === 403) {
              return throwError(() => new Error('SIN_PERMISOS'));
            } else if (error.status === 404) {
              return throwError(() => new Error('NO_ENCONTRADO'));
            }
            return this.manejarError(error);
          })
        );
    }
    return this.http.get<any>(`${environment.apiUrl}/Registros/materia/${id}`)
      .pipe(
        map(respuesta => {
          if (respuesta && respuesta.exito && respuesta.data) {
            return respuesta.data.map((item: any) => ({
              id: item.estudianteId,
              nombre: item.nombreEstudiante,
              matricula: '',
              email: '',
            }));
          }
          return [];
        }),
        catchError(this.manejarError)
      );
  }

  crearAsignatura(asignaturaDto: AsignaturaDto): Observable<Asignatura> {
    return this.http.post<any>(this.apiUrl, asignaturaDto)
      .pipe(
        map(respuesta => {
          if (respuesta && respuesta.exito && respuesta.data) {
            const item = respuesta.data;
            return {
              id: item.id,
              nombre: item.nombre,
              codigo: item.codigo,
              creditos: item.creditos,
              profesorId: item.profesorId || 0,
              profesor: item.nombreProfesor ?
                this.crearObjetoProfesor(item.profesorId, item.nombreProfesor) :
                undefined
            };
          }
          throw new Error('Error al crear la asignatura');
        }),
        catchError(this.manejarError)
      );
  }

  actualizarAsignatura(asignatura: Asignatura): Observable<Asignatura> {
    return this.http.put<any>(`${this.apiUrl}/${asignatura.id}`, asignatura)
      .pipe(
        map(respuesta => {
          if (respuesta && respuesta.exito && respuesta.data) {
            const item = respuesta.data;
            return {
              id: item.id,
              nombre: item.nombre,
              codigo: item.codigo,
              creditos: item.creditos,
              profesorId: item.profesorId || 0,
              profesor: item.nombreProfesor ?
                this.crearObjetoProfesor(item.profesorId, item.nombreProfesor) :
                undefined
            };
          }
          throw new Error('Error al actualizar la asignatura');
        }),
        catchError(this.manejarError)
      );
  }

  verificarInscripcion(asignaturaId: number, estudianteId: number): Observable<boolean> {
    return this.http.get<any>(`${this.registrosUrl}/student/${asignaturaId}/${estudianteId}`)
      .pipe(
        map(respuesta => {
          if (respuesta && respuesta.exito) {
            return respuesta.data;
          }
          return false;
        }),
        catchError(error => {
          console.error('Error al verificar inscripción:', error);
          return of(false);
        })
      );
  }

  private manejarError(error: any) {
    let mensajeError = '¡Ocurrió un error desconocido!';
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
