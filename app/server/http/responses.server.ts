export type ApiResponse<T = unknown> = {
  data: null | T;
  error: null | string;
  message: null | string;
};

/**
 * Helper to return a standard error JSON response.
 */
export function apiError(error: string, message: string, status = 400, init?: ResponseInit) {
  return Response.json(
    { data: null, error, message },
    {
      status,
      headers: { "Cache-Control": "no-store", ...init?.headers },
      ...init,
    },
  );
}

/**
 * Standard 405 Method Not Allowed response.
 */
export function apiMethodNotAllowed(message = "Phương thức không được hỗ trợ") {
  return apiError("method_not_allowed", message, 405);
}

/**
 * Standard 404 Not Found response.
 */
export function apiNotFound(message = "Không tìm thấy dữ liệu") {
  return apiError("not_found", message, 404);
}

/**
 * Standard 500 Internal Server Error response.
 */
export function apiServerError(
  message = "Lỗi máy chủ. Vui lòng thử lại sau.",
  error = "server_error",
) {
  return apiError(error, message, 500);
}

/**
 * Helper to return a successful 200/2xx JSON response.
 */
export function apiSuccess<T>(data: T, message: string = "success", init?: ResponseInit) {
  return Response.json(
    { data, error: null, message },
    {
      status: 200,
      ...init,
    },
  );
}

/**
 * Standard 401 Unauthorized response.
 */
export function apiUnauthorized(message = "Không có quyền truy cập") {
  return apiError("unauthorized", message, 401);
}
