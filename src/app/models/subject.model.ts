import { Professor } from './professor.model';

export interface Subject {
  id: number;
  name: string;
  code: string;
  credits: number;
  professorId: number;
  professor?: Professor;
}