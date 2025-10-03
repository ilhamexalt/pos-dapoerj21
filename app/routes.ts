import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [

    // auth
    route("login", "routes/auth/login.tsx"),

    // pages
    index("routes/dashboard.tsx"),
    route("product", "routes/product.tsx"),
    route("cashier", "routes/cashier.tsx"),
    route("pos", "routes/pos.tsx")

] satisfies RouteConfig;