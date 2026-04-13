/**
 * Contratos alinhados a `POST /api/auth/login` e `POST /api/auth/refresh` (chat-api).
 */
export interface AuthTokensResponse {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly tokenType: string;
  readonly accessExpiresIn: string;
  readonly refreshExpiresIn: string;
}

export interface LoginRequest {
  readonly code: string;
  readonly password: string;
}

export interface RefreshRequest {
  readonly refreshToken: string;
}

export interface LogoutRequestBody {
  readonly refreshToken: string;
}
