import type { Route } from "./+types/login";
import Auth from "~/pages/auth";
import GuestRoute from "~/components/GuestRoute";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dapoer J21 - Login" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function AuthPage() {
  return (
    <GuestRoute>
      <Auth />
    </GuestRoute>
  );
}
