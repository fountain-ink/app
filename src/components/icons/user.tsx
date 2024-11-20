"use client";

import type { Variants } from "framer-motion";
import { motion, useAnimation } from "framer-motion";

const pathVariant: Variants = {
  normal: { pathLength: 1, opacity: 1, pathOffset: 0 },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    pathOffset: [1, 0],
  },
};

const circleVariant: Variants = {
  normal: {
    pathLength: 1,
    pathOffset: 0,
    scale: 1,
  },
  animate: {
    pathLength: [0, 1],
    pathOffset: [1, 0],
    scale: [0.5, 1],
  },
};

const UserIcon = ({ animate = false, className }: { animate?: boolean; className?: string }) => {
  const controls = useAnimation();

  if (animate) {
    controls.start("animate");
  } else {
    controls.start("normal");
  }

  return (
    <div
      className={`cursor-pointer select-none p-2 rounded-md transition-colors duration-100 flex items-center justify-center ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.circle cx="12" cy="8" r="5" animate={controls} variants={circleVariant} />

        <motion.path
          d="M20 21a8 8 0 0 0-16 0"
          variants={pathVariant}
          transition={{
            delay: 0,
            duration: 0.4,
          }}
          animate={controls}
        />
      </svg>
    </div>
  );
};

export { UserIcon };
