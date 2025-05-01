import { Profesor } from './profesor.modelo';

export interface Materia {
  id: number;
  nombre: string;
  codigo: string;
  creditos: number;
  profesorId: number;
  profesor?: Profesor;
}