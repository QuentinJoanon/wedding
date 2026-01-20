import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SectionProps {
  children: ReactNode;
  id?: string;
  title?: string;
  subtitle?: string;
  background?: 'white' | 'cream' | 'pastel';
  className?: string;
}

export const Section = ({
  children,
  id,
  title,
  subtitle,
  background = 'white',
  className = ''
}: SectionProps) => {
  const backgrounds = {
    white: 'bg-white',
    cream: 'bg-pastel-cream',
    pastel: 'bg-gradient-to-br from-pastel-rose/10 via-pastel-peach/10 to-pastel-blue/10'
  };

  return (
    <section
      id={id}
      className={`min-h-screen py-20 px-4 ${backgrounds[background]} ${className}`}
    >
      <div className="max-w-7xl mx-auto">
        {title && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-5xl md:text-6xl text-gold-dark mb-4">
              {title}
            </h2>
            {subtitle && (
              <p className="font-body text-xl text-gray-600 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
            {/* Ligne décorative */}
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: 200 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="h-1 bg-gold mx-auto mt-6"
            />
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
};
