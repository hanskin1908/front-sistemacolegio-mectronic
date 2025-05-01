export interface Registro {
  id: number;
  estudianteId: number;
  nombreEstudiante: string;
  materiaId: number;
  nombreMateria: string;
  creditos: number;
  nombreProfesor: string | null;
  fechaRegistro: string;
}

export interface Estudiante {
  id?: number;
  nombre: string;
  email: string;
  matricula: string;
  registros?: Registro[];
}
