import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EstudianteServicio } from '../../../servicios/estudiante.servicio';
import { Estudiante } from '../../../modelos/estudiante.modelo';

@Component({
  selector: 'app-formulario-estudiante',
  templateUrl: './formulario-estudiante.componente.html',
  styleUrls: ['./formulario-estudiante.componente.css']
})
export class FormularioEstudianteComponente implements OnInit {
  formularioEstudiante: FormGroup;
  modoEdicion = false;
  estudianteId: number | null = null;
  cargando = false;
  enviando = false;
  error = '';
  exito = '';

  constructor(
    private fb: FormBuilder,
    private estudianteServicio: EstudianteServicio,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.formularioEstudiante = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      apellido: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      matricula: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.estudianteId = +id;
      this.modoEdicion = true;
      this.cargarEstudiante(this.estudianteId);
    }
  }

  cargarEstudiante(id: number): void {
    this.cargando = true;
    this.estudianteServicio.obtenerEstudiante(id).subscribe({
      next: (estudiante) => {
        this.formularioEstudiante.patchValue({
          nombre: estudiante.nombre.split(' ')[0] || '',
          apellido: estudiante.nombre.split(' ').slice(1).join(' ') || '',
          email: estudiante.email || '',
          matricula: estudiante.matricula || ''
        });
        this.cargando = false;
      },
      error: (err) => {
        this.error = `Error al cargar el estudiante: ${err.message}`;
        this.cargando = false;
      }
    });
  }

  onSubmit(): void {
    if (this.formularioEstudiante.invalid) {
      return;
    }

    this.enviando = true;
    this.error = '';
    this.exito = '';

    const formValues = this.formularioEstudiante.value;
    const estudianteData = {
      nombre: `${formValues.nombre} ${formValues.apellido}`.trim(),
      email: formValues.email,
      matricula: formValues.matricula
    };

    if (this.modoEdicion && this.estudianteId) {
      this.estudianteServicio.actualizarEstudiante({...estudianteData, id: this.estudianteId}).subscribe({
        next: () => {
          this.exito = 'Estudiante actualizado correctamente';
          this.enviando = false;
          setTimeout(() => {
            this.router.navigate(['/estudiantes', this.estudianteId]);
          }, 1500);
        },
        error: (err) => {
          this.error = `Error al actualizar el estudiante: ${err.message}`;
          this.enviando = false;
        }
      });
    } else {
      this.estudianteServicio.crearEstudiante(estudianteData).subscribe({
        next: (nuevoEstudiante) => {
          this.exito = 'Estudiante creado correctamente';
          this.enviando = false;
          setTimeout(() => {
            this.router.navigate(['/estudiantes', nuevoEstudiante.id]);
          }, 1500);
        },
        error: (err) => {
          this.error = `Error al crear el estudiante: ${err.message}`;
          this.enviando = false;
        }
      });
    }
  }
}