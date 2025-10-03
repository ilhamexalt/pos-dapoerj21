import Cashier from "~/pages/cashier";
import type { Route } from "./+types/cashier";
import ProtectedRoute from "~/components/ProtectedRoute";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dapoer J21 - Cashier" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function CashierPage() {
  return (
    <ProtectedRoute>
      <Cashier />
    </ProtectedRoute>
  );
}
