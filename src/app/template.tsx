"use client";

import { PageTransition } from "@/components/transition";
import { AnimatePresence } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <PageTransition>{children}</PageTransition>
    </AnimatePresence>
  );
}