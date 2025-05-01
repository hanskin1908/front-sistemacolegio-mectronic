# Sistema de Registro de Estudiantes y Materias

## Descripción

Este sistema permite a los estudiantes registrarse en línea y adherirse a un programa de créditos académicos. La aplicación facilita la gestión de materias, profesores y estudiantes, permitiendo a los usuarios realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre estos recursos.

## Tecnologías Utilizadas

### Frontend
- **Angular**: Framework principal para el desarrollo del frontend
- **TypeScript**: Lenguaje de programación utilizado
- **RxJS**: Biblioteca para programación reactiva
- **Angular Material**: Componentes de UI con diseño Material Design
- **Bootstrap**: Framework CSS para diseño responsivo

### Arquitectura
- **Arquitectura por componentes**: Organización modular del código
- **Servicios**: Para la lógica de negocio y comunicación con el backend
- **Modelos**: Interfaces TypeScript para tipado fuerte
- **Guards**: Para protección de rutas y autorización
- **Interceptores HTTP**: Para manejo de tokens y errores

## Funcionalidades Principales

### 1. CRUD de Estudiantes
- Registro de nuevos estudiantes
- Visualización de lista de estudiantes
- Actualización de información de estudiantes
- Eliminación de registros de estudiantes

### 2. Sistema de Créditos Académicos
- Los estudiantes pueden adherirse a un programa de créditos
- Cada materia equivale a 3 créditos
- Límite máximo de 9 créditos por estudiante (3 materias)

### 3. Gestión de Materias
- El sistema cuenta con 10 materias disponibles
- Cada estudiante puede seleccionar hasta 3 materias
- Visualización de detalles de cada materia

### 4. Gestión de Profesores
- El sistema cuenta con 5 profesores
- Cada profesor dicta 2 materias
- Un estudiante no puede tener clases con el mismo profesor en diferentes materias

### 5. Visualización de Registros
- Los estudiantes pueden ver los registros de otros estudiantes
- Cada estudiante puede ver con quiénes compartirá cada clase (solo nombres)

## Estructura del Proyecto

### Modelos
- **Student**: Información básica del estudiante (nombre, email, matrícula)
- **Subject**: Detalles de las materias (nombre, código, créditos, profesor)
- **Professor**: Información de los profesores (nombre, email, departamento)
- **Registration**: Registro de estudiantes en materias

### Componentes Principales

#### Estudiantes
- **Lista de Estudiantes**: Muestra todos los estudiantes registrados
- **Formulario de Estudiante**: Permite crear/editar información de estudiantes
- **Detalle de Estudiante**: Muestra información detallada de un estudiante
- **Créditos de Estudiante**: Gestiona los créditos y materias de un estudiante

#### Materias
- **Lista de Materias**: Muestra todas las materias disponibles
- **Detalle de Materia**: Muestra información detallada de una materia
- **Formulario de Materia**: Permite crear/editar información de materias

#### Profesores
- **Lista de Profesores**: Muestra todos los profesores del sistema
- **Detalle de Profesor**: Muestra información detallada de un profesor

#### Autenticación
- **Login**: Permite a los usuarios iniciar sesión
- **Registro**: Permite a nuevos usuarios registrarse en el sistema

### Servicios

- **StudentService**: Gestiona operaciones CRUD para estudiantes
- **SubjectService**: Gestiona operaciones CRUD para materias
- **ProfessorService**: Gestiona operaciones CRUD para profesores
- **RegistrationService**: Gestiona el registro de estudiantes en materias
- **AuthService**: Maneja la autenticación y autorización

## Reglas de Negocio

1. Un estudiante solo puede registrarse en un máximo de 3 materias
2. Cada materia equivale a 3 créditos, por lo que un estudiante puede tener máximo 9 créditos
3. Un estudiante no puede tener clases con el mismo profesor en diferentes materias
4. Los estudiantes pueden ver la lista de compañeros con quienes compartirán cada clase
5. El sistema valida que no se excedan los límites de créditos al registrar materias

## Flujo de Usuario

1. El usuario se registra en el sistema proporcionando sus datos personales
2. Una vez autenticado, puede ver la lista de materias disponibles
3. El estudiante selecciona hasta 3 materias para registrarse
4. El sistema valida que no se excedan los límites de créditos y que no haya conflictos con profesores
5. El estudiante puede ver sus materias registradas y los compañeros de clase
6. El estudiante puede modificar sus registros (eliminar materias y agregar otras)

## Seguridad

- Autenticación basada en tokens JWT
- Protección de rutas mediante Guards de Angular
- Validación de formularios tanto en el cliente como en el servidor
- Interceptores HTTP para manejo de errores y tokens

## Consideraciones Técnicas

- La aplicación utiliza observables de RxJS para manejar operaciones asíncronas
- Se implementa manejo de errores centralizado
- La interfaz de usuario es responsiva y adaptable a diferentes dispositivos
- Se utilizan componentes reutilizables para mantener la consistencia en la UI