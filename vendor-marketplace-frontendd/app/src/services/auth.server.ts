import type {
  ApiErrorResponse,
  ApiSuccessEnvelope,
  AuthResponse,
} from "~/src/types/auth";

const DEFAULT_API_BASE_URL =
  "https://api-vendor-marketplace.cciunitel.com/api/v1";

const API_BASE_URL = (process.env.API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(
  /\/+$/,
  "",
);

export type AuthErrorCode = "API_ERROR" | "ROLE_MISMATCH" | "INVALID_RESPONSE";

export class AuthServiceError extends Error {
  status: number;
  code: AuthErrorCode;

  constructor(
    message: string,
    status = 500,
    code: AuthErrorCode = "API_ERROR",
  ) {
    super(message);

    this.name = "AuthServiceError";
    this.status = status;
    this.code = code;
  }
}

function getErrorMessage(body: ApiErrorResponse | null): string {
  if (!body?.message) {
    return "Terjadi kesalahan. Silakan coba lagi.";
  }

  if (Array.isArray(body.message)) {
    return body.message.join(", ");
  }

  return body.message;
}

function unwrapAuthResponse(
  body: AuthResponse | ApiSuccessEnvelope<AuthResponse>,
): AuthResponse {
  const response =
    "data" in body && body.data ? body.data : (body as AuthResponse);

  if (!response?.access_token || !response?.user || !response.user.role) {
    throw new AuthServiceError(
      "Format respons login dari server tidak dikenali.",
      500,
      "INVALID_RESPONSE",
    );
  }

  return response;
}

export async function loginClient(input: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: input.email.trim(),
        password: input.password,
      }),
    });
  } catch {
    throw new AuthServiceError(
      "Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.",
      503,
    );
  }

  let body: unknown = null;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    throw new AuthServiceError(
      getErrorMessage(body as ApiErrorResponse | null),
      response.status,
    );
  }

  const auth = unwrapAuthResponse(
    body as AuthResponse | ApiSuccessEnvelope<AuthResponse>,
  );

  /**
   * /auth/login dipakai CLIENT + MERCHANT_OWNER + MERCHANT_ASSOCIATE.
   * Halaman ini khusus pintu CLIENT sehingga hasil login tetap harus
   * diverifikasi sebelum token dimasukkan ke session.
   */
  if (auth.user.role !== "CLIENT") {
    throw new AuthServiceError(
      "Akun ini bukan akun Client. Silakan masuk melalui portal Merchant.",
      403,
      "ROLE_MISMATCH",
    );
  }

  return auth;
}
