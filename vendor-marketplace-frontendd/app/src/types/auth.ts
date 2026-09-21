export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN_VALIDATOR"
  | "ADMIN_FINANCE"
  | "CLIENT"
  | "MERCHANT_OWNER"
  | "MERCHANT_ASSOCIATE";


export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string | null;
  isSuspended?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: "Bearer" | string;
  user: AuthUser;
}

export interface ApiSuccessEnvelope<T> {
  status?: string;
  message?: string;
  data?: T;
}

export interface ApiErrorResponse {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}
