"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: React.ReactNode;
  type?: "full" | "content";
}

export const PageTransition = ({ children, type = "full" }: PageTransitionProps) => {
  const pathname = usePathname();

  if (type === "content") {
    return (
      <div style={{ position: "relative", width: "100%" }}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            duration: 0.2,
            ease: "easeInOut",
          }}
        >
          {children}
        </motion.div>
      </div>
    );
  }

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
