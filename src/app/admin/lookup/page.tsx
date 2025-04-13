"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LookupPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/feedback");
  }, [router]);

  return <div className="flex justify-center py-8">Redirecting...</div>;
} 