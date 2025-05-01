import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Asignatura } from '../../../modelos/asignatura.modelo';
import { Profesor } from '../../../modelos/profesor.modelo';
import { AsignaturaServicio } from '../../../servicios/asignatura.servicio';
import { ProfesorServicio } from '../../../servicios/profesor.servicio';

@Component({
  selector: 'app-formulario-asignatura',
  templateUrl: './formulario-asignatura.componente.html',
  styleUrls: ['./formulario-asignatura.componente.css']
})
export class FormularioAsignaturaComponente implements OnInit {
  asignaturaFormulario!: FormGroup;
  profesores: Profesor[] = [];
  cargando = false;
  error = '';
  exito = '';
  modoEdicion = false;
  asignaturaId: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private asignaturaServicio: AsignaturaServicio,
    private profesorServicio: ProfesorServicio,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.iniciarFormulario();
    this.cargarProfesores();
    
    // Verificar si estamos en modo edición
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.asignaturaId = +id;
      this.modoEdicion = true;
      this.cargarAsignatura(this.asignaturaId);
    }
  }

  iniciarFormulario(): void {
    this.asignaturaFormulario = this.formBuilder.group({
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

  cargarAsignatura(id: number): void {
    this.cargando = true;
    this.asignaturaServicio.obtenerAsignatura(id).subscribe({
      next: (asignatura) => {
        this.asignaturaFormulario.patchValue({
          nombre: asignatura.nombre,
          codigo: asignatura.codigo,
          creditos: asignatura.creditos,
          profesorId: asignatura.profesorId
        });
        this.cargando = false;
      },
      error: (err) => {
        this.error = `Error al cargar la asignatura: ${err.message}`;
        this.cargando = false;
      }
    });
  }

  onSubmit(): void {
    if (this.asignaturaFormulario.invalid) {
      console.log('Formulario inválido:', this.asignaturaFormulario.errors);
      return;
    }

    this.cargando = true;
    this.error = '';
    this.exito = '';

    const datosAsignatura = this.asignaturaFormulario.value;
    console.log('Datos del formulario:', datosAsignatura);
    
    // Crear el objeto AsignaturaDto para enviar a la API
    const asignaturaDto = {
      nombre: datosAsignatura.nombre,
      codigo: datosAsignatura.codigo,
      creditos: datosAsignatura.creditos,
      profesorId: datosAsignatura.profesorId
    };
    
    console.log('AsignaturaDto a enviar:', asignaturaDto);

    if (this.modoEdicion && this.asignaturaId) {
      this.asignaturaServicio.actualizarAsignatura({...asignaturaDto, id: this.asignaturaId}).subscribe({
        next: (respuesta) => {
          console.log('Respuesta exitosa:', respuesta);
          this.exito = 'Asignatura actualizada correctamente';
          this.cargando = false;
          setTimeout(() => {
            this.router.navigate(['/asignaturas', this.asignaturaId]);
          }, 1500);
        },
        error: (err) => {
          console.error('Error en componente:', err);
          this.error = err.message || 'Error al actualizar la asignatura';
          this.cargando = false;
        }
      });
    } else {
      this.asignaturaServicio.crearAsignatura(asignaturaDto).subscribe({
        next: (nuevaAsignatura) => {
          console.log('Respuesta exitosa:', nuevaAsignatura);
          this.exito = 'Asignatura registrada correctamente';
          this.cargando = false;
          this.asignaturaFormulario.reset();
          setTimeout(() => {
            this.router.navigate(['/asignaturas', nuevaAsignatura.id]);
          }, 1500);
        },
        error: (err) => {
          console.error('Error en componente:', err);
          this.error = err.message || 'Error al registrar la asignatura';
          this.cargando = false;
        }
      });
    }
  }
}