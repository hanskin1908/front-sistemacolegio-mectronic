import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Estudiante } from '../../modelos/estudiante.modelo';
import { EstudianteServicio } from '../../servicios/estudiante.servicio';

@Component({
  selector: 'app-formulario-estudiante',
  templateUrl: './formulario-estudiante.componente.html',
  styleUrls: ['./formulario-estudiante.componente.css']
})
export class FormularioEstudianteComponente implements OnInit {
  formularioEstudiante!: FormGroup;
  esEdicion = false;
  estudianteId: number | null = null;
  cargando = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private estudianteServicio: EstudianteServicio,
    private router: Router,
    private ruta: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.ruta.params.subscribe(params => {
      if (params['id']) {
        this.esEdicion = true;
        this.estudianteId = +params['id'];
        this.cargarEstudiante(this.estudianteId);
      }
    });
  }

  inicializarFormulario(): void {
    this.formularioEstudiante = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      matricula: ['', [Validators.required]]
    });
  }

  cargarEstudiante(id: number): void {
    this.cargando = true;
    this.estudianteServicio.obtenerEstudiante(id).subscribe({
      next: (estudiante) => {
        this.formularioEstudiante.patchValue({
          nombre: estudiante.nombre,
          correo: estudiante.correo,
          matricula: estudiante.matricula
        });
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar datos del estudiante';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.formularioEstudiante.invalid) {
      return;
    }
    this.cargando = true;
    this.error = '';
    const datosEstudiante: Estudiante = {
      ...this.formularioEstudiante.value
    };
    if (this.esEdicion && this.estudianteId) {
      datosEstudiante.id = this.estudianteId;
      this.estudianteServicio.actualizarEstudiante(datosEstudiante).subscribe({
        next: () => {
          this.cargando = false;
          this.router.navigate(['/estudiantes']);
        },
        error: (err) => {
          this.error = 'Error al actualizar estudiante';
          this.cargando = false;
          console.error(err);
        }
      });
    } else {
      this.estudianteServicio.crearEstudiante(datosEstudiante).subscribe({
        next: () => {
          this.cargando = false;
          this.router.navigate(['/estudiantes']);
        },
        error: (err) => {
          this.error = 'Error al crear estudiante';
          this.cargando = false;
          console.error(err);
        }
      });
    }
  }
}
