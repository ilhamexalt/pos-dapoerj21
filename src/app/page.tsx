"use client";

import { useAuthStore } from "@/lib/store/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const checkUser = async () => {
      if (!user) {
        router.push("/login");
      } else {
        router.push("/admin");
      }
    };
    checkUser();
  }, [router]);

  return <div></div>;
}
