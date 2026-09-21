import type { AuthResponse, AuthUser } from "~/src/types/auth";

import { MOCK_CLIENT, MOCK_PASSWORD, MOCK_USERS } from "~/src/mocks/auth.mock";

export type AuthErrorCode = "INVALID_CREDENTIALS" | "ROLE_MISMATCH";

export class AuthServiceError extends Error {
  code: AuthErrorCode;

  constructor(message: string, code: AuthErrorCode) {
    super(message);

    this.name = "AuthServiceError";

    this.code = code;
  }
}

function wait(duration = 450): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

/**
 * Dummy implementation.
 *
 * Signature sengaja menyerupai
 * service API nanti.
 */
export async function loginClient(input: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  await wait();

  const normalizedEmail = input.email.trim().toLowerCase();

  const user = MOCK_USERS.find(
    (item) => item.email.toLowerCase() === normalizedEmail,
  );

  if (!user || input.password !== MOCK_PASSWORD) {
    throw new AuthServiceError(
      "Email atau kata sandi tidak sesuai.",
      "INVALID_CREDENTIALS",
    );
  }

  if (user.role !== "CLIENT") {
    throw new AuthServiceError("Akun ini bukan akun Client.", "ROLE_MISMATCH");
  }

  return {
    access_token: "dummy-client-access-token",

    token_type: "Bearer",

    user,
  };
}

export function getCurrentClient(): AuthUser {
  return {
    ...MOCK_CLIENT,
  };
}
