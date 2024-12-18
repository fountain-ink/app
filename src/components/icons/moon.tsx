"use client";

import { motion, useAnimation, type Variants } from "framer-motion";
import { useEffect } from "react";

const pathVariants: Variants = {
  normal: { opacity: 1 },
  animate: (i: number) => ({
    transition: { delay: i * 0.1, duration: 0.3 },
  }),
};

const MoonIcon = ({ animate = false }: { animate?: boolean }) => {
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
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-moon"
        animate={controls}
        variants={{
          normal: {
            rotate: 0,
            transition: { duration: 0.3 },
          },
          animate: {
            rotate: [-25, 25, 0],
            transition: { duration: 0.5 },
          },
        }}
      >
        <motion.path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" variants={pathVariants} />
      </motion.svg>
    </div>
  );
};

export { MoonIcon };
