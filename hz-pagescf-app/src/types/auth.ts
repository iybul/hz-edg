// Authentication state interface
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  orgId: number | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// User interface - represents the authenticated user
export interface User {
  userId: number;
  email: string;
  name: string;
}

// JWT Payload interface - represents the data stored in the JWT token
export interface JwtPayload {
  user_id: number;
  email: string;
  name: string;
  org_id: number;
  exp: number;
  iat: number;
}

// Login credentials interface
export interface LoginCredentials {
  email: string;
  password: string;
}

// Registration credentials interface
export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}