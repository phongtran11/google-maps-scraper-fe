export const ROUTES = {
  dashboard: {
    path: "/",
    label: "Trang Quản Trị",
  },
  login: {
    path: "/login",
    label: "Đăng nhập",
  },
  invite: {
    path: "/invite",
    label: "Mời Thành Viên",
  },
  businessDetail: {
    path: "/businesses/:id",
    pattern: /^\/businesses\/[^/]+$/,
    buildPath: (id: string | number) => `/businesses/${id}`,
    label: (businessName?: string) => businessName || "Chi tiết doanh nghiệp",
    matchId: "routes/businesses.$id",
  },
  api: {
    auth: {
      path: "/api/auth/*",
    },
    businesses: {
      path: "/api/businesses",
    },
    businessNotes: {
      path: "/api/businesses/:id/notes",
      buildPath: (id: string | number) => `/api/businesses/${id}/notes`,
    },
    businessStatus: {
      path: "/api/businesses/:id/status",
      buildPath: (id: string | number) => `/api/businesses/${id}/status`,
    },
  },
} as const;
