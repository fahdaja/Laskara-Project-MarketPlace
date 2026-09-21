import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [

  route("register/merchant", "src/pages/auth/RegisterMerchant.tsx"),
  route("register/client", "src/pages/auth/RegisterClient.tsx"),
  route("login", "src/pages/auth/Login.tsx"),

  layout("src/layouts/HomeLayout.tsx", [index("src/pages/LandingPage.tsx")]),
  layout("src/layouts/MerchantLayout.tsx", [
    route("merchant/gigs", "src/pages/merchant/Gigs.tsx"),
    route("merchant/gigs/create", "src/pages/merchant/AddGigs.tsx"),
    route("merchant/gigs/:id", "src/pages/merchant/GigsDetail.tsx"),
    route("merchant/dashboard", "src/pages/merchant/Dashboard.tsx"),
    route("merchant/messages", "src/pages/merchant/Messages.tsx"),
    route("merchant/orders", "src/pages/merchant/Orders.tsx"),
    route("merchant/orders/:id", "src/components/merchant/OrderDetail.tsx"),
    route("merchant/transactions", "src/pages/merchant/Transactions.tsx"),
    route("merchant/associates", "src/pages/merchant/Associates.tsx"),
    route("merchant/profile", "src/pages/merchant/StoreProfile.tsx"),
  ]),

] satisfies RouteConfig;
