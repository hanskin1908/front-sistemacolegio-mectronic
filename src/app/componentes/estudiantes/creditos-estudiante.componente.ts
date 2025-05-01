import { Component, Input, OnInit } from '@angular/core';
import { InscripcionServicio } from '../../servicios/inscripcion.servicio';

@Component({
  selector: 'app-creditos-estudiante',
  templateUrl: './creditos-estudiante.componente.html',
  styleUrls: ['./creditos-estudiante.componente.css']
})
export class CreditosEstudianteComponente implements OnInit {
  @Input() estudianteId!: number;
  totalCreditos = 0;
  cargando = false;
  error = '';
  maxCreditos = 9; // 3 asignaturas x 3 créditos cada una

  constructor(private inscripcionServicio: InscripcionServicio) { }

  ngOnInit(): void {
    this.cargarCreditos();
  }

  cargarCreditos(): void {
    this.cargando = true;
    this.inscripcionServicio.obtenerTotalCreditosEstudiante(this.estudianteId).subscribe({
      next: (creditos) => {
        this.totalCreditos = creditos;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar créditos';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  obtenerPorcentajeProgreso(): number {
    return (this.totalCreditos / this.maxCreditos) * 100;
  }
}
