import { motion } from 'framer-motion';

export const Venue = () => {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background image avec filtre monochrome */}
      <div
        className="absolute inset-0 bg-cover bg-center grayscale"
        style={{
          backgroundImage: 'url(/domaine-de-mont.avif)',
          filter: 'grayscale(100%) brightness(0.7)'
        }}
      />

      {/* Overlay gradient pour lisibilité */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

      {/* Contenu */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-heading text-5xl md:text-6xl text-white mb-6">
            Domaine de Mont
          </h2>

          <div className="w-24 h-1 bg-gold mx-auto mb-8" />

          <p className="font-body text-white/90 text-lg md:text-xl mb-4">
            Adresse à compléter
          </p>

          <a
            href="https://www.google.com/maps/place/Domaine+de+Mont/@47.1025627,3.6156236,17z/data=!4m13!1m2!2m1!1sdomaine+de+mont!3m9!1s0x47f1c1028dbdcf9b:0xab56d9938a491678!5m2!4m1!1i2!8m2!3d47.1025599!4d3.618197!15sCg9kb21haW5lIGRlIG1vbnSSAQ13ZWRkaW5nX3ZlbnVl4AEA!16s%2Fg%2F11rb5_4t8p?entry=ttu&g_ep=EgoyMDI2MDExMy4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/50 text-white hover:bg-white/20 transition-all duration-300 rounded-lg"
          >
            <span className="font-body">Découvrir le lieu</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
};
