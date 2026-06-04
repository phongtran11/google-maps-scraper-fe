type RouteConfig = {
  buildPath?: (...args: (number | string)[]) => string;
  path: string;
};

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
  dashboard: {
    path: "/",
  },
  businesses: {
    path: "/businesses",
  },
  businessDetail: {
    buildPath: (id: number | string) => `/businesses/${id}`,
    path: "/businesses/:id",
  },
  invite: {
    path: "/invite",
  },
  login: {
    path: "/login",
  },
} as const satisfies Record<string, Record<string, RouteConfig> | RouteConfig>;
