import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Profesor } from '../../../modelos/profesor.modelo';
import { ProfesorServicio } from '../../../servicios/profesor.servicio';

@Component({
  selector: 'app-formulario-profesor',
  templateUrl: './formulario-profesor.componente.html',
  styleUrls: ['./formulario-profesor.componente.css']
})
export class FormularioProfesorComponente implements OnInit {
  profesorForm!: FormGroup;
  cargando = false;
  error: string | null = null;
  esEdicion = false;
  profesorId?: number;

  constructor(
    private formBuilder: FormBuilder,
    private profesorServicio: ProfesorServicio,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.esEdicion = true;
        this.profesorId = +params['id'];
        this.cargarDatosProfesor(this.profesorId);
      }
    });
  }

  private inicializarFormulario(): void {
    this.profesorForm = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      departamento: ['', [Validators.required]]
      // Campos eliminados por no ser necesarios
      // especialidad: [''],
      // telefono: [''],
      // direccion: [''] 
    });
  }

  private cargarDatosProfesor(id: number): void {
    this.cargando = true;
    this.error = null;
    this.profesorServicio.obtenerProfesor(id).subscribe({
      next: (profesor) => {
        this.profesorForm.patchValue({
          nombre: profesor.nombre || '',
          apellido: profesor.apellido || '',
          email: profesor.email,
          departamento: profesor.departamento || ''
          // Campos eliminados por no ser necesarios
          // especialidad: profesor.especialidad || '',
          // telefono: profesor.telefono || '',
          // direccion: profesor.direccion || ''
        });
        console.log('Formulario del profesor actualizado con los datos:', this.profesorForm.value);
        this.cargando = false;
      },
      error: (error) => {
        this.error = error.message || 'Error al cargar los datos del profesor';
        this.cargando = false;
      }
    });
  }

  enviar(): void {
    if (this.profesorForm.invalid) {
      return;
    }
    this.cargando = true;
    this.error = null;
    
    // Solo incluir los campos necesarios para el backend
    const datosProfesor: Profesor = {
      nombre: this.profesorForm.value.nombre,
      email: this.profesorForm.value.email,
      departamento: this.profesorForm.value.departamento,
      materias: []
    };
    console.log('Datos del profesor a enviar:', datosProfesor);
    // Comentado: ya no se utilizan estos campos adicionales
    // const camposAdicionales = {
    //   apellido: this.profesorForm.value.apellido,
    //   especialidad: this.profesorForm.value.especialidad,
    //   telefono: this.profesorForm.value.telefono,
    //   direccion: this.profesorForm.value.direccion
    // };
    
    if (this.esEdicion && this.profesorId) {
      this.profesorServicio.actualizarProfesor(this.profesorId, datosProfesor).subscribe({
        next: () => {
          this.cargando = false;
          this.router.navigate(['/profesores']);
        },
        error: (error) => {
          this.cargando = false;
          this.error = error.message || 'Error al actualizar el profesor';
        }
      });
    } else {
      console.log('Creando un nuevo profesor:', datosProfesor);
      this.profesorServicio.crearProfesor(datosProfesor).subscribe({
        next: () => {
          this.cargando = false;
          this.router.navigate(['/profesores']);
        },
        error: (error) => {
          this.cargando = false;
          this.error = error.message || 'Error al crear el profesor';
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/profesores']);
  }
}