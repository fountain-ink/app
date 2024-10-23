"use client"; // Error components must be Client Components

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen gap-4">
      <h2>Something went wrong! ヾ(｡ꏿ﹏ꏿ)ﾉﾞ</h2>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
