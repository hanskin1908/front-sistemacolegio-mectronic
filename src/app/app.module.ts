import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JwtModule } from '@auth0/angular-jwt';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ListaMateriasComponente } from './componentes/asignaturas/lista-materias.componente';
import { RegistroComponente } from './componentes/autenticacion/registro.componente';

import { InicioSesionComponente } from './componentes/autenticacion/inicio-sesion.componente';
import { AuthInterceptorService } from './services/auth-interceptor.service';
import { ListaEstudiantesComponente } from './componentes/estudiantes/lista-estudiantes.componente';
import { FormularioEstudianteComponente } from './componentes/estudiantes/formulario-estudiante/formulario-estudiante.componente';
import { DetalleEstudianteComponente } from './componentes/estudiantes/detalle-estudiante.componente';
import { FormularioMateriaComponente } from './componentes/asignaturas/formulario-materia/formulario-materia.componente';
import { DetalleMateriaComponente } from './componentes/asignaturas/detalle-materia.componente';
import { FormularioProfesorComponente } from './componentes/profesores/formulario-profesor/formulario-profesor.componente';
import { ListaProfesoresComponente } from './componentes/profesores/lista-profesores/lista-profesores.componente';
import { CompanerosComponente } from './componentes/compartidos/companeros/companeros.componente';
import { CreditosEstudianteComponente } from './componentes/estudiantes/creditos-estudiante/creditos-estudiante.componente';
import { PerfilComponente } from './componentes/autenticacion/perfil.componente';
import { RegistroMateriasComponente } from './componentes/estudiantes/registro-materias/registro-materias.componente';
import { FormularioAsignaturaComponente } from './componentes/asignaturas/formulario-asignatura/formulario-asignatura.componente';

export function tokenGetter() {
  try {
    const userData = localStorage.getItem('userData');
    if (!userData) {
      return null;
    }
    const parsedData = JSON.parse(userData);
    return parsedData._token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

@NgModule({
  declarations: [
    AppComponent,
    ListaEstudiantesComponente,
    FormularioEstudianteComponente,
    DetalleEstudianteComponente,
    ListaMateriasComponente,
    DetalleMateriaComponente,
    FormularioMateriaComponente,
    ListaProfesoresComponente,
    FormularioProfesorComponente,
    InicioSesionComponente,
    RegistroComponente,


    CompanerosComponente,
    CreditosEstudianteComponente,
    PerfilComponente,
    RegistroMateriasComponente,
    FormularioAsignaturaComponente,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ['localhost:5000', 'localhost:2305'],
        disallowedRoutes: ['localhost:5000/api/auth/login', 'localhost:5000/api/auth/register', 'localhost:2305/api/auth/login', 'localhost:2305/api/auth/register']
      }
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true },
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }