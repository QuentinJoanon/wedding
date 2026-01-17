import { Section, Card, Button } from '../ui';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const RSVP = () => {
  const [formData, setFormData] = useState({
    familyName: '',
    attending: '',
    guestCount: '1',
    childrenInfo: '',
    phone: '',
    dietary: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implémenter l'envoi avec Resend
    alert('Fonctionnalité RSVP à implémenter avec le backend Resend');
  };

  return (
    <Section
      id="rsvp"
      title="Confirmez votre Présence"
      subtitle="Merci de confirmer avant le [date à définir]"
      background="pastel"
    >
      <div className="max-w-2xl mx-auto">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom ou Famille */}
            <div>
              <label className="block font-heading text-gray-700 mb-2">
                Nom ou Famille *
              </label>
              <input
                type="text"
                required
                value={formData.familyName}
                onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gold-light rounded-md focus:border-gold focus:outline-none transition-colors"
                placeholder="Ex: Jean et Marie Dupont, Famille Dupont (Paris)"
              />
              <p className="text-sm text-gray-500 mt-1">
                Précisez un prénom
              </p>
            </div>

            {/* Présence */}
            <div>
              <label className="block font-heading text-gray-700 mb-2">
                Serez-vous présent(e) ? *
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="attending"
                    value="yes"
                    required
                    onChange={(e) => setFormData({ ...formData, attending: e.target.value })}
                    className="w-4 h-4 text-gold focus:ring-gold"
                  />
                  <span className="font-body">Oui, avec plaisir !</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="attending"
                    value="no"
                    onChange={(e) => setFormData({ ...formData, attending: e.target.value })}
                    className="w-4 h-4 text-gold focus:ring-gold"
                  />
                  <span className="font-body">Malheureusement non</span>
                </label>
              </div>
            </div>

            {/* Champs conditionnels si présent */}
            <AnimatePresence>
              {formData.attending === 'yes' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  {/* Grille 2 colonnes sur desktop */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Nombre de personnes */}
                    <div>
                      <label className="block font-heading text-gray-700 mb-2">
                        Combien serez-vous ? *
                      </label>
                      <select
                        value={formData.guestCount}
                        onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gold-light rounded-md focus:border-gold focus:outline-none transition-colors"
                        required
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'personne' : 'personnes'}</option>
                        ))}
                      </select>
                    </div>

                    {/* Téléphone */}
                    <div>
                      <label className="block font-heading text-gray-700 mb-2">
                        Téléphone <span className="text-gray-500 font-body text-sm">(facultatif)</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gold-light rounded-md focus:border-gold focus:outline-none transition-colors"
                        placeholder="06 XX XX XX XX"
                      />
                    </div>

                    {/* Nom et âge des enfants */}
                    <div>
                      <label className="block font-heading text-gray-700 mb-2">
                        Nom et âge des enfants en 2027
                      </label>
                      <textarea
                        value={formData.childrenInfo}
                        onChange={(e) => setFormData({ ...formData, childrenInfo: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gold-light rounded-md focus:border-gold focus:outline-none transition-colors"
                        rows={3}
                        placeholder="Ex: Léa (5 ans), Lucas (8 ans)"
                      />
                      <p className="text-sm text-gray-600 italic mt-2">
                        Les enfants de 3 à 10 ans seront gardés dans le château par une baby-sitter après le cocktail
                      </p>
                    </div>

                    {/* Régimes alimentaires */}
                    <div>
                      <label className="block font-heading text-gray-700 mb-2">
                        Régimes alimentaires ou allergies
                      </label>
                      <textarea
                        value={formData.dietary}
                        onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gold-light rounded-md focus:border-gold focus:outline-none transition-colors"
                        rows={3}
                        placeholder="Végétarien, allergies, etc."
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" variant="primary" className="w-full">
              Envoyer ma réponse
            </Button>
          </form>
        </Card>
      </div>
    </Section>
  );
};
