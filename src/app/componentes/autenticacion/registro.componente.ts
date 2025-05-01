import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AutenticacionServicio } from '../../servicios/autenticacion.servicio';
import { RegisterRequest } from '../../models/auth.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.componente.html',
  styleUrls: ['./registro.componente.css']
})
export class RegistroComponente implements OnInit {
  formularioRegistro!: FormGroup;
  cargando = false;
  error: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private autenticacionServicio: AutenticacionServicio,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.formularioRegistro = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      confirmarContrasena: ['', [Validators.required]],
      idEstudiante: ['', [Validators.required]],
      idProfesor: [''],
      rol: ['estudiante', [Validators.required]]
    }, { validators: this.validadorCoincidenciaContrasena });

    this.formularioRegistro.get('rol')?.valueChanges.subscribe(rol => {
      if (rol === 'estudiante') {
        this.formularioRegistro.get('idEstudiante')?.setValidators([Validators.required]);
        this.formularioRegistro.get('idProfesor')?.clearValidators();
      } else if (rol === 'profesor') {
        this.formularioRegistro.get('idProfesor')?.setValidators([Validators.required]);
        this.formularioRegistro.get('idEstudiante')?.clearValidators();
      } else {
        this.formularioRegistro.get('idEstudiante')?.clearValidators();
        this.formularioRegistro.get('idProfesor')?.clearValidators();
      }
      this.formularioRegistro.get('idEstudiante')?.updateValueAndValidity();
      this.formularioRegistro.get('idProfesor')?.updateValueAndValidity();
    });
  }

  validadorCoincidenciaContrasena(form: FormGroup) {
    const contrasena = form.get('contrasena')?.value;
    const confirmarContrasena = form.get('confirmarContrasena')?.value;
    if (contrasena !== confirmarContrasena) {
      form.get('confirmarContrasena')?.setErrors({ noCoincide: true });
      return { noCoincide: true };
    } else {
      form.get('confirmarContrasena')?.setErrors(null);
      return null;
    }
  }

  onSubmit(): void {
    if (this.formularioRegistro.invalid) {
      return;
    }
    this.cargando = true;
    this.error = null;
    const datosRegistro: RegisterRequest = {
      name: this.formularioRegistro.value.nombre,
      email: this.formularioRegistro.value.correo,
      password: this.formularioRegistro.value.contrasena,
      role: this.formularioRegistro.value.rol
    };
    if (this.formularioRegistro.value.rol === 'student') {
      datosRegistro.studentId = parseInt(this.formularioRegistro.value.idEstudiante, 10);
    }
    if (this.formularioRegistro.value.rol === 'professor') {
      datosRegistro.professorId = parseInt(this.formularioRegistro.value.idProfesor, 10);
    }
    this.autenticacionServicio.registrar(datosRegistro).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/estudiantes']);
      },
      error: (mensajeError) => {
        this.cargando = false;
        this.error = mensajeError;
      }
    });
    this.autenticacionServicio.registrar(datosRegistro).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/estudiantes']);
      },
      error: (mensajeError) => {
        this.cargando = false;
        this.error = mensajeError;
      }
    });
  }
}
