"use client";

import { PageTransition } from "@/components/navigation/page-transition";
import { AnimatePresence } from "motion/react";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <PageTransition type="content">{children}</PageTransition>
    </AnimatePresence>
  );
}
