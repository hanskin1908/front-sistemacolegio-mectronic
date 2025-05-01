import { Component, Input, OnInit } from '@angular/core';
import { Estudiante } from '../../../modelos/estudiante.modelo';
import { InscripcionServicio } from '../../../servicios/inscripcion.servicio';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-companeros',
  templateUrl: './companeros.componente.html',
  styleUrls: ['./companeros.componente.css']
})
export class CompanerosComponente implements OnInit {
  @Input() asignaturaId!: number;
  @Input() estudianteActualId!: number;
  
  companeros: Estudiante[] = [];
  cargando = false;
  error = '';

  constructor(private inscripcionServicio: InscripcionServicio) { }

  ngOnInit(): void {
    this.cargarCompaneros();
  }

  cargarCompaneros(): void {
    if (!this.asignaturaId || !this.estudianteActualId) {
      this.error = 'Faltan datos para cargar compañeros';
      return;
    }
    
    this.cargando = true;
    this.inscripcionServicio.obtenerCompaneros(this.asignaturaId, this.estudianteActualId).subscribe({
      next: (data: any) => {
        this.companeros = data;
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = 'Error al cargar compañeros';
        this.cargando = false;
        console.error(err);
      }
    });
  }
}