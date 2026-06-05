import { apiMethodNotAllowed } from "./responses.server";

type HTTPMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

/**
 * Validates that the request method is one of the allowed methods.
 * Throws a 405 Method Not Allowed Response if validation fails.
 */
export function validateMethod(request: Request, allowedMethods: HTTPMethod | HTTPMethod[]) {
  const method = request.method.toUpperCase();
  const methods = Array.isArray(allowedMethods) ? allowedMethods : [allowedMethods];
  const upperCaseMethods = methods.map((m) => m.toUpperCase());

  if (!upperCaseMethods.includes(method)) {
    throw apiMethodNotAllowed(
      `Method ${request.method} is not allowed. Only ${methods.join(", ")} is supported.`,
    );
  }
}
