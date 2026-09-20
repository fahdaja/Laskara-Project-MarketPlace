import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("src/layouts/HomeLayout.tsx", [index("src/pages/LandingPage.tsx")]),

  route("login/client", "src/pages/auth/Login.tsx"),
] satisfies RouteConfig;
