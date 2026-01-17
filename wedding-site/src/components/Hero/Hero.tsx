import { motion } from 'framer-motion';
import { AnimatedNames } from './AnimatedNames';

export const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-rose via-pastel-peach to-pastel-blue">
      <div className="text-center px-4">
        {/* Animation d'ouverture - Effet "wow" */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 1.2,
            ease: "easeOut"
          }}
          className="space-y-8"
        >
          {/* Noms des mariés - Animation SVG qui s'écrit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <AnimatedNames />
          </motion.div>

          {/* Date du mariage */}
          <motion.p
            className="font-body text-2xl md:text-3xl text-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            19 Juin 2027
          </motion.p>

          {/* SVG décoratif simple - exemple de path animation */}
          <motion.svg
            width="200"
            height="2"
            viewBox="0 0 200 2"
            className="mx-auto"
          >
            <motion.line
              x1="0"
              y1="1"
              x2="200"
              y2="1"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gold"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 1.2, duration: 1.5, ease: "easeInOut" }}
            />
          </motion.svg>

          {/* Call to action - Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.6 }}
            className="pt-8"
          >
            <p className="text-gray-600 text-sm uppercase tracking-wider">
              Faites défiler pour découvrir
            </p>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut"
              }}
              className="mt-4"
            >
              <svg
                className="w-6 h-6 mx-auto text-gold"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
