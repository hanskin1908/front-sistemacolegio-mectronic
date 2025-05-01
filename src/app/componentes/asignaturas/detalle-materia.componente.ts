import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Materia } from '../../modelos/materia.modelo';
import { Estudiante } from '../../modelos/estudiante.modelo';
import { MateriaServicio } from '../../servicios/materia.servicio';
import { AutenticacionServicio } from '../../servicios/autenticacion.servicio';
import { InscripcionServicio } from '../../servicios/inscripcion.servicio';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-detalle-materia',
  templateUrl: './detalle-materia.componente.html',
  styleUrls: ['./detalle-materia.componente.css']
})
export class DetalleMateriaComponente implements OnInit {
  materia: Materia | null = null;
  estudiantes: Estudiante[] = [];
  companeros: Estudiante[] = [];
  cargando = false;
  error = '';
  usuarioActualId: number | null = null;
  esEstudiante = false;
  esProfesor = false;

  constructor(
    private ruta: ActivatedRoute,
    private materiaServicio: MateriaServicio,
    private autenticacionServicio: AutenticacionServicio,
    private inscripcionServicio: InscripcionServicio
  ) { }

  ngOnInit(): void {
    // Obtener el ID del usuario actual desde el servicio de autenticación
    const usuarioActual = this.autenticacionServicio.obtenerUsuarioActual().subscribe(user => {
      if (user && user.id) {
        this.usuarioActualId = user.id;
      }
    });
    
    this.esEstudiante = this.autenticacionServicio.esEstudiante();
    this.esProfesor = this.autenticacionServicio.esProfesor && this.autenticacionServicio.esProfesor();
    this.ruta.params.subscribe(params => {
      const id = params['id'];
      if (id && !isNaN(Number(id))) {
        const materiaId = Number(id);
        this.cargarMateria(materiaId);
        if (!this.esEstudiante) {
          this.cargarEstudiantes(materiaId);
        } else if (this.usuarioActualId) {
          this.cargarCompaneros(materiaId, this.usuarioActualId);
        }
      } else {
        this.error = 'ID de materia invu00e1lido';
      }
    });
  }

  cargarMateria(id: number): void {
    if (!id || isNaN(id)) {
      this.error = 'ID de materia invu00e1lido';
      return;
    }
    this.cargando = true;
    this.materiaServicio.obtenerMateria(id).subscribe({
      next: (data) => {
        this.materia = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar datos de la materia';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  cargarEstudiantes(materiaId: number): void {
    if (!materiaId || isNaN(materiaId)) {
      this.error = 'ID de materia invu00e1lido';
      return;
    }
    this.cargando = true;
    this.materiaServicio.obtenerEstudiantesPorMateria(materiaId, this.esProfesor).subscribe({
      next: (data) => {
        this.estudiantes = data;
        this.cargando = false;
      },
      error: (err) => {
        if (err.message === 'NO_PERMISOS') {
          this.error = 'No tienes permisos para ver los estudiantes de esta materia.';
        } else if (err.message === 'NO_ENCONTRADO') {
          this.error = 'Materia no encontrada.';
        } else {
          this.error = 'Error al cargar estudiantes de la materia';
        }
        this.cargando = false;
        console.error(err);
      }
    });
  }

  cargarCompaneros(materiaId: number, estudianteId: number): void {
    if (!materiaId || isNaN(materiaId) || !estudianteId || isNaN(estudianteId)) {
      this.error = 'ID de materia o estudiante invu00e1lido';
      return;
    }
    this.cargando = true;
    this.inscripcionServicio.obtenerCompaneros(materiaId, estudianteId).subscribe({
      next: (data: any) => {
        console.log('Compañeros obtenidos:', data);
        this.companeros = data;
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = 'Error al cargar compañeros de clase';
        this.cargando = false;
        console.error(err);
      }
    });
  }
}
