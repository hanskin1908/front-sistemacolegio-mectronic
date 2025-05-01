import { Estudiante } from './estudiante.modelo';
import { Asignatura } from './asignatura.modelo';
import { Profesor } from './profesor.modelo';

export interface Inscripcion {
  id?: number;
  estudianteId: number;
  nombreEstudiante: string;
  materiaId: number;
  nombreMateria: string;
  creditos: number;
  nombreProfesor: string | null;
  fechaRegistro: string;
}

export interface SolicitudInscripcion {
  estudianteId: number;
  materiaId: number;
  asignaturaId?: number; // Alias para materiaId para compatibilidad
  nombreEstudiante?: string;
  nombreMateria?: string;
  nombreAsignatura?: string; // Alias para nombreMateria para compatibilidad
}

// Interfaces para filtrar inscripciones por profesor
export interface FiltroAsignaturasProfesor {
  profesorId: number;
}

export interface FiltroEstudiantesProfesor {
  profesorId: number;
  asignaturaId: number;
}

// Interfaces para respuestas filtradas
export interface RespuestaAsignaturasProfesor {
  asignaturas: Asignatura[];
  profesorId: number;
}

export interface RespuestaEstudiantesProfesor {
  inscripciones: Inscripcion[];
  asignaturaId: number;
  profesorId: number;
}
