import { Section, Card } from '../ui';
import weddingData from '../../data/wedding-data.json';
import { motion } from 'framer-motion';

export const DressCode = () => {
  const { dressCode } = weddingData.practicalInfo;

  return (
    <Section
      id="dress-code"
      title="Dress Code"
      subtitle="Comment s'habiller pour célébrer avec nous"
      background="pastel"
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Hommes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-pastel-blue/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gold-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="font-heading text-2xl text-gold-dark mb-3">Hommes</h3>
            <p className="font-body text-gray-700">{dressCode.men}</p>
          </motion.div>

          {/* Femmes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-pastel-rose/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gold-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="font-heading text-2xl text-gold-dark mb-3">Femmes</h3>
            <p className="font-body text-gray-700">{dressCode.women}</p>
          </motion.div>

          {/* Enfants */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-pastel-peach/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gold-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-heading text-2xl text-gold-dark mb-3">Enfants</h3>
            <p className="font-body text-gray-700">{dressCode.children}</p>
          </motion.div>
        </div>

        {/* Note importante */}
        <Card className="bg-gradient-to-r from-gold/10 to-pastel-cream/50 text-center max-w-3xl mx-auto">
          <div className="flex items-start space-x-3 justify-center">
            <svg className="w-6 h-6 text-gold-dark flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="font-body text-gray-700 italic">
              {dressCode.note}
            </p>
          </div>
        </Card>
      </div>
    </Section>
  );
};
