export const ROUTES = {
  api: {
    auth: {
      path: "/api/auth/*",
    },
    businesses: {
      path: "/api/businesses",
    },
    businessNotes: {
      buildPath: (id: number | string) => `/api/businesses/${id}/notes`,
      path: "/api/businesses/:id/notes",
    },
    businessStatus: {
      buildPath: (id: number | string) => `/api/businesses/${id}/status`,
      path: "/api/businesses/:id/status",
    },
  },
  businessDetail: {
    buildPath: (id: number | string) => `/businesses/${id}`,
    label: (businessName?: string) => businessName || "Chi tiết doanh nghiệp",
    matchId: "routes/businesses.$id",
    path: "/businesses/:id",
    pattern: /^\/businesses\/[^/]+$/,
  },
  dashboard: {
    label: "Trang Quản Trị",
    path: "/",
  },
  invite: {
    label: "Mời Thành Viên",
    path: "/invite",
  },
  login: {
    label: "Đăng nhập",
    path: "/login",
  },
} as const;
