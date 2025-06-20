"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LookupPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/feedback");
  }, [router]);

  return <div className="flex justify-center py-8">Redirecting...</div>;
}
