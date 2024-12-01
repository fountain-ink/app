"use client";

import { LayoutGroup, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 0.3,
        ease: "easeInOut",
      }}
      style={{
        position: "relative",
        width: "100%",
      }}
    >
        {children}
    </motion.div>
  );
};