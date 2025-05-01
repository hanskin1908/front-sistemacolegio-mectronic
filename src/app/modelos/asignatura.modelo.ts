import { Profesor } from './profesor.modelo';

export interface Asignatura {
  id: number;
  nombre: string;
  codigo: string;
  creditos: number;
  profesorId: number;
  profesor?: Profesor;
}
