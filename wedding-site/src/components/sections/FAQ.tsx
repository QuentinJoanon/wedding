import { Section, Card } from '../ui';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import weddingData from '../../data/wedding-data.json';

export const FAQ = () => {
  const { faq } = weddingData;
  const [openId, setOpenId] = useState<string | null>(null);

  const categories = {
    logistics: 'Logistique',
    accommodation: 'Hébergement',
    gifts: 'Cadeaux',
    children: 'Enfants',
    other: 'Autre'
  };

  const groupedFAQ = faq.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof faq>);

  return (
    <Section
      id="faq"
      title="Questions Fréquentes"
      subtitle="Vous avez des questions ? Nous avons les réponses !"
      background="white"
    >
      <div className="max-w-4xl mx-auto">
        {Object.entries(groupedFAQ).map(([category, items]) => (
          <div key={category} className="mb-8">
            <h3 className="font-heading text-2xl text-gold-dark mb-4">
              {categories[category as keyof typeof categories]}
            </h3>
            <div className="space-y-3">
              {items.map((item) => (
                <Card
                  key={item.id}
                  hover={false}
                  className="cursor-pointer"
                  onClick={() => setOpenId(openId === item.id ? null : item.id)}
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-heading text-lg text-gray-800 pr-4">
                      {item.question}
                    </h4>
                    <motion.svg
                      animate={{ rotate: openId === item.id ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-5 h-5 text-gold flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </div>
                  <AnimatePresence>
                    {openId === item.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="font-body text-gray-600 mt-3 pt-3 border-t border-gray-200">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Contact si question non trouvée */}
        <Card className="bg-gradient-to-r from-gold/10 to-pastel-peach/20 text-center mt-8">
          <p className="font-body text-gray-700">
            Votre question n'est pas ici ? N'hésitez pas à nous contacter directement !
          </p>
        </Card>
      </div>
    </Section>
  );
};
