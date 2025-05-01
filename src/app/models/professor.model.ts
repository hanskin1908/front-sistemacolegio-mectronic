export interface Professor {
  id?: number;
  nombre: string;
  email: string;
  departamento: string;
  materias?: any[];
  
  // Propiedades adicionales para el formulario que no se envían al backend
  apellido?: string;
  especialidad?: string;
  telefono?: string;
  direccion?: string;
  
  // Propiedad computada para mantener compatibilidad con el código existente
  name?: string; // Esta propiedad se calculará en el servicio
}