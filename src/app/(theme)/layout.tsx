"use client";

import { usePathname } from "next/navigation";

const ThemeLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return <>{children}</>;
};

export default ThemeLayout;
