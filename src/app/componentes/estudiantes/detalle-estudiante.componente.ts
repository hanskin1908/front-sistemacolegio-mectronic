import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Estudiante } from '../../modelos/estudiante.modelo';
import { Inscripcion } from '../../modelos/inscripcion.modelo';
import { Asignatura } from '../../modelos/asignatura.modelo';
import { EstudianteServicio } from '../../servicios/estudiante.servicio';
import { AsignaturaServicio } from '../../servicios/asignatura.servicio';
import { InscripcionServicio } from '../../servicios/inscripcion.servicio';
import { AutenticacionServicio } from '../../servicios/autenticacion.servicio';

@Component({
  selector: 'app-detalle-estudiante',
  templateUrl: './detalle-estudiante.componente.html',
  styleUrls: ['./detalle-estudiante.componente.css']
})
export class DetalleEstudianteComponente implements OnInit {
  estudiante: Estudiante | null = null;
  inscripciones: Inscripcion[] = [];
  asignaturasDisponibles: Asignatura[] = [];
  asignaturaSeleccionadaId: number | null = null;
  cargando = false;
  error = '';
  errorInscripcion = '';
  esAdmin = false;
  esUsuarioActual = false;

  constructor(
    private ruta: ActivatedRoute,
    private router: Router,
    private estudianteServicio: EstudianteServicio,
    private asignaturaServicio: AsignaturaServicio,
    private inscripcionServicio: InscripcionServicio,
    private autenticacionServicio: AutenticacionServicio
  ) { }

  ngOnInit(): void {
    this.esAdmin = this.autenticacionServicio.esAdmin();
    this.ruta.params.subscribe(params => {
      const id = +params['id'];
      this.cargarEstudiante(id);
      this.cargarInscripciones(id);
      const usuarioActualId = this.autenticacionServicio.obtenerIdUsuarioActual();
      this.esUsuarioActual = usuarioActualId === id;
    });
    this.cargarAsignaturas();
  }

  cargarEstudiante(id: number): void {
    this.cargando = true;
    this.estudianteServicio.obtenerEstudiante(id).subscribe({
      next: (datos) => {
        this.estudiante = datos;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar datos del estudiante';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  cargarInscripciones(idEstudiante: number): void {
    this.cargando = true;
    this.estudianteServicio.obtenerInscripcionesEstudiante(idEstudiante).subscribe({
      next: (datos) => {
        console.log('Inscripciones del estudiante obtenidas:', datos);
        this.inscripciones = datos;
        // Cargar las asignaturas disponibles después de obtener las inscripciones
        this.cargarAsignaturas();
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar inscripciones del estudiante';
        this.cargando = false;
        console.error('Error al cargar inscripciones:', err);
      }
    });
  }

  cargarAsignaturas(): void {
    this.asignaturaServicio.obtenerAsignaturas().subscribe({
      next: (datos) => {
        this.asignaturasDisponibles = datos;
        this.actualizarAsignaturasDisponibles();
      },
      error: (err) => {
        console.error('Error al cargar asignaturas', err);
      }
    });
  }

  actualizarAsignaturasDisponibles(): void {
    if (this.inscripciones.length > 0 && this.asignaturasDisponibles.length > 0) {
      const idsAsignaturasInscritas = this.inscripciones.map(i => i.materiaId);
      const idsProfesoresInscritos = this.inscripciones
        .map(i => this.asignaturasDisponibles.find(a => a.id === i.materiaId)?.profesorId)
        .filter(id => id !== undefined) as number[];
      this.asignaturasDisponibles = this.asignaturasDisponibles.filter(asignatura =>
        !idsAsignaturasInscritas.includes(asignatura.id) &&
        !idsProfesoresInscritos.includes(asignatura.profesorId)
      );
    }
  }

  registrarAsignatura(): void {
    if (!this.estudiante || !this.asignaturaSeleccionadaId) {
      this.errorInscripcion = 'Debe seleccionar una asignatura';
      return;
    }
    if (this.inscripciones.length >= 3) {
      this.errorInscripcion = 'Ya ha inscrito el máximo de 3 asignaturas permitidas';
      return;
    }
    this.cargando = true;
    this.errorInscripcion = '';
    this.inscripcionServicio.inscribirAsignatura({
      estudianteId: this.estudiante.id!,
      materiaId: this.asignaturaSeleccionadaId
    }).subscribe({
      next: () => {
        this.cargando = false;
        this.cargarInscripciones(this.estudiante!.id!);
        this.asignaturaSeleccionadaId = null;
      },
      error: (err: any) => {
        this.errorInscripcion = err.message || 'Error al inscribir asignatura';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  desinscribirAsignatura(idInscripcion: number): void {
    if (confirm('¿Está seguro de eliminar esta inscripción?')) {
      this.cargando = true;
      this.inscripcionServicio.desinscribirAsignatura(idInscripcion).subscribe({
        next: () => {
          this.cargando = false;
          this.cargarInscripciones(this.estudiante!.id!);
        },
        error: (err: any) => {
          this.error = 'Error al eliminar inscripción';
          this.cargando = false;
          console.error(err);
        }
      });
    }
  }
}
