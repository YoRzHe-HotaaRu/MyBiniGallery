import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 16,
  },
  in: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'tween',
      ease: 'anticipate',
      duration: 0.45,
    },
  },
  out: {
    opacity: 0,
    y: 0,
    transition: {
      duration: 0,
    },
  },
} as const;

export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
