import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Profesor } from '../../../modelos/profesor.modelo';
import { ProfesorServicio } from '../../../servicios/profesor.servicio';
import { AutenticacionServicio } from '../../../servicios/autenticacion.servicio';

@Component({
  selector: 'app-lista-profesores',
  templateUrl: './lista-profesores.componente.html',
  styleUrls: ['./lista-profesores.componente.css']
})
export class ListaProfesoresComponente implements OnInit {
  profesores: Profesor[] = [];
  cargando = false;
  error: string | null = null;
  esAdmin = false;

  constructor(
    private profesorServicio: ProfesorServicio,
    private autenticacionServicio: AutenticacionServicio,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.esAdmin = this.autenticacionServicio.esAdmin();
    this.cargarProfesores();
  }

  cargarProfesores(): void {
    this.cargando = true;
    this.error = null;
    this.profesorServicio.obtenerProfesores().subscribe({
      next: (datos) => {
        this.profesores = datos;
        this.cargando = false;
      },
      error: (error) => {
        this.error = error.message || 'Error al cargar los profesores';
        this.cargando = false;
      }
    });
  }

  agregarProfesor(): void {
    this.router.navigate(['/profesores/nuevo']);
  }

  editarProfesor(id: number): void {
    this.router.navigate(['/profesores', id, 'editar']);
  }

  eliminarProfesor(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este profesor?')) {
      this.cargando = true;
      this.error = null;
      this.profesorServicio.eliminarProfesor(id).subscribe({
        next: () => {
          this.cargarProfesores();
        },
        error: (error) => {
          this.error = error.message || 'Error al eliminar el profesor';
          this.cargando = false;
        }
      });
    }
  }
}
