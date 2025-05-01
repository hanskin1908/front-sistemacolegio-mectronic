export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  studentId?: number;
  professorId?: number;
  role: string;
}

export interface AuthResponse {
  token: string;
  expiresIn: number;
  userId: number;
  role: string;
  email: string;
  name: string;
  studentId?: number;
  professorId?: number;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  studentId?: number;
  professorId?: number;
}