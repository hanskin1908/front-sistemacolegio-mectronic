import { Component, OnInit } from '@angular/core';
import { Estudiante } from '../../modelos/estudiante.modelo';
import { EstudianteServicio } from '../../servicios/estudiante.servicio';
import { AutenticacionServicio } from '../../servicios/autenticacion.servicio';

@Component({
  selector: 'app-lista-estudiantes',
  templateUrl: './lista-estudiantes.componente.html',
  styleUrls: ['./lista-estudiantes.componente.css']
})
export class ListaEstudiantesComponente implements OnInit {
  estudiantes: Estudiante[] = [];
  cargando = false;
  error = '';
  esAdmin = false;

  constructor(
    private estudianteServicio: EstudianteServicio,
    private autenticacionServicio: AutenticacionServicio
  ) { }

  ngOnInit(): void {
    this.esAdmin = this.autenticacionServicio.esAdmin();
    this.cargarEstudiantes();
  }

  cargarEstudiantes(): void {
    this.cargando = true;
    this.estudianteServicio.obtenerEstudiantes()
      .subscribe({
        next: (datos) => {
          this.estudiantes = datos;
          this.cargando = false;
        },
        error: (err) => {
          this.error = 'Error al cargar estudiantes';
          this.cargando = false;
          console.error(err);
        }
      });
  }

  eliminarEstudiante(id: number): void {
    if (confirm('¿Está seguro de eliminar este estudiante?')) {
      this.estudianteServicio.eliminarEstudiante(id)
        .subscribe({
          next: () => {
            this.cargarEstudiantes();
          },
          error: (err) => {
            this.error = 'Error al eliminar estudiante';
            console.error(err);
          }
        });
    }
  }
}
