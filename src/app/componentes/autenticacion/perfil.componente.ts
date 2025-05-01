import { Component, OnInit } from '@angular/core';
import { AutenticacionServicio } from '../../servicios/autenticacion.servicio';
import { UserProfile } from '../../models/auth.model';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.componente.html',
  styleUrls: ['./perfil.componente.css']
})
export class PerfilComponente implements OnInit {
  perfil: UserProfile | null = null;
  cargando = true;
  error = '';

  constructor(private autenticacionServicio: AutenticacionServicio) { }

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.cargando = true;
    const usuarioActual = this.autenticacionServicio.obtenerValorUsuarioActual();
    
    if (!usuarioActual || !usuarioActual.id) {
      this.error = 'No se pudo cargar la informaciu00f3n del perfil';
      this.cargando = false;
      return;
    }

    this.autenticacionServicio.obtenerPerfilUsuario(usuarioActual.id).subscribe({
      next: (data) => {
        this.perfil = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el perfil: ' + err.message;
        this.cargando = false;
      }
    });
  }
}