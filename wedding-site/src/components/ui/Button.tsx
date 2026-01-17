import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  disabled?: boolean;
  href?: string;
  external?: boolean;
}

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  href,
  external = false
}: ButtonProps) => {
  const baseStyles = `
    px-6 py-3 rounded-md font-heading text-lg
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: 'bg-gold hover:bg-gold-dark text-white shadow-md hover:shadow-lg',
    secondary: 'bg-pastel-rose hover:bg-pastel-peach text-gray-700 border-2 border-gold-light',
    ghost: 'bg-transparent hover:bg-pastel-cream text-gold-dark border-2 border-gold'
  };

  const classes = `${baseStyles} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <motion.a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={classes}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={classes}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      {children}
    </motion.button>
  );
};
