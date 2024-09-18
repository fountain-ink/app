"use client";

import { Button } from "./ui/button";

const ErrorPage = ({ error }: { error: string }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-full">
      <div className="text-6xl mb-4">(╥﹏╥)</div>
      <h1 className="text-3xl font-bold mb-4">Oops! Something went wrong</h1>
      <p className="text-xl mb-8">{error}</p>

      <Button onClick={() => window.location.reload()}>Try Again</Button>
    </div>
  );
};

export default ErrorPage;
