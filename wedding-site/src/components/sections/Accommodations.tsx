import { Section, Card, Button } from '../ui';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import weddingData from '../../data/wedding-data.json';

export const Accommodations = () => {
  const { accommodations } = weddingData;
  const [showAll, setShowAll] = useState(false);

  const displayedAccommodations = showAll ? accommodations : accommodations.slice(0, 3);

  const getTypeLabel = (type: string) => {
    const labels = {
      hotel: 'Hôtel',
      gite: 'Gîte',
      chambre_hote: "Chambre d'hôtes",
      camping: 'Camping'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <Section
      id="hebergements"
      title="Vous loger"
      subtitle="Options d'hébergement pour le weekend"
      background="cream"
    >
      {/* Option sur place - Highlighted */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8"
      >
        <Card className="border-2 border-gold/30">
          <div className="flex items-start space-x-4">
            <div className="shrink-0">
              <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-gold-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-heading text-2xl text-gray-800 mb-3">Sur place au Domaine de Mont</h3>
              <div className="space-y-2 text-gray-700">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-gold shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="font-body">
                    <strong>Parking accessible aux camping-cars</strong> avec droit de stationner pour la nuit
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-gold shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="font-body">
                    <strong>Zone camping disponible</strong> pour ceux qui souhaitent amener leur tente
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-gold shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="font-body">
                    <strong>Sanitaires pour les campeurs</strong> (toilettes + douche) dans le château du domaine
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {displayedAccommodations.map((accommodation, index) => (
          <Card key={accommodation.id} delay={index * 0.1}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="inline-block px-3 py-1 bg-gold/20 text-gold-dark text-xs font-heading rounded-full mb-2">
                  {getTypeLabel(accommodation.type)}
                </span>
                <h3 className="font-heading text-xl text-gray-800">{accommodation.name}</h3>
              </div>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-body">{accommodation.capacity}</span>
              </div>

              <div className="flex items-center space-x-2 text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span className="font-body">{accommodation.distance}</span>
              </div>

              {accommodation.distanceFromVenue && (
                <div className="flex items-center space-x-2 text-gold-dark">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="font-body font-medium">{accommodation.distanceFromVenue} du domaine</span>
                </div>
              )}

              {accommodation.amenities && accommodation.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {accommodation.amenities.map((amenity, i) => (
                    <span key={i} className="text-xs bg-pastel-blue/20 text-gray-600 px-2 py-1 rounded">
                      {amenity}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <span className="font-body text-sm text-gray-500">{accommodation.priceRange}</span>
              {accommodation.website ? (
                <Button variant="ghost" href={accommodation.website} external className="text-sm px-4 py-2">
                  Voir
                </Button>
              ) : accommodation.phone ? (
                <a href={`tel:${accommodation.phone}`} className="text-sm text-gold hover:text-gold-dark">
                  Appeler
                </a>
              ) : null}
            </div>
          </Card>
          ))}
        </AnimatePresence>

        {showAll && (
          <>
            <motion.a
              href="https://www.airbnb.fr"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="inline-block px-3 py-1 bg-gold/20 text-gold-dark text-xs font-heading rounded-full mb-2">
                      Plateforme
                    </span>
                    <h3 className="font-heading text-xl text-gray-800">Airbnb</h3>
                  </div>
                </div>
                <div className="space-y-2 mb-4 text-sm">
                  <p className="font-body text-gray-600">Locations et chambres chez l'habitant dans toute la région</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="font-body text-sm text-gray-500">En ligne</span>
                  <Button variant="ghost" external className="text-sm px-4 py-2">
                    Voir
                  </Button>
                </div>
              </Card>
            </motion.a>

            <motion.a
              href="https://www.gites-de-france.com"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="inline-block px-3 py-1 bg-gold/20 text-gold-dark text-xs font-heading rounded-full mb-2">
                      Plateforme
                    </span>
                    <h3 className="font-heading text-xl text-gray-800">Gîtes de France</h3>
                  </div>
                </div>
                <div className="space-y-2 mb-4 text-sm">
                  <p className="font-body text-gray-600">Gîtes et chambres d'hôtes labellisés de qualité</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="font-body text-sm text-gray-500">En ligne</span>
                  <Button variant="ghost" external className="text-sm px-4 py-2">
                    Voir
                  </Button>
                </div>
              </Card>
            </motion.a>
          </>
        )}
      </div>

      {!showAll && accommodations.length > 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <button
            onClick={() => setShowAll(true)}
            className="inline-flex items-center space-x-2 px-8 py-4 bg-linear-to-r from-gold to-gold-dark text-white font-heading text-lg rounded-lg hover:from-gold-dark hover:to-gold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <span>Voir plus d'hébergements</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <p className="font-body text-gray-500 text-sm mt-3">
            {accommodations.length - 3} autres hébergements disponibles
          </p>
        </motion.div>
      )}

    </Section>
  );
};
