import { index, layout, prefix, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  route("login", "routes/login.tsx"),
  route("api/auth/*", "routes/api.auth.$.ts"),

  layout("routes/app-layout.tsx", [
    index("routes/dashboard.tsx"),
    route("invite", "routes/invite.tsx"),
    ...prefix("api", [
      ...prefix("businesses", [
        route("", "routes/api/businesses/index.ts"),
        route(":id/notes", "routes/api/businesses/$id.notes.ts"),
        route(":id/status", "routes/api/businesses/$id.status.ts"),
      ]),
    ]),
    ...prefix("businesses", [
      index("routes/businesses/index.tsx"),
      route(":id", "routes/businesses/$id.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
