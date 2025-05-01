import { Component, Input, OnInit } from '@angular/core';
import { AsignaturaServicio } from '../../../servicios/asignatura.servicio';
import { InscripcionServicio } from '../../../servicios/inscripcion.servicio';
import { Asignatura } from '../../../modelos/asignatura.modelo';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-creditos-estudiante',
  templateUrl: './creditos-estudiante.componente.html',
  styleUrls: ['./creditos-estudiante.componente.css']
})
export class CreditosEstudianteComponente implements OnInit {
  @Input() estudianteId!: number;
  
  asignaturas: Asignatura[] = [];
  totalCreditos = 0;
  cargando = false;
  error = '';

  constructor(
    private asignaturaServicio: AsignaturaServicio,
    private inscripcionServicio: InscripcionServicio
  ) { }

  ngOnInit(): void {
    this.cargarAsignaturas();
  }

  // Mu00e9todo pu00fablico para recargar los datos desde el componente padre
  public actualizarCreditos(): void {
    console.log('Actualizando cru00e9ditos del estudiante...');
    this.cargarAsignaturas();
  }

  cargarAsignaturas(): void {
    if (!this.estudianteId) {
      this.error = 'ID de estudiante no vu00e1lido';
      return;
    }
    
    this.cargando = true;
    this.asignaturaServicio.obtenerAsignaturasEstudiante(this.estudianteId).subscribe({
      next: (data) => {
        this.asignaturas = data;
        this.calcularTotalCreditos();
        this.cargando = false;
        console.log('Cru00e9ditos actualizados:', this.totalCreditos);
      },
      error: (err) => {
        this.error = 'Error al cargar asignaturas del estudiante';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  calcularTotalCreditos(): void {
    this.totalCreditos = this.asignaturas.reduce((total, asignatura) => total + asignatura.creditos, 0);
  }
}