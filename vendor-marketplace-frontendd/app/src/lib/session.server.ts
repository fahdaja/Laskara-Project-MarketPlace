const AUTH_COOKIE_NAME = "vendor_marketplace_client_session";
const SESSION_MAX_AGE = 60 * 60; // JWT backend saat ini 1 jam

export function createAuthCookie(token: string): string {
  const parts = [
    `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_MAX_AGE}`,
  ];

  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

export function destroyAuthCookie(): string {
  const parts = [
    `${AUTH_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];

  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

export function getAuthToken(request: Request): string | null {
  const cookieHeader = request.headers.get("Cookie");

  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [name, ...value] = cookie.trim().split("=");

    if (name === AUTH_COOKIE_NAME) {
      return decodeURIComponent(value.join("="));
    }
  }

  return null;
}
