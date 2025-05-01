import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Asignatura } from '../../../modelos/asignatura.modelo';
import { Profesor } from '../../../modelos/profesor.modelo';
import { AsignaturaServicio } from '../../../servicios/asignatura.servicio';
import { ProfesorServicio } from '../../../servicios/profesor.servicio';

@Component({
  selector: 'app-formulario-materia',
  templateUrl: './formulario-materia.componente.html',
  styleUrls: ['./formulario-materia.componente.css']
})
export class FormularioMateriaComponente implements OnInit {
  materiaFormulario!: FormGroup;
  profesores: Profesor[] = [];
  cargando = false;
  error = '';
  exito = '';

  constructor(
    private formBuilder: FormBuilder,
    private asignaturaServicio: AsignaturaServicio,
    private profesorServicio: ProfesorServicio,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.iniciarFormulario();
    this.cargarProfesores();
  }

  iniciarFormulario(): void {
    this.materiaFormulario = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      codigo: ['', [Validators.required]],
      creditos: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      profesorId: ['', [Validators.required]]
    });
  }

  cargarProfesores(): void {
    this.cargando = true;
    this.profesorServicio.obtenerProfesores().subscribe({
      next: (profesores) => {
        this.profesores = profesores;
        console.log('Profesores cargados:', profesores);
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar profesores';
        this.cargando = false;
        console.error('Error al cargar profesores:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.materiaFormulario.invalid) {
      console.log('Formulario inválido:', this.materiaFormulario.errors);
      return;
    }

    this.cargando = true;
    this.error = '';
    this.exito = '';

    const datosMateria = this.materiaFormulario.value;
    console.log('Datos del formulario:', datosMateria);
    
    // Crear el objeto AsignaturaDto para enviar a la API
    const asignaturaDto = {
      nombre: datosMateria.nombre,
      codigo: datosMateria.codigo,
      creditos: datosMateria.creditos,
      profesorId: datosMateria.profesorId
    };
    
    console.log('AsignaturaDto a enviar:', asignaturaDto);

    this.asignaturaServicio.crearAsignatura(asignaturaDto).subscribe({
      next: (respuesta: any) => {
        console.log('Respuesta exitosa:', respuesta);
        this.exito = 'Materia registrada correctamente';
        this.cargando = false;
        this.materiaFormulario.reset();
        // Opcionalmente navegar a la lista de materias
        // this.router.navigate(['/materias']);
      },
      error: (err: any) => {
        console.error('Error en componente:', err);
        this.error = err.message || 'Error al registrar la materia';
        this.cargando = false;
      }
    });
  }
}