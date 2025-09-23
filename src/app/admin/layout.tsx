"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AdminLayout } from "@/components/admin-layout";
import { useAuthStore } from "@/lib/store/auth";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const supabase = createClient();

  const hydrateUser = useAuthStore((s) => s.hydrateUser);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      hydrateUser(user);
      console.log("Current user:", user);
      if (!user) {
        router.push("/login");
      }
    };
    checkUser();
  }, [router, supabase.auth]);

  return <AdminLayout>{children}</AdminLayout>;
}
