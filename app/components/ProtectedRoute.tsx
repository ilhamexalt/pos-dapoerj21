import { Navigate } from "react-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "~/stores/auth";
import { isSessionValid } from "~/utils/auth";

type Props = {
  children: React.ReactElement;
  redirectTo?: string;
};

export default function ProtectedRoute({
  children,
  redirectTo = "/login",
}: Props) {
  const session = useAuthStore((s) => s.session);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  if (!isSessionValid(session)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
