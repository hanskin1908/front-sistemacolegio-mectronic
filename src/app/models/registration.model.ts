import { Student } from './student.model';
import { Subject } from './subject.model';
import { Professor } from './professor.model';

export interface Registration {
  id?: number;
  studentId: number;
  subjectId: number;
  registrationDate: Date;
  student?: Student;
  subject?: Subject;
}

export interface RegistrationRequest {
  studentId: number;
  subjectId: number;
  studentName?: string;
  subjectName?: string;
}

// Interfaces para filtrar registros por profesor
export interface ProfessorSubjectsFilter {
  professorId: number;
}

export interface ProfessorStudentsFilter {
  professorId: number;
  subjectId: number;
}

// Interfaces para respuestas filtradas
export interface ProfessorSubjectsResponse {
  subjects: Subject[];
  professorId: number;
}

export interface ProfessorStudentsResponse {
  registrations: Registration[];
  subjectId: number;
  professorId: number;
}