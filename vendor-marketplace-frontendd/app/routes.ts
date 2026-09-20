import { type RouteConfig, index, layout } from "@react-router/dev/routes";

export default [
  layout("src/layouts/HomeLayout.tsx", [
    index("src/pages/LandingPage.tsx"),
    
  ])
] satisfies RouteConfig;
