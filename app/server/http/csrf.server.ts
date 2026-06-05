import { apiError } from "./responses.server";

const ALLOWED_ORIGIN = (() => {
  try {
    return new URL(process.env.BETTER_AUTH_URL!).origin;
  } catch {
    return "http://localhost:5173";
  }
})();

export function verifySameOrigin(request: Request) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method.toUpperCase())) return;

  const origin = request.headers.get("Origin");
  const referer = request.headers.get("Referer");

  const actualOrigin = origin || (referer ? new URL(referer).origin : null);

  if (!actualOrigin) {
    throw apiError("forbidden", "Forbidden: Missing Origin and Referer headers", 403);
  }

  if (actualOrigin !== ALLOWED_ORIGIN) {
    throw apiError("forbidden", "Forbidden: Invalid Origin", 403);
  }
}
