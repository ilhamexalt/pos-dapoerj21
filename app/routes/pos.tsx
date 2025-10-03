import Pos from "~/pages/pos";
import type { Route } from "./+types/pos";
import ProtectedRoute from "~/components/ProtectedRoute";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dapoer J21 - Pos" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function PosPage() {
  return (
    <ProtectedRoute>
      <Pos />
    </ProtectedRoute>
  );
}
