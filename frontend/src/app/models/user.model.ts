export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  message: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}