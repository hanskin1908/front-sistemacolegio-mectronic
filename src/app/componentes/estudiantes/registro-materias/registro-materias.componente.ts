import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Asignatura } from '../../../modelos/asignatura.modelo';
import { Inscripcion, SolicitudInscripcion } from '../../../modelos/inscripcion.modelo';
import { AsignaturaServicio } from '../../../servicios/asignatura.servicio';
import { InscripcionServicio } from '../../../servicios/inscripcion.servicio';
import { AutenticacionServicio } from '../../../servicios/autenticacion.servicio';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CreditosEstudianteComponente } from '../creditos-estudiante/creditos-estudiante.componente';

// Declaración para el objeto bootstrap global
declare var bootstrap: any;

@Component({
  selector: 'app-registro-materias',
  templateUrl: './registro-materias.componente.html',
  styleUrls: ['./registro-materias.componente.css']
})
export class RegistroMateriasComponente implements OnInit {
  @ViewChild(CreditosEstudianteComponente) componenteCreditos!: CreditosEstudianteComponente;
  
  formularioInscripcion!: FormGroup;
  asignaturasDisponibles: Asignatura[] = [];
  inscripcionesActuales: Inscripcion[] = [];
  asignaturas: Asignatura[] = []; // Para el cálculo de créditos
  cargando = false;
  error = '';
  exito = '';
  estudianteId: number = 0;
  maxAsignaturas = 3;
  asignaturaSeleccionadaId: number | null = null; // Para el modal de compañeros

  constructor(
    private formBuilder: FormBuilder,
    private asignaturaServicio: AsignaturaServicio,
    private inscripcionServicio: InscripcionServicio,
    private autenticacionServicio: AutenticacionServicio,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.iniciarFormulario();
    this.obtenerIdEstudianteActual();
  }

  iniciarFormulario(): void {
    this.formularioInscripcion = this.formBuilder.group({
      asignaturaId: [null, [Validators.required]]
    });
    
    // Agregar un listener para depurar cambios en el valor del formulario
    this.formularioInscripcion.get('asignaturaId')?.valueChanges.subscribe(value => {
      console.log('Valor de asignaturaId cambiado a:', value, 'tipo:', typeof value);
    });
  }

  obtenerIdEstudianteActual(): void {
    this.cargando = true;
    const usuario = this.autenticacionServicio.obtenerValorUsuarioActual();
    console.log('Usuario autenticado:', usuario);
    
    if (!usuario) {
      this.error = 'No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente.';
      this.cargando = false;
      return;
    }
    console.log('Debugging obtenerIdEstudianteActual',usuario);
    console.log('ID de estudiante:', usuario.studentId);
    
    if (usuario.role !== 'student') {
      this.error = 'Esta página es solo para estudiantes.';
      this.cargando = false;
      return;
    }
    
    if (!usuario.studentId) {
      // Si el usuario es estudiante pero no tiene studentId, intentamos obtenerlo del perfil
      this.autenticacionServicio.obtenerPerfilUsuario(usuario.id).subscribe({
        next: (perfil) => {
          console.log('Perfil obtenido:', perfil);
          if (perfil.studentId) {
            this.estudianteId = perfil.studentId;
            this.cargarInscripcionesActuales();
            this.cargarAsignaturasDisponibles();
          } else {
            this.error = 'No se pudo identificar al estudiante. Por favor, contacte al administrador.';
            this.cargando = false;
          }
        },
        error: (err) => {
          console.error('Error al obtener perfil:', err);
          this.error = 'Error al obtener información del estudiante: ' + err.message;
          this.cargando = false;
        }
      });
    } else {
      this.estudianteId = usuario.studentId;
      this.cargarInscripcionesActuales();
      this.cargarAsignaturasDisponibles();
    }
  }

  cargarInscripcionesActuales(): void {
    this.inscripcionServicio.obtenerInscripcionesEstudiante(this.estudianteId).subscribe({
      next: (inscripciones) => {
        this.inscripcionesActuales = inscripciones;
        console.log('Inscripciones actuales cargadas:', this.inscripcionesActuales);
        
        // Cargar las asignaturas del estudiante para el cu00e1lculo de cru00e9ditos
        this.asignaturaServicio.obtenerAsignaturasEstudiante(this.estudianteId).subscribe({
          next: (asignaturas) => {
            this.asignaturas = asignaturas;
            console.log('Asignaturas del estudiante cargadas:', this.asignaturas);
            this.cargando = false;
          },
          error: (err) => {
            this.error = 'Error al cargar asignaturas del estudiante';
            this.cargando = false;
            console.error(err);
          }
        });
      },
      error: (err) => {
        this.error = 'Error al cargar inscripciones actuales';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  cargarAsignaturasDisponibles(): void {
    this.asignaturaServicio.obtenerAsignaturas().subscribe({
      next: (asignaturas) => {
        // Filtrar materias ya registradas
        const idsAsignaturasRegistradas = this.inscripcionesActuales.map(reg => reg.materiaId);
        this.asignaturasDisponibles = asignaturas.filter(asignatura => !idsAsignaturasRegistradas.includes(asignatura.id));
       console.log('Asignaturas disponibles:', this.asignaturasDisponibles);
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar asignaturas disponibles';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.formularioInscripcion.invalid) {
      return;
    }

    this.cargando = true;
    this.error = '';
    this.exito = '';

    // Obtener y convertir el ID de la asignatura a número para asegurar la comparación correcta
    const asignaturaIdRaw = this.formularioInscripcion.value.asignaturaId;
    const asignaturaId = typeof asignaturaIdRaw === 'string' ? parseInt(asignaturaIdRaw, 10) : asignaturaIdRaw;
    
    console.log('Procesando inscripción de asignatura:', asignaturaId, 'tipo:', typeof asignaturaId); 
    console.log('Formulario completo:', this.formularioInscripcion.value);
    console.log('Asignaturas disponibles:', this.asignaturasDisponibles);
    
    // Verificar si ya tiene el máximo de materias
    if (this.inscripcionesActuales.length >= this.maxAsignaturas) {
      this.error = `No puedes registrar más de ${this.maxAsignaturas} materias`;
      this.cargando = false;
      return;
    }

    // Obtener la asignatura seleccionada para verificar sus créditos
    console.log('Buscando asignatura con ID:', asignaturaId);
    // Imprimir todas las asignaturas disponibles para depuración
    this.asignaturasDisponibles.forEach(a => {
      console.log(`Asignatura disponible - ID: ${a.id} (${typeof a.id}), Nombre: ${a.nombre}`);
    });
    
    const asignaturaSeleccionada = this.asignaturasDisponibles.find(a => a.id === asignaturaId);
    console.log('Asignatura seleccionada:', asignaturaSeleccionada);
    
    if (!asignaturaSeleccionada) {
      this.error = 'No se pudo encontrar la información de la materia seleccionada';
      this.cargando = false;
      return;
    }

    // Calcular el total de créditos actuales
    const creditosActuales = this.asignaturas.reduce((total, asignatura) => total + asignatura.creditos, 0);
    const nuevoTotalCreditos = creditosActuales + asignaturaSeleccionada.creditos;
    console.log('Créditos actuales:', creditosActuales, 'Nuevos créditos totales:', nuevoTotalCreditos);

    // Verificar si supera el límite de 9 créditos
    if (nuevoTotalCreditos > 9) {
      this.error = `No puedes registrar esta materia porque superarías el límite de 9 créditos. Actualmente tienes ${creditosActuales} créditos y esta materia tiene ${asignaturaSeleccionada.creditos} créditos.`;
      this.cargando = false;
      return;
    }

    // Verificar si ya tiene una materia con el mismo profesor
    this.verificarConflictoProfesor(asignaturaId).then(tieneConflicto => {
      if (tieneConflicto) {
        this.error = 'No puedes tener más de una materia con el mismo profesor';
        this.cargando = false;
        return;
      }

      // Proceder con el registro
      const solicitudInscripcion: SolicitudInscripcion = {
        estudianteId: this.estudianteId,
        materiaId: asignaturaId,
        nombreEstudiante: this.autenticacionServicio.obtenerValorUsuarioActual()?.name || '',
        nombreMateria: asignaturaSeleccionada?.nombre || ''
      };

      this.inscripcionServicio.inscribirAsignatura(solicitudInscripcion).subscribe({
        next: (inscripcion) => {
          this.exito = 'Materia registrada correctamente';
          this.cargando = false;
          this.formularioInscripcion.reset();
          // Recargar los datos
          this.cargarInscripcionesActuales();
          this.cargarAsignaturasDisponibles();          
          // Actualizar el componente de cru00e9ditos
          setTimeout(() => {
            if (this.componenteCreditos) {
              console.log('Actualizando componente de cru00e9ditos despuu00e9s de registrar materia');
              this.componenteCreditos.actualizarCreditos();
            } else {
              console.warn('No se pudo acceder al componente de cru00e9ditos');
            }
          }, 500); // Pequeu00f1o retraso para asegurar que el componente estu00e9 disponible
        },
        error: (err: any) => {
          this.error = err.message || 'Error al registrar la materia';
          this.cargando = false;
          console.error(err);
        }
      });
    }).catch(err => {
      this.error = 'Error al verificar conflictos de profesor';
      this.cargando = false;
      console.error(err);
    });
  }

  async verificarConflictoProfesor(nuevaAsignaturaId: number): Promise<boolean> {
    console.log('Verificando conflicto de profesor para asignatura ID:', nuevaAsignaturaId, 'tipo:', typeof nuevaAsignaturaId);
    
    // Si no hay registros actuales, no hay conflicto
    if (this.inscripcionesActuales.length === 0) {
      return false;
    }

    try {
      // Obtener la nueva materia
      const nuevaAsignatura = await firstValueFrom(this.asignaturaServicio.obtenerAsignatura(nuevaAsignaturaId));
      console.log('Nueva asignatura obtenida:', nuevaAsignatura);
      if (!nuevaAsignatura) return false;

      // Obtener las materias actuales
      const idsAsignaturasActuales = this.inscripcionesActuales.map(reg => reg.materiaId);
      console.log('IDs de asignaturas actuales:', idsAsignaturasActuales);
      const asignaturasActuales = await firstValueFrom(this.asignaturaServicio.obtenerAsignaturasPorIds(idsAsignaturasActuales));
      console.log('Asignaturas actuales obtenidas:', asignaturasActuales);
      if (!asignaturasActuales) return false;

      // Verificar si hay conflicto de profesor
      const tieneConflicto = asignaturasActuales.some(asignatura => asignatura.profesorId === nuevaAsignatura.profesorId);
      console.log('¿Tiene conflicto de profesor?', tieneConflicto);
      return tieneConflicto;
    } catch (error) {
      console.error('Error al verificar conflicto de profesor:', error);
      return false;
    }
  }

  desinscribirAsignatura(inscripcionId: number | undefined): void {
    if (!inscripcionId) {
      this.error = 'ID de inscripción no válido';
      return;
    }
    
    if (confirm('¿Estás seguro de que deseas eliminar esta materia?')) {
      this.cargando = true;
      this.error = '';
      this.exito = '';

      this.inscripcionServicio.desinscribirAsignatura(inscripcionId).subscribe({
        next: () => {
          this.exito = 'Materia eliminada correctamente';
          this.cargando = false;
          // Recargar los datos
          this.cargarInscripcionesActuales();
          this.cargarAsignaturasDisponibles();
        },
        error: (err) => {          
          // Actualizar el componente de créditos
          setTimeout(() => {
            if (this.componenteCreditos) {
              console.log('Actualizando componente de créditos después de eliminar materia');
              this.componenteCreditos.actualizarCreditos();
            } else {
              console.warn('No se pudo acceder al componente de créditos');
            }
          }, 500); // Pequeño retraso para asegurar que el componente esté disponible          this.error = 'Error al eliminar la materia';
          this.cargando = false;
          console.error(err);
        }
      });
    }
  }

  // Método para abrir el modal de compañeros
  abrirModalCompaneros(asignaturaId: number): void {
    if (!asignaturaId) {
      this.error = 'Error: No se pudo identificar la materia seleccionada';
      setTimeout(() => this.error = '', 3000); // Limpiar el mensaje después de 3 segundos
      return;
    }
    
    this.asignaturaSeleccionadaId = asignaturaId;
    
    try {
      // Asegurarse de que Bootstrap esté disponible
      if (typeof bootstrap === 'undefined') {
        console.error('Bootstrap no está disponible');
        this.error = 'Error al mostrar la ventana modal. Intente nuevamente.';
        setTimeout(() => this.error = '', 3000);
        return;
      }
      
      // Usar Bootstrap 5 para abrir el modal
      const elementoModal: HTMLElement | null = document.getElementById('modalCompaneros');
      if (elementoModal) {
        // Asegurarse de que cualquier modal previo se cierre
        const modalExistente = bootstrap.Modal.getInstance(elementoModal);
        if (modalExistente) {
          modalExistente.dispose();
        }
        
        // Crear una nueva instancia del modal con opciones específicas
        const opcionesModal = {
          backdrop: 'static',  // El modal no se cierra al hacer clic fuera
          keyboard: true,     // Se puede cerrar con la tecla ESC
          focus: true         // Enfoca el modal cuando se abre
        };
        
        const instanciaModal = new bootstrap.Modal(elementoModal, opcionesModal);
        
        // Asegurarse de que el modal esté visible
        elementoModal.style.display = 'block';
        elementoModal.style.zIndex = '1050';
        
        instanciaModal.show();
        
        // Verificar que el modal se haya abierto correctamente
        setTimeout(() => {
          if (elementoModal.classList.contains('show')) {
            console.log('Modal mostrado correctamente');
          } else {
            console.error('El modal no se mostró correctamente');
            this.error = 'Error al mostrar la lista de compañeros. Intente nuevamente.';
            setTimeout(() => this.error = '', 3000);
          }
        }, 500);
      } else {
        console.error('No se encontró el elemento del modal con ID: classmatesModal');
        this.error = 'Error al mostrar la lista de compañeros. Intente nuevamente.';
        setTimeout(() => this.error = '', 3000);
      }
    } catch (e) {
      console.error('Error al abrir el modal:', e);
      this.error = 'Error al mostrar la lista de compañeros. Intente nuevamente.';
      setTimeout(() => this.error = '', 3000);
    }
  }
}