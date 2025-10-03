import type { Route } from "../+types/root";
import Product from "~/pages/product";
import ProtectedRoute from "~/components/ProtectedRoute";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dapoer J21 - Product" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function ProductPage() {
  return (
    <ProtectedRoute>
      <Product />
    </ProtectedRoute>
  );
}
