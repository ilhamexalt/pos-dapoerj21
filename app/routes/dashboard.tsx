import type { Route } from "./+types/dashboard";
import Dashboard from "~/pages/dashboard";
import ProtectedRoute from "~/components/ProtectedRoute";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dapoer J21 - Dashboard" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
