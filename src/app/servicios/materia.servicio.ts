import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Materia } from '../modelos/materia.modelo';
import { Estudiante } from '../modelos/estudiante.modelo';
import { Profesor } from '../modelos/profesor.modelo';
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
export class MateriaServicio {
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

  obtenerMateriasEstudiante(estudianteId: number): Observable<Materia[]> {
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

  obtenerMaterias(esProfesor: boolean = false): Observable<Materia[]> {
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

  obtenerMateria(id: number): Observable<Materia> {
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
          throw new Error('Materia no encontrada');
        }),
        catchError(this.manejarError)
      );
  }

  obtenerMateriasPorIds(ids: number[]): Observable<Materia[]> {
    // Si solo hay un ID, usar el endpoint de obtener una materia
    if (ids.length === 1) {
      return this.obtenerMateria(ids[0]).pipe(
        map(materia => [materia]),
        catchError(error => {
          console.error('Error al obtener materia por ID u00fanico:', error);
          return of([]);
        })
      );
    }
    
    // Si hay mu00faltiples IDs, usar el endpoint multiple
    const queryParams = ids.map(id => `ids=${id}`).join('&');
    return this.http.get<any>(`${this.apiUrl}/multiple?${queryParams}`)
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
        catchError(error => {
          console.error('Error al obtener materias por mu00faltiples IDs:', error);
          return this.manejarError(error);
        })
      );
  }

  obtenerEstudiantesPorMateria(id: number, esProfesor: boolean = false): Observable<Estudiante[]> {
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
              return throwError(() => new Error('NO_PERMISOS'));
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

  crearAsignatura(materiaDto: MateriaDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, materiaDto)
      .pipe(
        catchError(this.manejarError)
      );
  }

  actualizarAsignatura(id: number, materiaDto: MateriaDto): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, materiaDto)
      .pipe(
        catchError(this.manejarError)
      );
  }

  eliminarAsignatura(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.manejarError)
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