import { motion } from 'framer-motion';

export const AnimatedNames = () => {
  return (
    <div className="relative inline-block">
      {/* Texte de base invisible pour garder l'espace */}
      <h1
        style={{ fontFamily: 'var(--font-family-script)' }}
        className="text-8xl md:text-[12rem] text-transparent"
      >
        Quentin & Élisa
      </h1>

      {/* SVG qui s'écrit puis se remplit */}
      <motion.svg
        viewBox="0 0 1000 250"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Texte qui se dessine (stroke) */}
        <motion.text
          x="50%"
          y="55%"
          fontSize="150"
          fontFamily="Great Vibes, cursive"
          fill="none"
          stroke="var(--color-gold-dark)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          textAnchor="middle"
          dominantBaseline="middle"
          strokeDasharray="2000"
          strokeDashoffset="2000"
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 6, ease: "easeInOut" }}
        >
          Quentin & Élisa
        </motion.text>

        {/* Texte qui se remplit progressivement après */}
        <motion.text
          x="50%"
          y="55%"
          fontSize="150"
          fontFamily="Great Vibes, cursive"
          fill="var(--color-gold-dark)"
          textAnchor="middle"
          dominantBaseline="middle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 5.5, duration: 1 }}
        >
          Quentin & Élisa
        </motion.text>
      </motion.svg>
    </div>
  );
};
