import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  onClick?: () => void;
}

export const Card = ({ children, className = '', hover = true, delay = 0, onClick }: CardProps) => {
  const hoverAnimation = hover ? {
    scale: 1.02,
    boxShadow: '0 10px 30px rgba(212, 175, 55, 0.2)'
  } : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={hoverAnimation}
      onClick={onClick}
      className={`
        bg-white rounded-lg border-2 border-gold-light
        p-6 shadow-md transition-all duration-300
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};
