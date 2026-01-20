import { useState, useEffect } from 'react';
import { Section, Card, Button } from '../ui';
import { fetchGifts, reserveGift } from '../../services/googleSheets';
import type { Gift } from '../../services/googleSheets';

export const GiftList = () => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [reservingId, setReservingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [reserveName, setReserveName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGifts();
  }, []);

  const loadGifts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGifts();
      setGifts(data);
    } catch {
      setError('Impossible de charger la liste de mariage');
    } finally {
      setLoading(false);
    }
  };

  const handleReserveClick = (gift: Gift) => {
    setSelectedGift(gift);
    setShowModal(true);
    setReserveName('');
  };

  const handleReserveConfirm = async () => {
    if (!selectedGift || !reserveName.trim()) return;

    setReservingId(selectedGift.id);
    const success = await reserveGift(selectedGift.id - 1, reserveName.trim());

    if (success) {
      // Recharger les données
      await loadGifts();
    }

    setReservingId(null);
    setShowModal(false);
    setSelectedGift(null);
    setReserveName('');
  };

  if (loading) {
    return (
      <Section
        id="liste-mariage"
        title="Liste de Mariage"
        subtitle="Votre présence est le plus beau des cadeaux !"
        background="white"
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
        </div>
      </Section>
    );
  }

  if (error || gifts.length === 0) {
    return (
      <Section
        id="liste-mariage"
        title="Liste de Mariage"
        subtitle="Votre présence est le plus beau des cadeaux !"
        background="white"
      >
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-body text-gray-600 text-lg">
            {error || 'La liste de mariage sera bientôt disponible.'}
          </p>
        </div>
      </Section>
    );
  }

  return (
    <Section
      id="liste-mariage"
      title="Liste de Mariage"
      subtitle="Votre présence est le plus beau des cadeaux !"
      background="white"
    >
      <div className="max-w-4xl mx-auto mb-8 text-center">
        <p className="font-body text-gray-600 text-lg">
          Si toutefois vous souhaitez nous gâter, voici quelques idées qui nous feraient plaisir :
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {gifts.map((gift, index) => {
          const isReserved = !!gift.reservePar;

          return (
            <Card key={gift.id} delay={index * 0.1} className="flex flex-col">
              {gift.image && (
                <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
                  <img
                    src={gift.image}
                    alt={gift.nom}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1">
                <h3 className="font-heading text-xl text-gray-800 mb-2">
                  {gift.nom}
                </h3>

                {gift.description && (
                  <p className="font-body text-gray-600 text-sm mb-3">
                    {gift.description}
                  </p>
                )}

                {gift.prix && (
                  <p className="font-body text-gold font-semibold mb-4">
                    {gift.prix}
                  </p>
                )}
              </div>

              <div className="mt-auto space-y-2">
                {isReserved ? (
                  <div className="bg-gray-100 text-gray-500 text-center py-2 px-4 rounded-lg text-sm">
                    ✓ Réservé par {gift.reservePar}
                  </div>
                ) : (
                  <>
                    {gift.lien && (
                      <Button
                        variant="secondary"
                        href={gift.lien}
                        external
                        className="w-full text-sm"
                      >
                        Voir le produit
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      onClick={() => handleReserveClick(gift)}
                      disabled={reservingId === gift.id}
                      className="w-full"
                    >
                      {reservingId === gift.id ? 'Réservation...' : 'Réserver ce cadeau'}
                    </Button>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal de réservation */}
      {showModal && selectedGift && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="font-heading text-2xl text-gray-800 mb-4">
              Réserver "{selectedGift.nom}"
            </h3>

            <p className="font-body text-gray-600 mb-4">
              Merci de nous indiquer votre nom pour que nous sachions qui a réservé ce cadeau.
            </p>

            <input
              type="text"
              value={reserveName}
              onChange={(e) => setReserveName(e.target.value)}
              placeholder="Votre nom"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none mb-4"
            />

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowModal(false);
                  setSelectedGift(null);
                  setReserveName('');
                }}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleReserveConfirm}
                disabled={!reserveName.trim() || reservingId === selectedGift.id}
                className="flex-1"
              >
                {reservingId === selectedGift.id ? 'Réservation...' : 'Confirmer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
};
