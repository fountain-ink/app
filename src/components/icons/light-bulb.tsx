"use client";

import { motion, useAnimation, type Variants } from "framer-motion";
import { useEffect } from "react";

const pathVariants: Variants = {
  normal: {
    opacity: 1,
    scale: 1,
  },
  animate: {
    opacity: [1, 0.9, 1],
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

const LightBulbIcon = ({ animate = false }: { animate?: boolean }) => {
  const controls = useAnimation();

  useEffect(() => {
    if (animate) {
      controls.start("animate");
    } else {
      controls.start("normal");
    }
  }, [animate]);

  return (
    <div
      className="cursor-pointer select-none hover:bg-accent rounded-md transition-colors duration-200 flex items-center justify-center"
      onMouseEnter={() => controls.start("animate")}
      onMouseLeave={() => controls.start("normal")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.path
          d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"
          variants={pathVariants}
          animate={controls}
        />
        <motion.path d="M9 18h6" variants={pathVariants} animate={controls} />
        <motion.path d="M10 22h4" variants={pathVariants} animate={controls} />
      </svg>
    </div>
  );
};

export { LightBulbIcon };
