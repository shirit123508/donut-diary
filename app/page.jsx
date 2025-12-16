"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../lib/useSession";

export default function Home() {
  const router = useRouter();
  const { session, loading } = useSession();

  useEffect(() => {
    if (loading) return;
    router.replace(session ? "/feed" : "/login");
  }, [loading, session, router]);

  return <div className="container"><div className="card">טוען…</div></div>;
}
