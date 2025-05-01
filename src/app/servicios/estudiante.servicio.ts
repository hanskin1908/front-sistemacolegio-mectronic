import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Estudiante } from '../modelos/estudiante.modelo';
import { Inscripcion } from '../modelos/inscripcion.modelo';
import { environment } from '../../environments/environment';

interface ApiRespuesta<T> {
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
export class EstudianteServicio {
  private apiUrl = `${environment.apiUrl}/Estudiantes`;

  constructor(private http: HttpClient) { }

  obtenerEstudiantes(): Observable<Estudiante[]> {
    return this.http.get<ApiRespuesta<EstudianteDto[]>>(this.apiUrl)
      .pipe(
        map(respuesta => {
          if (!respuesta.exito) {
            throw new Error(respuesta.mensaje || 'Error al obtener estudiantes');
          }
          return respuesta.data.map(dto => this.mapearEstudianteDtoAEstudiante(dto));
        }),
        catchError(error => this.manejarError(error))
      );
  }

  obtenerEstudiante(id: number): Observable<Estudiante> {
    return this.http.get<ApiRespuesta<EstudianteDto>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(respuesta => {
          if (!respuesta.exito) {
            throw new Error(respuesta.mensaje || 'Error al obtener estudiante');
          }
          return this.mapearEstudianteDtoAEstudiante(respuesta.data);
        }),
        catchError(error => this.manejarError(error))
      );
  }

  crearEstudiante(estudiante: Estudiante): Observable<Estudiante> {
    const estudianteDto = this.mapearEstudianteAEstudianteDto(estudiante);
    return this.http.post<ApiRespuesta<EstudianteDto>>(this.apiUrl, estudianteDto)
      .pipe(
        map(respuesta => {
          if (!respuesta.exito) {
            throw new Error(respuesta.mensaje || 'Error al crear estudiante');
          }
          return this.mapearEstudianteDtoAEstudiante(respuesta.data);
        }),
        catchError(error => this.manejarError(error))
      );
  }

  actualizarEstudiante(estudiante: Estudiante): Observable<Estudiante> {
    const estudianteDto = this.mapearEstudianteAEstudianteDto(estudiante);
    return this.http.put<ApiRespuesta<EstudianteDto>>(`${this.apiUrl}/${estudiante.id}`, estudianteDto)
      .pipe(
        map(respuesta => {
          if (!respuesta.exito) {
            throw new Error(respuesta.mensaje || 'Error al actualizar estudiante');
          }
          return this.mapearEstudianteDtoAEstudiante(respuesta.data);
        }),
        catchError(error => this.manejarError(error))
      );
  }

  eliminarEstudiante(id: number): Observable<boolean> {
    return this.http.delete<ApiRespuesta<boolean>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(respuesta => {
          if (!respuesta.exito) {
            throw new Error(respuesta.mensaje || 'Error al eliminar estudiante');
          }
          return respuesta.data;
        }),
        catchError(error => this.manejarError(error))
      );
  }

  obtenerInscripcionesEstudiante(id: number): Observable<Inscripcion[]> {
    console.log('Obteniendo inscripciones del estudiante con ID:', id);
    return this.http.get<ApiRespuesta<EstudianteDto>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(respuesta => {
          console.log('mensaje',respuesta)
          if (!respuesta.exito) {
  
            throw new Error(respuesta.mensaje || 'Error al obtener registros del estudiante');
          }
          return respuesta.data.registros.map(dto => this.mapearRegistroDtoAInscripcion(dto));
        }),
        catchError(error => this.manejarError(error))
      );
  }

  private mapearEstudianteDtoAEstudiante(dto: EstudianteDto): Estudiante {
    return {
      id: dto.id,
      nombre: dto.nombre,
      email: dto.email,
      matricula: dto.matricula
    };
  }

  private mapearEstudianteAEstudianteDto(estudiante: Estudiante): EstudianteDto {
    return {
      id: estudiante.id || 0,
      nombre: estudiante.nombre,
      email: estudiante.email,
      matricula: estudiante.matricula,
      registros: []
    };
  }

  private mapearRegistroDtoAInscripcion(dto: RegistroDto): Inscripcion {
    return {
      id: dto.id,
      estudianteId: dto.estudianteId,
      nombreEstudiante: dto.nombreEstudiante,
      materiaId: dto.materiaId,
      nombreMateria: dto.nombreMateria,
      creditos: 0, // Este valor vendrá del backend
      nombreProfesor: null,
      fechaRegistro: dto.fechaRegistro.toString()
    };
  }

  private manejarError(error: any): Observable<never> {
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
