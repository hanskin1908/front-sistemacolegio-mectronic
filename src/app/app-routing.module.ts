import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaEstudiantesComponente } from './componentes/estudiantes/lista-estudiantes.componente';
import { DetalleEstudianteComponente } from './componentes/estudiantes/detalle-estudiante.componente';
import { ListaMateriasComponente } from './componentes/asignaturas/lista-materias.componente';
import { DetalleMateriaComponente } from './componentes/asignaturas/detalle-materia.componente';
import { FormularioAsignaturaComponente } from './componentes/asignaturas/formulario-asignatura/formulario-asignatura.componente';
import { InicioSesionComponente } from './componentes/autenticacion/inicio-sesion.componente';
import { RegistroComponente } from './componentes/autenticacion/registro.componente';
import { PerfilComponente } from './componentes/autenticacion/perfil.componente';
import { ListaProfesoresComponente } from './componentes/profesores/lista-profesores/lista-profesores.componente';
import { FormularioProfesorComponente } from './componentes/profesores/formulario-profesor/formulario-profesor.componente';
import { FormularioEstudianteComponente } from './componentes/estudiantes/formulario-estudiante/formulario-estudiante.componente';
import { RegistroMateriasComponente } from './componentes/estudiantes/registro-materias/registro-materias.componente';

import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { EstudianteGuard } from './guards/estudiante.guard';
import { MateriasEstudianteGuard } from './guards/materias-estudiante.guard';

const routes: Routes = [
  { path: '', redirectTo: '/materias', pathMatch: 'full' },

  { path: 'inicio-sesion', component: InicioSesionComponente },

  { path: 'registro', component: RegistroComponente },

  { path: 'perfil', component: PerfilComponente, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/materias', pathMatch: 'full' },
  { path: 'login', component: InicioSesionComponente },
  { path: 'inicio-sesion', component: InicioSesionComponente },
  { path: 'register', component: RegistroComponente },
  { path: 'registro', component: RegistroComponente },
  { path: 'profile', component: PerfilComponente, canActivate: [AuthGuard] },
  { path: 'perfil', component: PerfilComponente, canActivate: [AuthGuard] },
    
  { 
    path: 'estudiantes', 
    component: ListaEstudiantesComponente, 
    canActivate: [AuthGuard, EstudianteGuard]
  },
 
  { 
    path: 'estudiantes/nuevo', 
    component: FormularioEstudianteComponente, 
    canActivate: [AuthGuard, AdminGuard]
  },
  
  { 
    path: 'estudiantes/:id', 
    component: DetalleEstudianteComponente, 
    canActivate: [AuthGuard, EstudianteGuard]
  },
 
  { 
    path: 'estudiantes/:id/editar', 
    component: FormularioEstudianteComponente, 
    canActivate: [AuthGuard, AdminGuard]
  },

  { 
    path: 'profesores', 
    component: ListaProfesoresComponente, 
    canActivate: [AuthGuard]
  },
 
  { 
    path: 'profesores/nuevo', 
    component: FormularioProfesorComponente, 
    canActivate: [AuthGuard, AdminGuard]
  },
  
  { 
    path: 'profesores/:id/editar', 
    component: FormularioProfesorComponente, 
    canActivate: [AuthGuard, AdminGuard]
  },
  
  { 
    path: 'materias', 
    component: ListaMateriasComponente, 
    canActivate: [AuthGuard]
  },
  
  {
    path: 'materias/nueva',
    component: FormularioAsignaturaComponente,
    canActivate: [AuthGuard, AdminGuard]
  },
 
  {
    path: 'materias/:id/editar',
    component: FormularioAsignaturaComponente,
    canActivate: [AuthGuard, AdminGuard]
  },

  { 
    path: 'materias/:id', 
    component: DetalleMateriaComponente, 
    canActivate: [AuthGuard, MateriasEstudianteGuard]
  },
  
  { path: 'mis-materias',
    component: RegistroMateriasComponente,
    canActivate: [AuthGuard],
    data: { role: 'student' }
  },
  { path: '**', redirectTo: '/materias' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }