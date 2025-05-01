import { Component, OnInit } from '@angular/core';
import { Materia } from '../../modelos/materia.modelo';
import { MateriaServicio } from '../../servicios/materia.servicio';
import { AutenticacionServicio } from '../../servicios/autenticacion.servicio';
import { InscripcionServicio } from '../../servicios/inscripcion.servicio';

@Component({
  selector: 'app-lista-materias',
  templateUrl: './lista-materias.componente.html',
  styleUrls: ['./lista-materias.componente.css']
})
export class ListaMateriasComponente implements OnInit {
  materias: Materia[] = [];
  cargando = false;
  error = '';
  esEstudiante = false;
  esAdmin = false;
  esProfesor = false;

  constructor(
    private materiaServicio: MateriaServicio,
    private autenticacionServicio: AutenticacionServicio,
    private inscripcionServicio: InscripcionServicio
  ) { }

  ngOnInit(): void {
    this.esEstudiante = this.autenticacionServicio.esEstudiante();
    this.esAdmin = this.autenticacionServicio.esAdmin();
    this.esProfesor = this.autenticacionServicio.esProfesor && this.autenticacionServicio.esProfesor();
    this.cargarMaterias();
  }

  cargarMaterias(): void {
    this.cargando = true;

    if (this.esEstudiante) {
      const usuarioId = this.autenticacionServicio.obtenerUsuarioActualId();
      console.log('Obteniendo ID del usuario actual:', usuarioId);
      if (usuarioId) {
        console.log('Obteniendo materias para el estudiante con ID:', usuarioId); 
        console.log('Materias obtenidas:', this.materias);
        this.materiaServicio.obtenerMateriasEstudiante(usuarioId).subscribe({
          next: (datos) => {
            this.materias = datos;
            console.log('Datos de materias:', datos);
            this.cargando = false;
          },
          error: (err) => {
            this.error = 'Error al cargar materias registradas';
            this.cargando = false;
            console.error(err);
          }
        });
      } else {
        this.cargando = false;
        this.error = 'No se pudo identificar al estudiante';
      }
    } else if (this.esProfesor) {
      this.materiaServicio.obtenerMaterias(true).subscribe({
        next: (datos) => {
          this.materias = datos;
          this.cargando = false;
        },
        error: (err) => {
          this.error = 'Error al cargar materias del profesor';
          this.cargando = false;
          console.error(err);
        }
      });
    } else {
      this.materiaServicio.obtenerMaterias().subscribe({
        next: (datos) => {
          this.materias = datos;
          this.cargando = false;
        },
        error: (err) => {
          this.error = 'Error al cargar materias';
          this.cargando = false;
          console.error(err);
        }
      });
    }
  }

  eliminarMateria(id: number): void {
    if (confirm('¿Está seguro de eliminar esta materia? Esta acción no se puede deshacer.')) {
      this.cargando = true;
      this.error = '';
      
      this.materiaServicio.eliminarAsignatura(id).subscribe({
        next: () => {
          this.cargarMaterias(); // Recargar la lista después de eliminar
        },
        error: (err) => {
          this.error = 'Error al eliminar la materia: ' + (err.message || 'Ocurrió un error desconocido');
          this.cargando = false;
          console.error(err);
        }
      });
    }
  }
}
