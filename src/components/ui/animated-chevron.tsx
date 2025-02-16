"use client";

import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";

type AnimatedChevronProps = {
  isOpen: boolean;
  color?: string;
  size?: number;
  direction?: "up" | "down";
  className?: string;
};

export const AnimatedChevron = ({ isOpen, color, size = 16, direction = "down", className }: AnimatedChevronProps) => {
  const initialRotation = direction === "up" ? 180 : 0;
  const rotateAmount = 180;

  return (
    <motion.div
      initial={{ rotate: initialRotation }}
      animate={{ rotate: isOpen ? initialRotation + rotateAmount : initialRotation }}
      transition={{ type: "spring", stiffness: 200, damping: 20, mass: 2 }}
      className={className}
    >
      <ChevronDown size={size} style={{ color }} />
    </motion.div>
  );
};
