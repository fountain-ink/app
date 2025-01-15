"use client";

import { motion, useAnimation, type Variants } from "framer-motion";
import { useEffect } from "react";

const iconVariants: Variants = {
  normal: {
    scale: 1,
    rotate: 0,
  },
  animate: {
    scale: 1.05,
    rotate: [0, -7, 7, 0],
    transition: {
      rotate: {
        duration: 0.5,
        ease: 'easeInOut',
      },
      scale: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
      },
    },
  },
};

const MessageCircleIcon = ({ animate = false }: { animate?: boolean }) => {
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
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={iconVariants}
        animate={controls}
      >
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      </motion.svg>
    </div>
  );
};

export { MessageCircleIcon }; 
