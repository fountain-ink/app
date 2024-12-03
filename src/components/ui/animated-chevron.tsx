"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

type AnimatedChevronProps = {
  isOpen: boolean;
  color?: string;
  size?: number;
};

export const AnimatedChevron = ({ isOpen, color, size = 16 }: AnimatedChevronProps) => {
  return (
    <motion.div
      initial={false}
      animate={{ rotate: isOpen ? 180 : 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20, mass: 2 }}
    >
      <ChevronDown
        size={size}
        style={{ color }}
      />
    </motion.div>
  );
};