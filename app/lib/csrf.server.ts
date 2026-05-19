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

  if (!origin) return;

  if (origin !== ALLOWED_ORIGIN) {
    throw new Response("Forbidden", { status: 403 });
  }
}
