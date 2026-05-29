import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  route("login", "routes/login.tsx"),
  route("api/auth/*", "routes/api.auth.$.ts"),

  layout("routes/app-layout.tsx", [
    index("routes/dashboard.tsx"),
    route("invite", "routes/invite.tsx"),
    route("api/businesses", "routes/api.businesses.ts"),
    route("api/businesses/:id/notes", "routes/api.businesses.$id.notes.ts"),
    route("api/businesses/:id/status", "routes/api.businesses.$id.status.ts"),
    route("businesses/:id", "routes/businesses.$id.tsx"),
  ]),
] satisfies RouteConfig;
