import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AutenticacionServicio } from '../../servicios/autenticacion.servicio';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-inicio-sesion',
  templateUrl: './inicio-sesion.componente.html',
  styleUrls: ['./inicio-sesion.componente.css']
})
export class InicioSesionComponente implements OnInit {
  formularioInicioSesion!: FormGroup;
  cargando = false;
  error: string | null = null;
  urlRetorno: string = '/';
  accesoDenegado = false;

  constructor(
    private formBuilder: FormBuilder,
    private autenticacionServicio: AutenticacionServicio,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.formularioInicioSesion = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.urlRetorno = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.accesoDenegado = !!this.route.snapshot.queryParams['accessDenied'];

    if (this.accesoDenegado) {
      this.error = 'Acceso denegado. No tiene permisos para acceder a esta página.';
    }

    if (this.autenticacionServicio.estaAutenticado()) {
      this.router.navigate([this.urlRetorno]);
    }
  }

  enviar(): void {
    if (this.formularioInicioSesion.invalid) {
      return;
    }

    this.cargando = true;
    this.error = null;

    this.autenticacionServicio.login(this.formularioInicioSesion.value).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate([this.urlRetorno]);
      },
      error: (mensajeError) => {
        this.cargando = false;
        this.error = mensajeError;
      }
    });
  }
}
